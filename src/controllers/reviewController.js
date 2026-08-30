const { Review, Contract, User } = require('../models');

// 1. Submit review on a completed contract
exports.createReview = async (req, res) => {
  try {
    const { contractId, rating, comment } = req.body;
    const reviewerId = req.user.id; // Must be the client

    if (!contractId || !rating || !comment) {
      return res.status(400).json({ message: 'Contract ID, rating, and comment are required.' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' });
    }

    // Verify current user is the client for this contract
    if (contract.client_id.toString() !== reviewerId) {
      return res.status(403).json({ message: 'Only the hiring client can review this contract.' });
    }

    // Verify contract is completed
    if (contract.status !== 'Completed') {
      return res.status(400).json({ message: 'Reviews can only be submitted for completed contracts.' });
    }

    // Check if review already exists for this contract
    const existingReview = await Review.findOne({ contract_id: contractId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already submitted a review for this contract.' });
    }

    const review = new Review({
      contract_id: contractId,
      reviewer_id: reviewerId,
      freelancer_id: contract.freelancer_id,
      rating: Number(rating),
      comment,
      projectTitle: contract.title
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Error submitting review.' });
  }
};

// 2. Get reviews written by client (given)
exports.getClientReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer_id: req.user.id })
      .populate('freelancer_id', 'name firstName lastName avatar email role companyName title')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get client reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews.' });
  }
};

// 3. Get reviews received by freelancer
exports.getFreelancerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ freelancer_id: req.user.id })
      .populate('reviewer_id', 'name firstName lastName avatar companyName industry')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get freelancer reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews.' });
  }
};

// 4. Get reviews unified handler based on user role
exports.getReviews = async (req, res) => {
  try {
    if (req.user.role === 'client') {
      const reviews = await Review.find({ reviewer_id: req.user.id })
        .populate('freelancer_id', 'name firstName lastName avatar email role companyName title')
        .sort({ createdAt: -1 });
      res.json(reviews);
    } else {
      const reviews = await Review.find({ freelancer_id: req.user.id })
        .populate('reviewer_id', 'name firstName lastName avatar companyName industry')
        .sort({ createdAt: -1 });
      res.json(reviews);
    }
  } catch (error) {
    console.error('Unified reviews fetch error:', error);
    res.status(500).json({ message: 'Error fetching reviews.' });
  }
};
