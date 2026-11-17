import { apiClient } from './axios.js';

export const fetchPurchaseOrders = (params = {}) => apiClient.get('/purchase-orders', { params });

export const fetchPurchaseOrderById = (id) => apiClient.get(`/purchase-orders/${id}`);

export const createPurchaseOrder = (payload) => apiClient.post('/purchase-orders', payload);

export const updatePurchaseOrder = ({ id, ...payload }) =>
  apiClient.put(`/purchase-orders/${id}`, payload);

export const markPurchaseOrderOrdered = (id) => apiClient.patch(`/purchase-orders/${id}/order`);

export const receivePurchaseOrder = (id) => apiClient.patch(`/purchase-orders/${id}/receive`);
