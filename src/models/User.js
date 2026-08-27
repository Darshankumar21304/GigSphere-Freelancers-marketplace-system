const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['client', 'freelancer', 'admin'], default: 'client' },
  phone: { type: String },
  location: { type: String },
  language: { type: String, default: 'English' },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      message: { type: Boolean, default: true },
      project: { type: Boolean, default: true },
      proposal: { type: Boolean, default: true },
      payment: { type: Boolean, default: true },
      review: { type: Boolean, default: true }
    },
    payment: {
      bankAccount: { type: String },
      upiId: { type: String },
      withdrawalPref: { type: String, default: 'Weekly' }
    },
    privacy: {
      profileVisibility: { type: String, default: 'Public' },
      onlineStatus: { type: Boolean, default: true },
      searchVisibility: { type: Boolean, default: true }
    },
    appearance: {
      theme: { type: String, default: 'system' }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
