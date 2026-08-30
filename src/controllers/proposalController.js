const { Project, Contract } = require('../models');
const { createNotification } = require('./notificationController');

// GET /api/proposals/received
exports.getReceivedProposals = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all projects owned by the client
    const projects = await Project.find({ client_id: userId });
    
    // Aggregate proposals and inject parent project details
    const allProposals = [];
    projects.forEach(project => {
      if (project.proposals && Array.isArray(project.proposals)) {
        project.proposals.forEach(prop => {
          allProposals.push({
            _id: prop._id,
            id: prop._id,
            freelancer_id: prop.freelancer_id,
            freelancer_name: prop.freelancer_name,
            bidAmount: prop.bidAmount,
            coverLetter: prop.coverLetter,
            deliveryTime: prop.deliveryTime,
            status: prop.status || 'Pending',
            createdAt: prop.createdAt,
            project_id: project._id,
            project_title: project.title,
            project_budget: project.budget
          });
        });
      }
    });

    res.json(allProposals);
  } catch (error) {
    console.error('Error fetching received proposals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/proposals/my-proposals
exports.getMyProposals = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find projects where the current user submitted a proposal
    const projects = await Project.find({ 'proposals.freelancer_id': userId });
    
    const myProposals = [];
    projects.forEach(project => {
      const prop = project.proposals.find(p => p.freelancer_id && p.freelancer_id.toString() === userId.toString());
      if (prop) {
        myProposals.push({
          _id: prop._id,
          id: prop._id,
          bidAmount: prop.bidAmount,
          coverLetter: prop.coverLetter,
          deliveryTime: prop.deliveryTime,
          status: prop.status || 'Pending',
          createdAt: prop.createdAt,
          project_id: project._id,
          project_title: project.title,
          project_budget: project.budget,
          client_id: project.client_id
        });
      }
    });

    res.json(myProposals);
  } catch (error) {
    console.error('Error fetching my proposals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/proposals/:id/status
exports.updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Pending', 'Shortlisted', 'Accepted', 'Rejected'
    const userId = req.user.id;

    // Find the project containing this proposal
    const project = await Project.findOne({ 'proposals._id': id });
    if (!project) return res.status(404).json({ message: 'Proposal not found' });

    // Verify current user is the owner (client) of the project
    if (project.client_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update proposal status' });
    }

    const proposal = project.proposals.id(id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    proposal.status = status;
    await project.save();

    // Trigger Notification for the Freelancer
    if (proposal.freelancer_id) {
      let notifTitle = 'Proposal Updated';
      let notifDesc = `Your proposal status for "${project.title}" has been set to ${status}.`;

      if (status === 'Accepted' || status === 'Hired') {
        notifTitle = 'Proposal Accepted / Hired!';
        notifDesc = `Congratulations! You have been hired by the client for "${project.title}".`;

        // Update Project Status to In Progress
        project.status = 'In Progress';
        await project.save();

        // Create the active Contract document automatically for workspace mapping!
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + 30); // 30 days default duration

        await Contract.create({
          client_id: project.client_id,
          freelancer_id: proposal.freelancer_id,
          project_id: project._id,
          title: `Contract: ${project.title}`,
          status: 'In Progress',
          totalValue: proposal.bidAmount || Number(project.budget) || 0,
          deadline: deadlineDate,
          milestones: [
            {
              title: 'Phase 1: Project Initiation & Architecture Setup',
              amount: Math.round((proposal.bidAmount || Number(project.budget) || 0) * 0.4),
              deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              status: 'In Progress'
            },
            {
              title: 'Phase 2: Core Functional Delivery & QA Review',
              amount: Math.round((proposal.bidAmount || Number(project.budget) || 0) * 0.6),
              deadline: deadlineDate,
              status: 'Pending'
            }
          ]
        });
      }

      await createNotification(proposal.freelancer_id, 'project', notifTitle, notifDesc);
    }

    res.json({ message: 'Proposal status updated successfully', proposal });
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
