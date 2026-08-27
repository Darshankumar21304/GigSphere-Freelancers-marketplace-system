const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');

// Get all projects
router.get('/', projectController.getAllProjects);

// Get single project by ID
router.get('/:id', projectController.getProjectById);

// Create a project (Temporarily public for demo)
router.post('/', projectController.createProject);

// Submit a proposal to a project
router.post('/:projectId/proposals', projectController.submitProposal);

module.exports = router;
