const { Review, Contract, Project, User, FreelancerProfile } = require('../models');
const { createNotification } = require('./notificationController');

// Helper to recalculate freelancer rating & review count
const updateFreelancerRatingStats = async (freelancerId) => {
  try {
    const reviews = await Review.find({ freelancer_id: freelancerId });
    const numReviews = reviews.length;
    const avgRating = numReviews > 0 
      ? Number((reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / numReviews).toFixed(1))
      : 5.0;

    await FreelancerProfile.findOneAndUpdate(
      { user_id: freelancerId },
      { rating: avgRating, numReviews }
    );
    await User.findByIdAndUpdate(
      freelancerId,
      { rating: avgRating, numReviews }
    );
  } catch (err) {
    console.error('Error updating freelancer rating stats:', err);
  }
};

// 1. Submit review on a completed contract, project, or freelancer hire
exports.createReview = async (req, res) => {
  try {
    const { contractId, projectId, freelancerId, rating, comment } = req.body;
    const reviewerId = req.user.id; // Hiring client

    if (!rating || !comment || !comment.trim()) {
      return res.status(400).json({ message: 'Rating (1-5) and comment are required.' });
    }

    let targetFreelancerId = freelancerId;
    let title = 'Project Delivery';
    let contractObj = null;
    let projectObj = null;

    if (contractId) {
      contractObj = await Contract.findById(contractId);
      if (contractObj) {
        targetFreelancerId = contractObj.freelancer_id;
        title = contractObj.title || title;
      }
    }

    if (!targetFreelancerId && projectId) {
      projectObj = await Project.findById(projectId);
      if (projectObj) {
        title = projectObj.title || title;
        const acceptedProp = projectObj.proposals?.find(p => p.status === 'Accepted');
        if (acceptedProp?.freelancer_id) {
          targetFreelancerId = acceptedProp.freelancer_id;
        } else if (acceptedProp?.freelancer_email) {
          const u = await User.findOne({ email: acceptedProp.freelancer_email });
          if (u) targetFreelancerId = u._id;
        }
      }
    }

    if (!targetFreelancerId) {
      return res.status(400).json({ message: 'Freelancer identification is required for submitting a review.' });
    }

    // Check duplicate review
    if (contractId) {
      const existing = await Review.findOne({ contract_id: contractId, reviewer_id: reviewerId });
      if (existing) {
        return res.status(400).json({ message: 'You have already submitted a review for this contract.' });
      }
    } else if (projectId) {
      const existing = await Review.findOne({ project_id: projectId, reviewer_id: reviewerId });
      if (existing) {
        return res.status(400).json({ message: 'You have already submitted a review for this project.' });
      }
    }

    const review = new Review({
      contract_id: contractObj ? contractObj._id : undefined,
      project_id: projectObj ? projectObj._id : undefined,
      reviewer_id: reviewerId,
      freelancer_id: targetFreelancerId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment.trim(),
      projectTitle: title
    });

    await review.save();

    // Recalculate freelancer rating stats
    await updateFreelancerRatingStats(targetFreelancerId);

    // Notify freelancer
    const reviewerName = req.user.name || 'A client';
    await createNotification(
      targetFreelancerId,
      'review',
      'New Client Review Received',
      `${reviewerName} submitted a ${rating}-star review for "${title}": "${comment.slice(0, 60)}..."`
    );

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
    const targetUserId = req.params.freelancerId || req.user.id;
    const reviews = await Review.find({ freelancer_id: targetUserId })
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

// 5. Respond to a review (for Freelancer)
exports.respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Response text is required.' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    if (review.freelancer_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the reviewed freelancer can post a response.' });
    }

    review.response = {
      text: text.trim(),
      createdAt: new Date()
    };

    await review.save();

    res.json({
      success: true,
      message: 'Response posted successfully!',
      review
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({ message: 'Error posting response to review.' });
  }
};
