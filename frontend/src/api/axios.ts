import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.MODE === 'development') return '/api';
  const raw = (import.meta.env.VITE_API_URL || 'https://backend-hrms-3ozc.onrender.com').replace(/\/+$/, '');
  return raw.endsWith('/api') ? raw : `${raw}/api`;
};

const api = axios.create({ baseURL: getBaseURL() });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRequest = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('hrms_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  },
);

export default api;
