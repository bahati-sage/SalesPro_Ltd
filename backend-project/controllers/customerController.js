const { validationResult } = require('express-validator');
const Customer = require('../models/Customer');

const createCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { customerNumber, firstName, lastName, telephone, address } = req.body;

    const existing = await Customer.findOne({ customerNumber });
    if (existing) {
      return res.status(400).json({ message: 'Customer number already exists' });
    }

    const customer = await Customer.create({
      customerNumber,
      firstName,
      lastName,
      telephone,
      address,
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { customerNumber: { $regex: search, $options: 'i' } },
          { telephone: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCustomer, getCustomers, getCustomerById };
