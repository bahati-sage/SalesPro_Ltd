const { body } = require('express-validator');

const phoneRegex = /^(\+2507[2389]\d{7}|07[2389]\d{7})$/;

const customerValidation = [
  body('customerNumber')
    .trim()
    .notEmpty().withMessage('Customer number is required'),
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('First name must contain only letters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Last name must contain only letters'),
  body('telephone')
    .trim()
    .notEmpty().withMessage('Telephone number is required')
    .matches(phoneRegex).withMessage('Invalid Rwanda phone number. Use +25078XXXXXXX, +25079XXXXXXX, 078XXXXXXX, or 079XXXXXXX'),
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 5, max: 200 }).withMessage('Address must be between 5 and 200 characters'),
];

module.exports = { customerValidation };
