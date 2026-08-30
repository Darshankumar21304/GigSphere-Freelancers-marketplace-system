const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

// Get all freelancers
router.get('/freelancers', userController.getFreelancers);

// Settings
router.get('/settings', authMiddleware, userController.getSettings);
router.put('/settings', authMiddleware, userController.updateSettings);
router.put('/kyc', authMiddleware, userController.submitKyc);

// Disputes API for Client & Freelancer
router.get('/disputes', authMiddleware, userController.getUserDisputes);
router.post('/disputes', authMiddleware, userController.fileNewDispute);
router.post('/disputes/:id/message', authMiddleware, userController.addUserDisputeMessage);

module.exports = router;
