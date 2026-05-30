const { body } = require('express-validator');

const productValidation = [
  body('productCode')
    .trim()
    .notEmpty().withMessage('Product code is required'),
  body('productName')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters')
    .matches(/^(?!\d+$).+/).withMessage('Product name cannot contain only numbers'),
  body('unitPrice')
    .notEmpty().withMessage('Unit price is required')
    .isFloat({ min: 0.01 }).withMessage('Unit price must be greater than zero')
    .toFloat(),
];

module.exports = { productValidation };
