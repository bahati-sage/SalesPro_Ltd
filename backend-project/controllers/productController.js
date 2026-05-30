const { validationResult } = require('express-validator');
const Product = require('../models/Product');

const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { productCode, productName, unitPrice } = req.body;

    const existing = await Product.findOne({ productCode });
    if (existing) {
      return res.status(400).json({ message: 'Product code already exists' });
    }

    const product = await Product.create({
      productCode,
      productName,
      unitPrice,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { productName: { $regex: search, $options: 'i' } },
          { productCode: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProduct, getProducts, getProductById };
