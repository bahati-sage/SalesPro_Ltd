import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('srms_user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    if (error.response?.status === 401) {
      localStorage.removeItem('srms_user');
      window.location.href = '/login';
    }
    toast.error(message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const customerAPI = {
  getAll: (search) => api.get(`/customers${search ? `?search=${search}` : ''}`),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
};

export const productAPI = {
  getAll: (search) => api.get(`/products${search ? `?search=${search}` : ''}`),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
};

export const saleAPI = {
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  update: (id, data) => api.put(`/sales/${id}`, data),
  delete: (id) => api.delete(`/sales/${id}`),
};

export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getDaily: (date) => api.get(`/reports/daily${date ? `?date=${date}` : ''}`),
  getWeekly: (startDate, endDate) => api.get(`/reports/weekly?startDate=${startDate}&endDate=${endDate}`),
  getMonthly: (year, month) => api.get(`/reports/monthly?year=${year}&month=${month}`),
};

export default api;
