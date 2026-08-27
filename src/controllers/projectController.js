const { Project } = require('../models');

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('client_id', 'name email');
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, budget, budgetType, skills, category, duration, experienceLevel } = req.body;
    
    // In a real app, client_id comes from req.user._id (from auth middleware)
    // For demo purposes, we will find an existing client or create a dummy one if none provided
    const { User } = require('../models');
    let client_id = req.user ? req.user.id : null;
    
    if (!client_id) {
       let dummyClient = await User.findOne({ role: 'client' });
       if (!dummyClient) {
         dummyClient = await User.create({
           name: 'Demo Client',
           email: 'client@demo.com',
           password_hash: 'dummy',
           role: 'client'
         });
       }
       client_id = dummyClient._id;
    }

    const newProject = await Project.create({
      client_id,
      title,
      description,
      budget,
      budgetType,
      skills,
      category,
      duration,
      experienceLevel
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const submitProposal = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { bidAmount, coverLetter, deliveryTime, freelancerName } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const newProposal = {
      freelancer_id: req.user ? req.user.id : null,
      freelancer_name: freelancerName || (req.user ? req.user.name : 'Anonymous Freelancer'),
      bidAmount,
      coverLetter,
      deliveryTime,
      status: 'Pending'
    };

    project.proposals.push(newProposal);
    await project.save();

    res.status(201).json({ message: 'Proposal submitted successfully', project });
  } catch (error) {
    console.error('Error submitting proposal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllProjects,
  createProject,
  submitProposal
};
