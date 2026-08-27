const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: { type: String, default: '' },
  experience: { type: String, enum: ['Entry Level', '1-3 years', '3-5 years', '5+ years'], default: 'Entry Level' },
  availability: { type: String, enum: ['Full-time (40 hrs/week)', 'Part-time (20 hrs/week)', 'As needed'], default: 'Full-time (40 hrs/week)' },
  hourlyRate: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
