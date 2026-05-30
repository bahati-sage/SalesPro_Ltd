const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

const getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalSales = await Sale.countDocuments();

    const revenueResult = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmountPaid' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const recentSales = await Sale.find()
      .populate('customerId', 'firstName lastName')
      .populate('productId', 'productName')
      .sort({ createdAt: -1 })
      .limit(10);

    const monthlySales = await Sale.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$salesDate' },
            month: { $month: '$salesDate' },
          },
          total: { $sum: '$totalAmountPaid' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.json({
      totalCustomers,
      totalProducts,
      totalSales,
      totalRevenue,
      recentSales,
      monthlySales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      salesDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('customerId', 'firstName lastName')
      .populate('productId', 'productName unitPrice')
      .sort({ createdAt: -1 });

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmountPaid, 0);
    const totalProductsSold = sales.reduce((sum, s) => sum + s.quantityPurchased, 0);
    const uniqueCustomers = new Set(sales.map((s) => s.customerId._id.toString()));

    res.json({
      date: reportDate,
      totalSales: sales.length,
      totalRevenue,
      totalProductsSold,
      totalCustomersServed: uniqueCustomers.size,
      sales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWeeklyReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      salesDate: { $gte: start, $lte: end },
    })
      .populate('customerId', 'firstName lastName')
      .populate('productId', 'productName unitPrice')
      .sort({ salesDate: 1 });

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmountPaid, 0);
    const totalProductsSold = sales.reduce((sum, s) => sum + s.quantityPurchased, 0);

    const productPerformance = {};
    sales.forEach((s) => {
      const name = s.productId.productName;
      if (!productPerformance[name]) {
        productPerformance[name] = { quantity: 0, revenue: 0 };
      }
      productPerformance[name].quantity += s.quantityPurchased;
      productPerformance[name].revenue += s.totalAmountPaid;
    });

    const dailyTrends = {};
    sales.forEach((s) => {
      const day = s.salesDate.toISOString().split('T')[0];
      if (!dailyTrends[day]) {
        dailyTrends[day] = { revenue: 0, count: 0 };
      }
      dailyTrends[day].revenue += s.totalAmountPaid;
      dailyTrends[day].count += 1;
    });

    res.json({
      startDate: start,
      endDate: end,
      totalSales: sales.length,
      totalRevenue,
      totalProductsSold,
      productPerformance,
      dailyTrends,
      sales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    const sales = await Sale.find({
      salesDate: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate('customerId', 'firstName lastName')
      .populate('productId', 'productName unitPrice productCode')
      .sort({ salesDate: 1 });

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmountPaid, 0);
    const totalProductsSold = sales.reduce((sum, s) => sum + s.quantityPurchased, 0);

    const customerStats = {};
    sales.forEach((s) => {
      const id = s.customerId._id.toString();
      if (!customerStats[id]) {
        customerStats[id] = {
          name: `${s.customerId.firstName} ${s.customerId.lastName}`,
          purchases: 0,
          totalSpent: 0,
        };
      }
      customerStats[id].purchases += 1;
      customerStats[id].totalSpent += s.totalAmountPaid;
    });

    const productStats = {};
    sales.forEach((s) => {
      const id = s.productId._id.toString();
      if (!productStats[id]) {
        productStats[id] = {
          name: s.productId.productName,
          code: s.productId.productCode,
          quantity: 0,
          revenue: 0,
        };
      }
      productStats[id].quantity += s.quantityPurchased;
      productStats[id].revenue += s.totalAmountPaid;
    });

    res.json({
      year: parseInt(year),
      month: parseInt(month),
      totalSales: sales.length,
      totalRevenue,
      totalProductsSold,
      customerStats: Object.values(customerStats),
      productStats: Object.values(productStats),
      sales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getDailyReport, getWeeklyReport, getMonthlyReport };
