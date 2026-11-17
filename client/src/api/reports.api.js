import { apiClient } from './axios.js';

export const fetchReportSummary = () => apiClient.get('/reports/summary');

export const fetchSalesReport = (params = {}) => apiClient.get('/reports/sales', { params });

export const fetchTopProducts = (params = {}) => apiClient.get('/reports/top-products', { params });

export const fetchStockValue = () => apiClient.get('/reports/stock-value');
