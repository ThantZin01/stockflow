import { apiClient } from './axios.js';

export const getHealthStatus = () => apiClient.get('/health');
