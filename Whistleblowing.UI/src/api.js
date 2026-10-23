import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  // Avoid adding /api twice when the base URL already ends with /api.
  if (/\/api\/?$/i.test(config.baseURL || '') && /^\/api(?:\/|$)/i.test(config.url || '')) {
    config.url = config.url.replace(/^\/api(?=\/|$)/i, '') || '/';
  }

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;