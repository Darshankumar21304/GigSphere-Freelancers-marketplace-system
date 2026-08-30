const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');

// All admin routes require token authentication + admin role authorization
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Analytics & Overview
router.get('/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id/details', adminController.getUserDetailsAndPosts);
router.post('/users/auto-audit-all', adminController.autoAuditAllUsers);
router.put('/users/:id/block', adminController.toggleUserBlock);
router.put('/users/:id/flag-permanently', adminController.flagUserPermanently);
router.delete('/users/:id', adminController.deleteUser);

// Listing & Project Moderation
router.get('/listings', adminController.getAllListings);
router.delete('/projects/:id', adminController.deleteProject);

// Complaints & Dispute Resolution
router.get('/disputes', adminController.getDisputes);
router.post('/disputes/:id/resolve', adminController.resolveDispute);
router.post('/disputes/:id/message', adminController.addDisputeMessage);
router.post('/disputes/:id/ai-mediate', adminController.analyzeDisputeWithAi);

// AI Security & Fake Profile Detection Logs
router.get('/ai-security', adminController.getAiSecurityLogs);

// Live AI Analysis & Support Endpoints
router.post('/ai/scan-profile', adminController.scanProfileWithAi);
router.post('/ai/extract-skills', adminController.extractSkillsWithAi);
router.post('/ai/support-chat', adminController.askAiSupportAssistant);

// Freelancer Payout Withdrawal Approvals
router.get('/withdrawals', adminController.getAllWithdrawals);
router.put('/withdrawals/:id/approve', adminController.approveWithdrawal);

// KYC Verification Reviews
router.get('/kyc', adminController.getKycList);
router.put('/users/:id/kyc-review', adminController.reviewKycStatus);

module.exports = router;
