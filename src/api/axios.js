import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach JWT token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 globally ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 401) {
      // Token expired or force logout
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      toast.error('Session expired. Please login again.');
      // Redirect to appropriate login
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else {
        // Extract slug from URL: /:slug/...
        const slug = path.split('/')[1];
        window.location.href = slug ? `/${slug}/login` : '/admin/login';
      }
    } else if (status === 403) {
      toast.error(message || 'Access denied.');
    } else if (status === 500) {
      toast.error('Server error. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default api;
