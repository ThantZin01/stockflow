import { apiClient } from './axios.js';

export const fetchCategories = (params = {}) => apiClient.get('/categories', { params });

export const createCategory = (payload) => apiClient.post('/categories', payload);

export const updateCategory = ({ id, ...payload }) => apiClient.put(`/categories/${id}`, payload);

export const deleteCategory = (id) => apiClient.delete(`/categories/${id}`);
