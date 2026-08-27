const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');

// Dummy controllers for demonstration
const createGig = (req, res) => res.json({ message: 'Gig created by freelancer' });
const getAllGigs = (req, res) => res.json({ message: 'List of gigs' });
const deleteGig = (req, res) => res.json({ message: 'Gig deleted by admin' });
const orderGig = (req, res) => res.json({ message: 'Gig ordered by client' });

// Public route
router.get('/', getAllGigs);

// Freelancer route
router.post('/', authenticateToken, authorizeRoles('freelancer'), createGig);

// Client route
router.post('/:id/order', authenticateToken, authorizeRoles('client'), orderGig);

// Admin route
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteGig);

module.exports = router;
