const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers, getCustomerById } = require('../controllers/customerController');
const { customerValidation } = require('../validators/customerValidator');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, customerValidation, createCustomer)
  .get(protect, getCustomers);

router.get('/:id', protect, getCustomerById);

module.exports = router;
