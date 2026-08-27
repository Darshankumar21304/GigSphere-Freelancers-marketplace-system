const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, walletController.getWalletData);
router.post('/withdraw', authMiddleware, walletController.requestWithdrawal);

module.exports = router;
