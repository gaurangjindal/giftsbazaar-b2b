const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Import Routes
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const vendorRoutes = require('./routes/vendors');
const requestRoutes = require('./routes/requests');
const settingsRoutes = require('./routes/settings');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Use Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/settings', settingsRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/b2b-catalogue')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes placeholder
app.get('/', (req, res) => {
  res.send('B2B Catalogue API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
