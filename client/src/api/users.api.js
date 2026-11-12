import { apiClient } from './axios.js';

export const fetchUsers = (params = {}) => apiClient.get('/users', { params });

export const updateUserRole = ({ id, role }) => apiClient.patch(`/users/${id}/role`, { role });

export const updateUserStatus = ({ id, isActive }) =>
  apiClient.patch(`/users/${id}/status`, { isActive });
