import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RevenueChart from '../components/charts/RevenueChart';
import SalesTrendChart from '../components/charts/SalesTrendChart';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await reportAPI.getDashboard();
        setStats(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const formatRwf = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your sales performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon="📦"
          color="purple"
        />
        <StatCard
          title="Total Sales"
          value={stats?.totalSales || 0}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={formatRwf(stats?.totalRevenue)}
          icon="📊"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={stats?.monthlySales} />
        <SalesTrendChart data={stats?.monthlySales} />
      </div>

      <div className="card">
        <h3 className="card-header">Recent Sales</h3>
        {stats?.recentSales?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Invoice</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{sale.invoiceNumber}</td>
                    <td className="table-cell">
                      {sale.customerId?.firstName} {sale.customerId?.lastName}
                    </td>
                    <td className="table-cell">{sale.productId?.productName}</td>
                    <td className="table-cell font-medium">{formatRwf(sale.totalAmountPaid)}</td>
                    <td className="table-cell text-gray-500">
                      {new Date(sale.salesDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No sales recorded yet</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
