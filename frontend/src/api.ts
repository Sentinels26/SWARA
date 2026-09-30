import axios from 'axios';

// LOCAL:      VITE_API_BASE_URL is not set → defaults to localhost:8001
// PRODUCTION: Uses relative path ('') to leverage Vercel's rewrites without needing env variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:8001');

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token automatically on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear stale token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on an auth/public page
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/auth') && currentPath !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
