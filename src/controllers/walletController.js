const { Transaction } = require('../models');

const getWalletData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch all transactions for the user
    const transactions = await Transaction.find({ user_id: userId }).sort({ createdAt: -1 });
    
    // Calculate balances
    let availableBalance = 0;
    let pendingClearance = 0;
    let inEscrow = 0;
    
    transactions.forEach(tx => {
      if (tx.type === 'earning' || tx.type === 'refund') {
        if (tx.status === 'completed') availableBalance += tx.amount;
        if (tx.status === 'pending') pendingClearance += tx.amount;
        if (tx.status === 'escrow') inEscrow += tx.amount;
      } else if (tx.type === 'withdrawal' || tx.type === 'payment') {
        if (tx.status === 'completed') availableBalance += tx.amount; // amount is negative
      }
    });

    res.json({
      balances: {
        available: availableBalance,
        pending: pendingClearance,
        escrow: inEscrow
      },
      transactions
    });
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // Verify sufficient balance
    // (In a real app, we would aggregate the completed earnings minus completed withdrawals)
    
    const withdrawal = await Transaction.create({
      user_id: userId,
      type: 'withdrawal',
      title: 'Withdrawal to Bank Account',
      amount: -amount,
      status: 'pending'
    });
    
    res.json(withdrawal);
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getWalletData,
  requestWithdrawal
};
