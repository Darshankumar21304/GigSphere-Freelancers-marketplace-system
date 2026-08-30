const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/active', authMiddleware, contractController.getActiveContracts);
router.get('/hired', (req, res) => res.json([]));
router.put('/:contractId/milestones/:milestoneId/submit', authMiddleware, contractController.submitMilestone);
router.put('/:contractId/milestones/:milestoneId/approve', authMiddleware, contractController.approveMilestone);
router.put('/:contractId/milestones/:milestoneId/fund', authMiddleware, contractController.fundMilestone);

module.exports = router;
