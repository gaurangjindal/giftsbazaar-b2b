const express = require('express');
const router = express.Router();
const ProductRequest = require('../models/ProductRequest');

// GET all requests
router.get('/', async (req, res) => {
  try {
    const requests = await ProductRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new request
router.post('/', async (req, res) => {
  const request = new ProductRequest(req.body);
  try {
    const newRequest = await request.save();
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT (update status) a request
router.put('/:id', async (req, res) => {
  try {
    const updatedRequest = await ProductRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a request
router.delete('/:id', async (req, res) => {
  try {
    await ProductRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
