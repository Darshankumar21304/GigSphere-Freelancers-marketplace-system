const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

router.get('/history/:user1_id/:user2_id', messageController.getChatHistory);
router.post('/upload', upload.single('file'), messageController.uploadFile);

module.exports = router;
