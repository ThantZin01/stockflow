import { apiClient } from './axios.js';

export const fetchSalesOrders = (params = {}) => apiClient.get('/sales-orders', { params });

export const fetchSalesOrderById = (id) => apiClient.get(`/sales-orders/${id}`);

export const createSalesOrder = (payload) => apiClient.post('/sales-orders', payload);

export const confirmSalesOrder = (id) => apiClient.patch(`/sales-orders/${id}/confirm`);

export const completeSalesOrder = (id) => apiClient.patch(`/sales-orders/${id}/complete`);

export const cancelSalesOrder = (id) => apiClient.patch(`/sales-orders/${id}/cancel`);
