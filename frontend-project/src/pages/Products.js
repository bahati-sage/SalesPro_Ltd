import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { productAPI } from '../services/api';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const initialForm = {
  productCode: '',
  productName: '',
  unitPrice: '',
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await productAPI.getAll(search);
      setProducts(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const validate = () => {
    const errs = {};
    if (!form.productCode.trim()) errs.productCode = 'Required';
    if (!form.productName.trim()) errs.productName = 'Required';
    else if (/^\d+$/.test(form.productName.trim())) errs.productName = 'Cannot be only numbers';
    if (!form.unitPrice) errs.unitPrice = 'Required';
    else if (parseFloat(form.unitPrice) <= 0) errs.unitPrice = 'Must be greater than zero';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await productAPI.create({
        ...form,
        unitPrice: parseFloat(form.unitPrice),
      });
      toast.success('Product added successfully');
      setModalOpen(false);
      setForm(initialForm);
      fetchProducts();
    } catch {
    } finally {
      setSubmitting(false);
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
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product inventory</p>
        </div>
        <button onClick={() => { setForm(initialForm); setErrors({}); setModalOpen(true); }} className="btn-primary">
          + Add Product
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            message="Add your first product to get started."
            action={<button onClick={() => { setForm(initialForm); setErrors({}); setModalOpen(true); }} className="btn-primary">Add Product</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-header">Code</th>
                  <th className="table-header">Product Name</th>
                  <th className="table-header">Unit Price</th>
                  <th className="table-header">Qty Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-400">{p.productCode}</td>
                    <td className="table-cell font-medium">{p.productName}</td>
                    <td className="table-cell">{formatRwf(p.unitPrice)}</td>
                    <td className="table-cell">{p.quantitySold || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Product">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
            <input
              type="text" value={form.productCode}
              onChange={(e) => setForm({...form, productCode: e.target.value})}
              className={`input-field ${errors.productCode ? 'border-red-400' : ''}`}
            />
            {errors.productCode && <p className="text-xs text-red-500 mt-1">{errors.productCode}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text" value={form.productName}
              onChange={(e) => setForm({...form, productName: e.target.value})}
              className={`input-field ${errors.productName ? 'border-red-400' : ''}`}
            />
            {errors.productName && <p className="text-xs text-red-500 mt-1">{errors.productName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (RWF)</label>
            <input
              type="number" step="0.01" min="0.01" value={form.unitPrice}
              onChange={(e) => setForm({...form, unitPrice: e.target.value})}
              className={`input-field ${errors.unitPrice ? 'border-red-400' : ''}`}
            />
            {errors.unitPrice && <p className="text-xs text-red-500 mt-1">{errors.unitPrice}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
