const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  gig_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  reviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
