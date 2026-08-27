const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  related_entity_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'related_entity_model' },
  related_entity_model: { type: String, enum: ['Order', 'Contract', 'Payment'] },
  type: { type: String, enum: ['earning', 'withdrawal', 'payment', 'refund'], required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true }, // Positive for earnings/deposits, negative for withdrawals/payments
  status: { type: String, enum: ['pending', 'completed', 'failed', 'escrow'], default: 'pending' },
  reference: { type: String } // e.g., bank account info or client name for display
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
