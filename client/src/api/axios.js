import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'stockflow_token';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isCredentialAttempt = url.includes('/auth/login') || url.includes('/auth/register');
    const sessionRejected = status === 401 || (status === 403 && url.includes('/auth/me'));

    // A failed login is a 401 too, and must not wipe a session that was never stored.
    if (sessionRejected && !isCredentialAttempt) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new Event('stockflow:unauthorized'));
    }

    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    const customError = new Error(message);
    customError.statusCode = status;
    return Promise.reject(customError);
  }
);
