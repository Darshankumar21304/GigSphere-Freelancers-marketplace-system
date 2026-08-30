const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { upload, validateFileSize } = require('../middleware/uploadMiddleware');

router.get('/history/:user1_id/:user2_id', messageController.getChatHistory);
router.post('/upload', upload.single('file'), validateFileSize, messageController.uploadFile);

module.exports = router;
