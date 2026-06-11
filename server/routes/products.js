const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Simple In-Memory Cache
let productsCache = {
  data: null,
  timestamp: 0
};
// Set cache duration to 15 minutes (you can adjust this)
const CACHE_TTL = 1000 * 60 * 15;

const clearCache = () => {
  productsCache.data = null;
};

// GET all products
router.get('/', async (req, res) => {
  try {
    // Check if cache is valid
    if (productsCache.data && (Date.now() - productsCache.timestamp < CACHE_TTL)) {
      return res.json(productsCache.data);
    }
    
    // If not in cache, fetch from database (using .lean() for faster read performance)
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    
    // Save to cache
    productsCache.data = products;
    productsCache.timestamp = Date.now();
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new product
router.post('/', async (req, res) => {
  const product = new Product(req.body);
  try {
    const newProduct = await product.save();
    clearCache(); // Invalidate cache
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST bulk products (CSV upload)
router.post('/bulk', async (req, res) => {
  try {
    const products = req.body; // Expecting an array of products
    // Option 1: Delete all and replace (Fresh upload)
    // await Product.deleteMany({});
    // const result = await Product.insertMany(products);
    
    // Option 2: Upsert based on Product Code
    const operations = products.map(p => ({
      updateOne: {
        filter: { 'Product Code': p['Product Code'] },
        update: { $set: p },
        upsert: true
      }
    }));
    const result = await Product.bulkWrite(operations);
    clearCache(); // Invalidate cache
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT (update) a product
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    clearCache(); // Invalidate cache
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.params.id });
    clearCache(); // Invalidate cache
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE all products
router.delete('/', async (req, res) => {
  try {
    await Product.deleteMany({});
    clearCache(); // Invalidate cache
    res.json({ message: 'All products deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
