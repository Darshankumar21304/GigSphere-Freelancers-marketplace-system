const { Project, Contract, User, FreelancerProfile, Gig } = require('../models');
const { createNotification } = require('./notificationController');

// GET /api/proposals/received
exports.getReceivedProposals = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all projects owned by the client or containing submitted proposals
    const projects = await Project.find({
      $or: [
        { client_id: userId },
        { client_id: null },
        { 'proposals.0': { $exists: true } }
      ]
    });
    
    // Collect all freelancer IDs across proposals
    const freelancerIds = [];
    projects.forEach(p => {
      if (p.proposals && Array.isArray(p.proposals)) {
        p.proposals.forEach(pr => {
          if (pr.freelancer_id) freelancerIds.push(pr.freelancer_id);
        });
      }
    });

    const freelancers = await User.find({ _id: { $in: freelancerIds } }).select('-password_hash');
    const profiles = await FreelancerProfile.find({ user_id: { $in: freelancerIds } });
    const gigs = await Gig.find({ freelancer_id: { $in: freelancerIds } });
    const contracts = await Contract.find({ freelancer_id: { $in: freelancerIds } });

    // Aggregate proposals and inject parent project details & freelancer details
    const allProposals = [];
    projects.forEach(project => {
      if (project.proposals && Array.isArray(project.proposals)) {
        project.proposals.forEach(prop => {
          const flUser = freelancers.find(f => f._id.toString() === (prop.freelancer_id ? prop.freelancer_id.toString() : ''));
          const flProfile = profiles.find(p => p.user_id.toString() === (prop.freelancer_id ? prop.freelancer_id.toString() : ''));
          const flGigs = gigs.filter(g => g.freelancer_id.toString() === (prop.freelancer_id ? prop.freelancer_id.toString() : ''));
          const flContracts = contracts.filter(c => c.freelancer_id.toString() === (prop.freelancer_id ? prop.freelancer_id.toString() : ''));

          const realName = flUser?.name || prop.freelancer_name || 'Freelancer';
          const realTitle = flProfile?.title || flUser?.title || 'Freelancer';
          const realSkills = (flProfile?.skills && Array.isArray(flProfile.skills)) ? flProfile.skills : [];

          allProposals.push({
            _id: prop._id,
            id: prop._id,
            freelancer_id: prop.freelancer_id,
            freelancerName: realName,
            freelancer: {
              id: prop.freelancer_id || flUser?._id,
              _id: prop.freelancer_id || flUser?._id,
              name: realName,
              avatar: flUser?.avatar || flUser?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(realName)}&background=1a73e8&color=fff`,
              email: flUser?.email || '',
              title: realTitle,
              bio: flProfile?.bio || flUser?.bio || '',
              skills: realSkills,
              hourlyRate: flProfile?.hourlyRate || 0,
              category: flProfile?.category || '',
              experience: flProfile?.experience || '',
              availability: flProfile?.availability || '',
              rating: flProfile?.rating || 5.0,
              numReviews: flProfile?.numReviews || 0,
              totalEarnings: flProfile?.totalEarnings || 0,
              completedProjects: flProfile?.completedProjects || flContracts.filter(c => c.status === 'Completed').length,
              location: flUser?.location || flUser?.city || flUser?.state || flUser?.country || '',
              verificationStatus: flUser?.verificationStatus || 'Verified Pro',
              portfolioItems: flProfile?.portfolioItems || [],
              workExperience: flProfile?.workExperience || [],
              certifications: flProfile?.certifications || [],
              gigs: flGigs.map(g => ({
                _id: g._id,
                id: g._id,
                title: g.title,
                price: g.price,
                category: g.category,
                deliveryDays: g.deliveryDays,
                description: g.description,
                images: g.images,
                rating: g.rating || 5.0
              })),
              gigHistory: flContracts.map(c => ({
                _id: c._id,
                title: c.title || 'Marketplace Project',
                amount: c.amountPaid || c.amount || 0,
                status: c.status || 'Completed',
                date: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-IN') : 'Recent'
              }))
            },
            bidAmount: prop.bidAmount,
            coverLetter: prop.coverLetter,
            deliveryTime: prop.deliveryTime,
            status: prop.status || 'Pending',
            createdAt: prop.createdAt,
            project_id: project._id,
            projectId: project._id,
            projectTitle: project.title,
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
    const projects = await Project.find({ 'proposals.freelancer_id': userId }).populate('client_id', 'name email companyName avatar profilePhoto location');
    
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
          projectId: project._id,
          project_title: project.title,
          projectTitle: project.title,
          project_budget: project.budget,
          client_id: project.client_id,
          clientName: project.client_id?.companyName || project.client_id?.name || 'Client Partner',
          client: project.client_id
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

    // Ensure project is associated with the active client user
    if (!project.client_id) {
      project.client_id = userId;
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
