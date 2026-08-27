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
    res.json(contract);
  } catch (error) {
    console.error('Error submitting milestone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getActiveContracts,
  submitMilestone
};
