import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { customerAPI } from '../services/api';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const initialForm = {
  customerNumber: '',
  firstName: '',
  lastName: '',
  telephone: '',
  address: '',
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await customerAPI.getAll(search);
      setCustomers(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => fetchCustomers(), 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const validate = () => {
    const errs = {};
    if (!form.customerNumber.trim()) errs.customerNumber = 'Required';
    if (!form.firstName.trim()) errs.firstName = 'Required';
    else if (!/^[a-zA-Z\s]+$/.test(form.firstName.trim())) errs.firstName = 'Letters only';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    else if (!/^[a-zA-Z\s]+$/.test(form.lastName.trim())) errs.lastName = 'Letters only';
    if (!form.telephone.trim()) errs.telephone = 'Required';
    else if (!/^(\+2507[2389]\d{7}|07[2389]\d{7})$/.test(form.telephone.trim())) {
      errs.telephone = 'Invalid Rwanda phone number';
    }
    if (!form.address.trim()) errs.address = 'Required';
    else if (form.address.trim().length < 5) errs.address = 'Too short';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await customerAPI.create(form);
      toast.success('Customer added successfully');
      setModalOpen(false);
      setForm(initialForm);
      fetchCustomers();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setForm(initialForm);
    setErrors({});
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your customer records</p>
        </div>
        <button onClick={openModal} className="btn-primary">
          + Add Customer
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search customers..." />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customers found"
            message="Add your first customer to get started."
            action={<button onClick={openModal} className="btn-primary">Add Customer</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-header">#</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Telephone</th>
                  <th className="table-header">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c, i) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-400">{c.customerNumber}</td>
                    <td className="table-cell font-medium">{c.firstName} {c.lastName}</td>
                    <td className="table-cell">{c.telephone}</td>
                    <td className="table-cell text-gray-500">{c.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Customer">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Number</label>
            <input
              type="text" value={form.customerNumber}
              onChange={(e) => setForm({...form, customerNumber: e.target.value})}
              className={`input-field ${errors.customerNumber ? 'border-red-400' : ''}`}
            />
            {errors.customerNumber && <p className="text-xs text-red-500 mt-1">{errors.customerNumber}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text" value={form.firstName}
                onChange={(e) => setForm({...form, firstName: e.target.value})}
                className={`input-field ${errors.firstName ? 'border-red-400' : ''}`}
              />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text" value={form.lastName}
                onChange={(e) => setForm({...form, lastName: e.target.value})}
                className={`input-field ${errors.lastName ? 'border-red-400' : ''}`}
              />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
            <input
              type="text" value={form.telephone}
              onChange={(e) => setForm({...form, telephone: e.target.value})}
              className={`input-field ${errors.telephone ? 'border-red-400' : ''}`}
              placeholder="078XXXXXXX or +25078XXXXXXX"
            />
            {errors.telephone && <p className="text-xs text-red-500 mt-1">{errors.telephone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
              className={`input-field ${errors.address ? 'border-red-400' : ''}`}
              rows={2}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
