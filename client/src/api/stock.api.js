import { apiClient } from './axios.js';

export const fetchLowStock = (params = {}) => apiClient.get('/stock/low', { params });

export const fetchStockMovements = (params = {}) => apiClient.get('/stock/movements', { params });

export const adjustStock = (payload) => apiClient.post('/stock/adjust', payload);
