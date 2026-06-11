const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const { upload, s3 } = require('../utils/s3');
const path = require('path');

// Helper function to process and upload to S3
const processAndUploadToS3 = async (file) => {
  const originalName = path.parse(file.originalname).name;
  let fileBuffer;
  let fileName;
  let contentType;

  if (file.mimetype.startsWith('image/')) {
    // Compress and convert to webp using sharp
    fileBuffer = await sharp(file.buffer)
      .resize({ width: 1000, withoutEnlargement: true }) // max width 1000px
      .webp({ quality: 80 }) // convert to webp
      .toBuffer();
    fileName = `products/${Date.now().toString()}-${originalName}.webp`;
    contentType = 'image/webp';
  } else {
    // Skip sharp for videos, PDFs, etc.
    fileBuffer = file.buffer;
    const originalExt = path.extname(file.originalname);
    fileName = `products/${Date.now().toString()}-${originalName}${originalExt}`;
    contentType = file.mimetype;
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read'
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location;
};

// Upload a single image to S3
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = await processAndUploadToS3(req.file);
    res.json({ imageUrl });
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ message: 'Failed to process and upload image' });
  }
});

// Upload multiple images to S3
router.post('/images', upload.array('images', 8), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const uploadPromises = req.files.map(file => processAndUploadToS3(file));
    const imageUrls = await Promise.all(uploadPromises);
    res.json({ imageUrls });
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ message: 'Failed to process and upload images' });
  }
});

module.exports = router;
