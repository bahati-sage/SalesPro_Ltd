const { validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const createSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { invoiceNumber, customerId, productId, salesDate, paymentMethod, quantityPurchased } = req.body;

    const existingInvoice = await Sale.findOne({ invoiceNumber });
    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const totalAmountPaid = quantityPurchased * product.unitPrice;

    const sale = await Sale.create({
      invoiceNumber,
      customerId,
      productId,
      salesDate: new Date(salesDate),
      paymentMethod,
      quantityPurchased,
      totalAmountPaid,
    });

    await Product.findByIdAndUpdate(productId, {
      $inc: { quantitySold: quantityPurchased },
    });

    const populatedSale = await Sale.findById(sale._id)
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('productId', 'productName productCode unitPrice');

    res.status(201).json(populatedSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSales = async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate && endDate) {
      query.salesDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.salesDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.salesDate = { $lte: new Date(endDate) };
    }

    const sales = await Sale.find(query)
      .populate('customerId', 'firstName lastName customerNumber telephone')
      .populate('productId', 'productName productCode unitPrice')
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customerId', 'firstName lastName customerNumber telephone address')
      .populate('productId', 'productName productCode unitPrice');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { customerId, productId, salesDate, paymentMethod, quantityPurchased } = req.body;

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const oldProductId = sale.productId;
    const oldQuantity = sale.quantityPurchased;

    let product;
    if (productId) {
      product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
    } else {
      product = await Product.findById(oldProductId);
    }

    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
    }

    const finalQuantity = quantityPurchased || sale.quantityPurchased;
    const finalProductId = productId || oldProductId;
    const unitPrice = product.unitPrice;
    const totalAmountPaid = finalQuantity * unitPrice;

    sale.customerId = customerId || sale.customerId;
    sale.productId = finalProductId;
    sale.salesDate = salesDate ? new Date(salesDate) : sale.salesDate;
    sale.paymentMethod = paymentMethod || sale.paymentMethod;
    sale.quantityPurchased = finalQuantity;
    sale.totalAmountPaid = totalAmountPaid;

    const updatedSale = await sale.save();

    if (String(oldProductId) !== String(finalProductId)) {
      await Product.findByIdAndUpdate(oldProductId, {
        $inc: { quantitySold: -oldQuantity },
      });
      await Product.findByIdAndUpdate(finalProductId, {
        $inc: { quantitySold: finalQuantity },
      });
    } else if (oldQuantity !== finalQuantity) {
      const diff = finalQuantity - oldQuantity;
      await Product.findByIdAndUpdate(finalProductId, {
        $inc: { quantitySold: diff },
      });
    }

    const populatedSale = await Sale.findById(updatedSale._id)
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('productId', 'productName productCode unitPrice');

    res.json(populatedSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    await Product.findByIdAndUpdate(sale.productId, {
      $inc: { quantitySold: -sale.quantityPurchased },
    });

    await Sale.findByIdAndDelete(req.params.id);

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSale, getSales, getSaleById, updateSale, deleteSale };
