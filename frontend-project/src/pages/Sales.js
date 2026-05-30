import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { saleAPI, customerAPI, productAPI } from '../services/api';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';

const initialForm = {
  invoiceNumber: '',
  customerId: '',
  productId: '',
  salesDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'Cash',
  quantityPurchased: 1,
};

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editSale, setEditSale] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const fetchSales = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await saleAPI.getAll(params);
      setSales(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchDropdowns = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        customerAPI.getAll(),
        productAPI.getAll(),
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch {}
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => fetchSales(), 300);
    return () => clearTimeout(timer);
  }, [fetchSales]);

  const selectedProduct = products.find((p) => p._id === form.productId);

  useEffect(() => {
    if (form.productId && form.quantityPurchased && selectedProduct) {
      setCalculatedTotal(form.quantityPurchased * selectedProduct.unitPrice);
    } else {
      setCalculatedTotal(0);
    }
  }, [form.productId, form.quantityPurchased, selectedProduct]);

  const openAddModal = async () => {
    setEditSale(null);
    setForm(initialForm);
    setErrors({});
    setCalculatedTotal(0);
    await fetchDropdowns();
    setModalOpen(true);
  };

  const openEditModal = async (sale) => {
    setEditSale(sale);
    setForm({
      invoiceNumber: sale.invoiceNumber,
      customerId: sale.customerId._id,
      productId: sale.productId._id,
      salesDate: new Date(sale.salesDate).toISOString().split('T')[0],
      paymentMethod: sale.paymentMethod,
      quantityPurchased: sale.quantityPurchased,
    });
    setErrors({});
    await fetchDropdowns();
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.invoiceNumber.trim()) errs.invoiceNumber = 'Required';
    if (!form.customerId) errs.customerId = 'Select a customer';
    if (!form.productId) errs.productId = 'Select a product';
    if (!form.salesDate) errs.salesDate = 'Required';
    else if (new Date(form.salesDate) > new Date()) errs.salesDate = 'Cannot be in the future';
    if (!form.quantityPurchased || form.quantityPurchased < 1) errs.quantityPurchased = 'Must be at least 1';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        salesDate: new Date(form.salesDate).toISOString(),
        quantityPurchased: parseInt(form.quantityPurchased),
      };

      if (editSale) {
        await saleAPI.update(editSale._id, payload);
        toast.success('Sale updated successfully');
      } else {
        await saleAPI.create(payload);
        toast.success('Sale recorded successfully');
      }

      setModalOpen(false);
      fetchSales();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await saleAPI.delete(deleteTarget._id);
      toast.success('Sale deleted successfully');
      setDeleteTarget(null);
      fetchSales();
    } catch {
    } finally {
      setDeleting(false);
    }
  };

  const formatRwf = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency', currency: 'RWF', minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales</h1>
          <p className="text-sm text-gray-500 mt-1">Record and manage sales transactions</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">+ New Sale</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by invoice..." />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : sales.length === 0 ? (
          <EmptyState
            title="No sales found"
            message="Record your first sale to get started."
            action={<button onClick={openAddModal} className="btn-primary">New Sale</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-header">Invoice</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">Qty</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Payment</th>
                  <th className="table-header">Date</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sales.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{s.invoiceNumber}</td>
                    <td className="table-cell">
                      {s.customerId?.firstName} {s.customerId?.lastName}
                    </td>
                    <td className="table-cell">{s.productId?.productName}</td>
                    <td className="table-cell">{s.quantityPurchased}</td>
                    <td className="table-cell font-medium">{formatRwf(s.totalAmountPaid)}</td>
                    <td className="table-cell">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500 text-xs">
                      {new Date(s.salesDate).toLocaleDateString()}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="px-2 py-1 text-xs bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editSale ? 'Edit Sale' : 'New Sale'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text" value={form.invoiceNumber}
              onChange={(e) => setForm({...form, invoiceNumber: e.target.value})}
              className={`input-field ${errors.invoiceNumber ? 'border-red-400' : ''}`}
              disabled={!!editSale}
            />
            {errors.invoiceNumber && <p className="text-xs text-red-500 mt-1">{errors.invoiceNumber}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                value={form.customerId}
                onChange={(e) => setForm({...form, customerId: e.target.value})}
                className={`input-field ${errors.customerId ? 'border-red-400' : ''}`}
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
              {errors.customerId && <p className="text-xs text-red-500 mt-1">{errors.customerId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                value={form.productId}
                onChange={(e) => setForm({...form, productId: e.target.value, quantityPurchased: 1})}
                className={`input-field ${errors.productId ? 'border-red-400' : ''}`}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.productName} - {formatRwf(p.unitPrice)}
                  </option>
                ))}
              </select>
              {errors.productId && <p className="text-xs text-red-500 mt-1">{errors.productId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number" min="1" value={form.quantityPurchased}
                onChange={(e) => setForm({...form, quantityPurchased: e.target.value})}
                className={`input-field ${errors.quantityPurchased ? 'border-red-400' : ''}`}
              />
              {errors.quantityPurchased && <p className="text-xs text-red-500 mt-1">{errors.quantityPurchased}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({...form, paymentMethod: e.target.value})}
                className="input-field"
              >
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sales Date</label>
              <input
                type="date" value={form.salesDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm({...form, salesDate: e.target.value})}
                className={`input-field ${errors.salesDate ? 'border-red-400' : ''}`}
              />
              {errors.salesDate && <p className="text-xs text-red-500 mt-1">{errors.salesDate}</p>}
            </div>
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                Unit Price: <span className="font-semibold">{formatRwf(selectedProduct.unitPrice)}</span>
              </div>
              <div className="text-base font-bold text-primary-700 mt-1">
                Total: {formatRwf(calculatedTotal)}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editSale ? 'Update Sale' : 'Save Sale'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Sale"
        message={`Are you sure you want to delete sale ${deleteTarget?.invoiceNumber}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
};

export default Sales;
