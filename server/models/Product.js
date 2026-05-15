const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // For backward compatibility with existing IDs
  Name: { type: String, required: true },
  'Product Code': String,
  'Sku Id': String,
  'Selling Price': String,
  'MRP': String,
  'Cost Price': String,
  'Quantity': String,
  'Packaging Length (in cm)': String,
  'Packaging Breadth (in cm)': String,
  'Packaging Height (in cm)': String,
  'Image 1': String,
  'Image 2': String,
  'Image 3': String,
  'Image 4': String,
  'Image 5': String,
  'Image 6': String,
  'Image 7': String,
  'Image 8': String,
  'attr_Theme': String,
  'Product Type': String,
  'Description': String,
  imageUrl: String, // Calculated or mapped primary image
  status: { type: String, default: 'draft', enum: ['live', 'draft'] },
  createdAt: { type: Date, default: Date.now }
}, { strict: false }); // Allow extra fields from CSV

module.exports = mongoose.model('Product', productSchema);
