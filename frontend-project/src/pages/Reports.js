import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import StatCard from '../components/common/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  const [dailyDate, setDailyDate] = useState(today);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  });
  const [weekEnd, setWeekEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + (6 - d.getDay()));
    return d.toISOString().split('T')[0];
  });
  const [monthYear, setMonthYear] = useState(currentYear);
  const [monthMonth, setMonthMonth] = useState(currentMonth);

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let data;
      if (activeTab === 'daily') {
        const res = await reportAPI.getDaily(dailyDate);
        data = res.data;
      } else if (activeTab === 'weekly') {
        if (!weekStart || !weekEnd) return;
        const res = await reportAPI.getWeekly(weekStart, weekEnd);
        data = res.data;
      } else {
        const res = await reportAPI.getMonthly(monthYear, monthMonth);
        data = res.data;
      }
      setReportData(data);
    } catch {
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatRwf = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency', currency: 'RWF', minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setReportData(null);
  };

  const handleGenerate = () => {
    fetchReport();
  };

  const tabs = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Generate and view sales reports</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {activeTab === 'daily' && (
            <input
              type="date" value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
              className="input-field w-44"
              max={today}
            />
          )}
          {activeTab === 'weekly' && (
            <>
              <input
                type="date" value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="input-field w-40"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date" value={weekEnd}
                onChange={(e) => setWeekEnd(e.target.value)}
                className="input-field w-40"
              />
            </>
          )}
          {activeTab === 'monthly' && (
            <>
              <select
                value={monthMonth}
                onChange={(e) => setMonthMonth(e.target.value)}
                className="input-field w-32"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {new Date(0, i).toLocaleString('en', { month: 'long' })}
                  </option>
                ))}
              </select>
              <input
                type="number" min="2020" max="2030"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="input-field w-24"
              />
            </>
          )}
          <button onClick={handleGenerate} className="btn-primary">
            Generate
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Generating report..." />
      ) : !reportData ? (
        <div className="card">
          <EmptyState
            title="No report data"
            message="Select a date range and click Generate to view the report."
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Sales" value={reportData.totalSales || 0} icon="💰" color="blue" />
            <StatCard title="Total Revenue" value={formatRwf(reportData.totalRevenue)} icon="📊" color="green" />
            <StatCard title="Products Sold" value={reportData.totalProductsSold || 0} icon="📦" color="purple" />
            {reportData.totalCustomersServed !== undefined && (
              <StatCard title="Customers Served" value={reportData.totalCustomersServed} icon="👥" color="orange" />
            )}
          </div>

          {activeTab === 'weekly' && reportData.productPerformance && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="card-header">Product Performance</h3>
                {Object.keys(reportData.productPerformance).length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(reportData.productPerformance).map(([name, val]) => ({
                          name: name.length > 15 ? name.slice(0, 15) + '...' : name,
                          quantity: val.quantity,
                          revenue: val.revenue,
                        }))}
                        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip />
                        <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">No data</p>
                )}
              </div>

              <div className="card">
                <h3 className="card-header">Daily Trends</h3>
                {Object.keys(reportData.dailyTrends || {}).length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(reportData.dailyTrends).map(([day, val]) => ({
                          name: new Date(day).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
                          revenue: val.revenue,
                        }))}
                        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">No data</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'monthly' && reportData.productStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="card-header">Product Statistics</h3>
                {reportData.productStats.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.productStats.map((p) => ({
                            name: p.name,
                            value: p.revenue,
                          }))}
                          cx="50%" cy="50%" outerRadius={80}
                          dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {reportData.productStats.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">No data</p>
                )}
              </div>

              <div className="card">
                <h3 className="card-header">Customer Statistics</h3>
                {reportData.customerStats?.length > 0 ? (
                  <div className="overflow-y-auto max-h-64">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="table-header">Customer</th>
                          <th className="table-header">Purchases</th>
                          <th className="table-header">Total Spent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {reportData.customerStats.map((c, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="table-cell">{c.name}</td>
                            <td className="table-cell">{c.purchases}</td>
                            <td className="table-cell font-medium">{formatRwf(c.totalSpent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">No data</p>
                )}
              </div>
            </div>
          )}

          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Sales Transactions</h3>
            </div>
            {reportData.sales?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="table-header">Invoice</th>
                      <th className="table-header">Customer</th>
                      <th className="table-header">Product</th>
                      <th className="table-header">Qty</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Payment</th>
                      <th className="table-header">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reportData.sales.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell font-medium">{s.invoiceNumber}</td>
                        <td className="table-cell">
                          {s.customerId?.firstName} {s.customerId?.lastName}
                        </td>
                        <td className="table-cell">{s.productId?.productName}</td>
                        <td className="table-cell">{s.quantityPurchased}</td>
                        <td className="table-cell font-medium">{formatRwf(s.totalAmountPaid)}</td>
                        <td className="table-cell">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {s.paymentMethod}
                          </span>
                        </td>
                        <td className="table-cell text-gray-500 text-xs">
                          {new Date(s.salesDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No sales in this period</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
