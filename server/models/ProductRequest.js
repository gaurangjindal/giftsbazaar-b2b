const mongoose = require('mongoose');

const productRequestSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  whatsappNumber: String,
  isWhatsappSame: { type: Boolean, default: false },
  state: String,
  city: String,
  budgetRange: String,
  productUrls: String,
  uploadedImages: [String], // Array of URLs or base64 strings (initially)
  status: { type: String, default: 'pending', enum: ['pending', 'resolved'] },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date
});

module.exports = mongoose.model('ProductRequest', productRequestSchema);
