const { body } = require('express-validator');

const saleValidation = [
  body('invoiceNumber')
    .trim()
    .notEmpty().withMessage('Invoice number is required'),
  body('customerId')
    .notEmpty().withMessage('Customer is required')
    .isMongoId().withMessage('Invalid customer ID'),
  body('productId')
    .notEmpty().withMessage('Product is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('salesDate')
    .notEmpty().withMessage('Sales date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('Sales date cannot be in the future');
      }
      return true;
    }),
  body('paymentMethod')
    .trim()
    .notEmpty().withMessage('Payment method is required')
    .isIn(['Cash', 'Mobile Money', 'Card', 'Bank Transfer']).withMessage('Invalid payment method'),
  body('quantityPurchased')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
    .toInt(),
];

module.exports = { saleValidation };
