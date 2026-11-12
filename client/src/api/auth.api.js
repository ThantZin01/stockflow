import { apiClient } from './axios.js';

export const registerUser = (payload) => apiClient.post('/auth/register', payload);

export const loginUser = (payload) => apiClient.post('/auth/login', payload);

export const fetchCurrentUser = () => apiClient.get('/auth/me');
