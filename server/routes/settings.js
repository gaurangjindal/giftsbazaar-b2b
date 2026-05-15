const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET visibility settings
router.get('/visibility', async (req, res) => {
  try {
    let settings = await Settings.findOne({ type: 'visibility' });
    if (!settings) {
      // Return default if not found
      return res.json({
        'Name': true,
        'Product Code': true,
        'Cost Price': true,
        'MRP': true,
        'Selling Price': true
      });
    }
    res.json(settings.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST/PUT visibility settings
router.post('/visibility', async (req, res) => {
  try {
    const result = await Settings.findOneAndUpdate(
      { type: 'visibility' },
      { data: req.body, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json(result.data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
