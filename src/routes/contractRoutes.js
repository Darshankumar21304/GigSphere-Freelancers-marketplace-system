const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/active', authMiddleware, contractController.getActiveContracts);
router.put('/:contractId/milestones/:milestoneId/submit', authMiddleware, contractController.submitMilestone);

module.exports = router;
