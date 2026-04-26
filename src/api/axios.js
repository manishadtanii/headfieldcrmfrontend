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

// Track last network toast time — avoid spam
let _lastNetworkToast = 0;
const showNetworkToast = (msg) => {
  const now = Date.now();
  if (now - _lastNetworkToast > 8000) { // max 1 toast per 8s
    toast.error(msg, { id: 'network-error', duration: 5000 });
    _lastNetworkToast = now;
  }
};

// ── Response interceptor ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error?.response?.status;
    const code    = error?.response?.data?.code;
    const message = error?.response?.data?.message;

    // ── No response at all — pure network failure ─────────────
    if (!error.response) {
      showNetworkToast('🌐 Connection issue. Check your internet and try again.');
      return Promise.reject(error);
    }

    // ── 503 — DB/network timeout from backend ─────────────────
    if (status === 503 || code === 'NETWORK_SLOW') {
      showNetworkToast('🌐 Network is slow. Check your connection and try again.');
      return Promise.reject(error);
    }

    // ── 401 — Session expired ─────────────────────────────────
    if (status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      toast.error('Session expired. Please login again.');
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else {
        const slug = path.split('/')[1];
        window.location.href = slug ? `/${slug}/login` : '/admin/login';
      }
    }

    // ── 403 — Access denied ───────────────────────────────────
    else if (status === 403) {
      toast.error(message || 'Access denied.');
    }

    // ── 500 — Generic server error ────────────────────────────
    else if (status === 500) {
      toast.error('Something went wrong. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default api;





