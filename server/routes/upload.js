const express = require('express');
const router = express.Router();
const { upload } = require('../utils/s3');

// Upload a single image to S3
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ imageUrl: req.file.location });
});

// Upload multiple images to S3
router.post('/images', upload.array('images', 8), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  const urls = req.files.map(file => file.location);
  res.json({ imageUrls: urls });
});

module.exports = router;
