const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById } = require('../controllers/productController');
const { productValidation } = require('../validators/productValidator');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, productValidation, createProduct)
  .get(protect, getProducts);

router.get('/:id', protect, getProductById);

module.exports = router;
