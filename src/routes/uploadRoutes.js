const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { upload, validateFileSize } = require('../middleware/uploadMiddleware');
const authenticateToken = require('../middleware/authMiddleware');

// General Single File Upload (Image, PDF document, Video)
router.post('/single', authenticateToken, upload.single('file'), validateFileSize, uploadController.uploadSingleFile);

// General Multiple Files Upload (Max 5 files)
router.post('/multiple', authenticateToken, upload.array('files', 5), validateFileSize, uploadController.uploadMultipleFiles);

// User Profile Avatar Upload
router.post('/avatar', authenticateToken, upload.single('avatar'), validateFileSize, uploadController.uploadAvatar);

module.exports = router;
