const express = require('express');
const router = express.Router();
const { getDashboardStats, getDailyReport, getWeeklyReport, getMonthlyReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/daily', protect, getDailyReport);
router.get('/weekly', protect, getWeeklyReport);
router.get('/monthly', protect, getMonthlyReport);

module.exports = router;
