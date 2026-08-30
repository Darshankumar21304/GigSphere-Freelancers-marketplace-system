const express = require('express');
const router = express.Router();

router.get('/received', (req, res) => {
  res.json([]);
});

router.get('/my-proposals', (req, res) => {
  res.json([]);
});

router.patch('/:id/status', (req, res) => {
  res.json({ message: 'Proposal status updated', status: req.body.status });
});

module.exports = router;
