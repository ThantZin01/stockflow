import { apiClient } from './axios.js';

export const fetchProducts = (params = {}) => apiClient.get('/products', { params });

export const fetchProductById = (id) => apiClient.get(`/products/${id}`);

export const createProduct = (payload) => apiClient.post('/products', payload);

export const updateProduct = ({ id, ...payload }) => apiClient.put(`/products/${id}`, payload);

export const archiveProduct = ({ id, isArchived }) =>
  apiClient.patch(`/products/${id}/archive`, { isArchived });
