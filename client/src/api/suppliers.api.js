import { apiClient } from './axios.js';

export const fetchSuppliers = (params = {}) => apiClient.get('/suppliers', { params });

export const fetchSupplierById = (id) => apiClient.get(`/suppliers/${id}`);

export const createSupplier = (payload) => apiClient.post('/suppliers', payload);

export const updateSupplier = ({ id, ...payload }) => apiClient.put(`/suppliers/${id}`, payload);

export const deleteSupplier = (id) => apiClient.delete(`/suppliers/${id}`);
