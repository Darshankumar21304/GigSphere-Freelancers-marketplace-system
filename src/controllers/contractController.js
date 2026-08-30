const { Contract } = require('../models');

// Get all active contracts for a user (either as client or freelancer)
const getActiveContracts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find contracts where user is either client or freelancer and status is not Cancelled
    const contracts = await Contract.find({
      $or: [{ client_id: userId }, { freelancer_id: userId }],
      status: { $ne: 'Cancelled' }
    }).populate('client_id', 'name email').populate('freelancer_id', 'name email').sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit a milestone for review
const submitMilestone = async (req, res) => {
  try {
    const { contractId, milestoneId } = req.params;
    const userId = req.user.id;

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // Verify user is the freelancer
    if (contract.freelancer_id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const milestone = contract.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

    milestone.status = 'Under Review';
    contract.status = 'Submitted for Review';

    await contract.save();

    // Trigger Notification to Client (project owner)
    const { createNotification } = require('./notificationController');
    const { User } = require('../models');
    const freelancer = await User.findById(userId).catch(() => null);
    const freelancerName = freelancer ? freelancer.name : 'The freelancer';

    await createNotification(
      contract.client_id,
      'project',
      'Milestone Submitted for Review',
      `${freelancerName} has marked "${milestone.title}" as completed and submitted it for your review.`
    );

    res.json(contract);
  } catch (error) {
    console.error('Error submitting milestone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
// Approve a milestone and release escrow payment to freelancer
const approveMilestone = async (req, res) => {
  try {
    const { contractId, milestoneId } = req.params;
    const userId = req.user.id;

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // Verify user is the client
    if (contract.client_id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to release escrow' });
    }

    const milestone = contract.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

    if (milestone.status === 'Completed') {
      return res.status(400).json({ message: 'Milestone payment has already been released' });
    }

    // Update milestone status
    milestone.status = 'Completed';
    
    // Check progress
    const allCompleted = contract.milestones.every(m => m.status === 'Completed');
    if (allCompleted) {
      contract.status = 'Completed';
    } else {
      contract.status = 'In Progress';
    }

    // Release escrow funds from client to freelancer
    const { User, Transaction } = require('../models');
    const clientUser = await User.findById(contract.client_id);
    const freelancerUser = await User.findById(contract.freelancer_id);

    if (clientUser && freelancerUser) {
      // Deduct from client's locked escrow
      clientUser.escrowBalance = Math.max(0, (clientUser.escrowBalance || 0) - milestone.amount);
      await clientUser.save();

      // Credit to freelancer's wallet balance
      freelancerUser.walletBalance = (freelancerUser.walletBalance || 0) + milestone.amount;
      await freelancerUser.save();

      // Record transaction history
      const transaction = new Transaction({
        user_id: contract.freelancer_id,
        type: 'payment',
        title: `Milestone Payment Released: ${milestone.title}`,
        amount: milestone.amount,
        status: 'completed',
        paymentMethod: 'Escrow Release'
      });
      await transaction.save();
    }

    await contract.save();

    // Trigger Notification for the Freelancer
    const { createNotification } = require('./notificationController');
    await createNotification(
      contract.freelancer_id,
      'system',
      'Milestone Payment Released',
      `Client has approved "${milestone.title}" and released payment of ₹${milestone.amount.toLocaleString()} to your wallet.`
    );

    res.json({ success: true, contract });
  } catch (error) {
    console.error('Error approving milestone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fund a milestone and lock money in Escrow
const fundMilestone = async (req, res) => {
  try {
    const { contractId, milestoneId } = req.params;
    const userId = req.user.id;

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // Verify user is the client
    if (contract.client_id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to fund escrow' });
    }

    const milestone = contract.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

    if (milestone.status !== 'Pending') {
      return res.status(400).json({ message: 'Milestone escrow is already funded or complete' });
    }

    const { User, Transaction } = require('../models');
    const clientUser = await User.findById(contract.client_id);

    if (!clientUser || (clientUser.walletBalance || 0) < milestone.amount) {
      return res.status(400).json({ message: `Insufficient wallet balance. Please deposit funds first. Required: ₹${milestone.amount.toLocaleString()}` });
    }

    // Move money from wallet to locked escrow
    clientUser.walletBalance -= milestone.amount;
    clientUser.escrowBalance = (clientUser.escrowBalance || 0) + milestone.amount;
    await clientUser.save();

    // Update milestone status
    milestone.status = 'In Progress';
    await contract.save();

    // Record transaction history
    const transaction = new Transaction({
      user_id: contract.client_id,
      type: 'escrow_fund',
      title: `Escrow Funded: ${milestone.title}`,
      amount: -Math.abs(milestone.amount),
      status: 'completed',
      paymentMethod: 'Wallet Balance'
    });
    await transaction.save();

    // Trigger Notification for the Freelancer
    const { createNotification } = require('./notificationController');
    await createNotification(
      contract.freelancer_id,
      'project',
      'Milestone Escrow Funded',
      `Client has funded escrow of ₹${milestone.amount.toLocaleString()} for milestone "${milestone.title}". You can start working now.`
    );

    res.json({ success: true, contract });
  } catch (error) {
    console.error('Error funding milestone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getActiveContracts,
  submitMilestone,
  approveMilestone,
  fundMilestone
};
