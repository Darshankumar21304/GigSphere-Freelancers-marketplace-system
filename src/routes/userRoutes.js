const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

// Get all freelancers
router.get('/freelancers', userController.getFreelancers);

// Settings
router.get('/settings', authMiddleware, userController.getSettings);
router.put('/settings', authMiddleware, userController.updateSettings);

module.exports = router;
