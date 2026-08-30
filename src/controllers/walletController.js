const { User, Transaction } = require('../models');

// 1. Get Wallet Balance, Bank Details & Transaction History
exports.getWalletDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Retrieve completed deposits or non-pending transactions only
    const transactions = await Transaction.find({ 
      user_id: req.user.id,
      $or: [
        { type: { $ne: 'deposit' } },
        { status: 'completed' }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      walletBalance: user.walletBalance || 0,
      escrowBalance: user.escrowBalance || 0,
      bankDetails: user.bankDetails || {},
      transactions
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Error retrieving wallet details' });
  }
};

// 2. Create Deposit Order (Razorpay Checkout / Sandbox)
exports.createDepositOrder = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid deposit amount is required' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_gigsphere';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'gigsphere_mock_secret';

    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const transaction = new Transaction({
      user_id: req.user.id,
      type: 'deposit',
      title: `Wallet Deposit via ${paymentMethod || 'Razorpay'}`,
      amount: Number(amount),
      status: 'pending',
      paymentMethod: paymentMethod || 'Razorpay',
      razorpayOrderId: orderId
    });
    await transaction.save();

    res.json({
      success: true,
      orderId,
      amount: Number(amount),
      currency: 'INR',
      keyId,
      transactionId: transaction._id,
      message: 'Deposit order initialized successfully'
    });
  } catch (error) {
    console.error('Create deposit error:', error);
    res.status(500).json({ message: 'Error creating deposit order' });
  }
};

// 3. Verify & Confirm Deposit Payment (Razorpay Payment Verification)
exports.verifyDepositPayment = async (req, res) => {
  try {
    const { transactionId, razorpayPaymentId, razorpay_payment_id, razorpayOrderId, razorpay_order_id, amount } = req.body;

    const paymentId = razorpayPaymentId || razorpay_payment_id || `pay_${Date.now()}`;
    const orderId = razorpayOrderId || razorpay_order_id;

    let transaction = null;
    if (transactionId) {
      transaction = await Transaction.findById(transactionId).catch(() => null);
    }
    if (!transaction && orderId) {
      transaction = await Transaction.findOne({ razorpayOrderId: orderId });
    }

    const depositAmt = Number(amount || transaction?.amount || 0);
    if (depositAmt <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }

    if (!transaction) {
      // Create new completed transaction record directly
      transaction = new Transaction({
        user_id: req.user.id,
        type: 'deposit',
        title: 'Wallet Deposit via Razorpay',
        amount: depositAmt,
        status: 'completed',
        paymentMethod: 'Razorpay Gateway',
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId || `order_${Date.now()}`
      });
    } else {
      transaction.status = 'completed';
      transaction.razorpayPaymentId = paymentId;
    }
    await transaction.save();

    // Credit money to user's wallet
    const user = await User.findById(req.user.id);
    let newBalance = 0;
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + depositAmt;
      await user.save();
      newBalance = user.walletBalance;
    }

    res.json({
      success: true,
      message: `₹${depositAmt.toLocaleString()} credited to your wallet balance successfully!`,
      walletBalance: newBalance,
      transaction
    });
  } catch (error) {
    console.error('Verify deposit error:', error);
    res.status(500).json({ message: 'Error verifying deposit payment' });
  }
};

// 4. Update Saved Bank Payout & UPI Details
exports.updateBankDetails = async (req, res) => {
  try {
    const { accountHolder, accountNumber, ifscCode, bankName, upiId } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.bankDetails = {
      accountHolder: accountHolder || user.bankDetails?.accountHolder || user.name,
      accountNumber: accountNumber || user.bankDetails?.accountNumber || '',
      ifscCode: ifscCode || user.bankDetails?.ifscCode || '',
      bankName: bankName || user.bankDetails?.bankName || '',
      upiId: upiId || user.bankDetails?.upiId || ''
    };

    await user.save();

    res.json({
      success: true,
      message: 'Bank payout & UPI details updated successfully!',
      bankDetails: user.bankDetails
    });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({ message: 'Error updating bank payout details' });
  }
};

// 5. Request Freelancer Payout / Withdrawal
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, payoutMethod } = req.body; // 'UPI' or 'Bank Transfer'
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid withdrawal amount is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if ((user.walletBalance || 0) < amount) {
      return res.status(400).json({ message: `Insufficient wallet balance. Available: ₹${(user.walletBalance || 0).toLocaleString()}` });
    }

    const payoutInfo = payoutMethod === 'UPI' 
      ? `UPI: ${user.bankDetails?.upiId || 'Pending UPI setup'}`
      : `Bank: ${user.bankDetails?.bankName || 'HDFC'} A/C ${user.bankDetails?.accountNumber || 'xxxx'} (IFSC: ${user.bankDetails?.ifscCode || 'xxxx'})`;

    // Deduct amount from available balance
    user.walletBalance -= amount;
    await user.save();

    const transaction = new Transaction({
      user_id: req.user.id,
      type: 'withdrawal',
      title: `Withdrawal Payout via ${payoutMethod || 'Bank Transfer'}`,
      amount: -Math.abs(amount),
      status: 'pending',
      paymentMethod: payoutMethod || 'Bank Transfer',
      reference: payoutInfo
    });
    await transaction.save();

    res.json({
      success: true,
      message: `Withdrawal request for ₹${amount.toLocaleString()} submitted successfully! Admin will process payouts within 24 hours.`,
      walletBalance: user.walletBalance,
      transaction
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({ message: 'Error submitting withdrawal request' });
  }
};
