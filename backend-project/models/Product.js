const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: [true, 'Product code is required'],
    unique: true,
    trim: true,
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  quantitySold: {
    type: Number,
    default: 0,
    min: [0, 'Quantity sold cannot be negative'],
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0.01, 'Unit price must be greater than zero'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
