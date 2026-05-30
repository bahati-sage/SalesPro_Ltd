const express = require('express');
const router = express.Router();
const { createSale, getSales, getSaleById, updateSale, deleteSale } = require('../controllers/saleController');
const { saleValidation } = require('../validators/saleValidator');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, saleValidation, createSale)
  .get(protect, getSales);

router.route('/:id')
  .get(protect, getSaleById)
  .put(protect, saleValidation, updateSale)
  .delete(protect, deleteSale);

module.exports = router;
