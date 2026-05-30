const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    trim: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required'],
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  salesDate: {
    type: Date,
    required: [true, 'Sales date is required'],
    validate: {
      validator: function (value) {
        return value <= new Date();
      },
      message: 'Sales date cannot be in the future',
    },
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['Cash', 'Mobile Money', 'Card', 'Bank Transfer'],
      message: '{VALUE} is not a valid payment method',
    },
  },
  quantityPurchased: {
    type: Number,
    required: [true, 'Quantity purchased is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer',
    },
  },
  totalAmountPaid: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Sale', saleSchema);
