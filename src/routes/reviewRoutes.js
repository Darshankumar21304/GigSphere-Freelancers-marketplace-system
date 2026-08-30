const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, reviewController.createReview);
router.get('/', authMiddleware, reviewController.getReviews);
router.get('/client', authMiddleware, reviewController.getClientReviews);
router.get('/freelancer', authMiddleware, reviewController.getFreelancerReviews);

module.exports = router;
