const { Project } = require('../models');

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('client_id', 'name email location');
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('client_id', 'name email location');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, budget, budgetType, skills, category, duration, deadline, experienceLevel, attachments } = req.body;
    
    const { User } = require('../models');
    let client_id = req.user ? (req.user.id || req.user._id) : null;
    
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
      title: title || 'Untitled Project',
      description: description || 'No description provided.',
      budget: String(budget || '0'),
      budgetType: budgetType || 'Fixed Price',
      skills: Array.isArray(skills) ? skills : [],
      category: category || 'General',
      duration: duration || '1 to 3 months',
      deadline: deadline || duration || '',
      experienceLevel: experienceLevel || 'Intermediate',
      attachments: Array.isArray(attachments) ? attachments : []
    });

    console.log('✅ Project Created Successfully:', newProject._id);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({ message: error.message || 'Server error creating project' });
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

    // Trigger Notification to Client (project owner)
    const { createNotification } = require('./notificationController');
    const senderName = newProposal.freelancer_name;
    await createNotification(
      project.client_id,
      'proposal',
      'New Proposal Received',
      `${senderName} has submitted a proposal of ₹${Number(bidAmount).toLocaleString()} for your project "${project.title}".`
    );

    res.status(201).json({ message: 'Proposal submitted successfully', project });
  } catch (error) {
    console.error('Error submitting proposal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const project = await Project.findByIdAndUpdate(id, { status }, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project status updated', project });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndUpdate(id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get projects for the logged-in client (with accepted proposal details)
const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await Project.find({ client_id: userId })
      .populate('client_id', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching client projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllProjects,
  getMyProjects,
  getProjectById,
  createProject,
  submitProposal,
  updateProjectStatus,
  deleteProject,
  updateProject
};
