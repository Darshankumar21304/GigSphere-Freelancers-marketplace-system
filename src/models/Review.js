const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  contract_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  reviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  projectTitle: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
