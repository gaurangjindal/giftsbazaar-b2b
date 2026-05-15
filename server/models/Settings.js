const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  type: { type: String, default: 'visibility', unique: true },
  data: { type: Map, of: Boolean },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
