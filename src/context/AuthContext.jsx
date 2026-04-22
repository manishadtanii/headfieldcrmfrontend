import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crm_token') || null);
  const [loading, setLoading] = useState(true);
  const heartbeatRef = useRef(null);

  // ── Load user on mount if token exists ──
  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          startHeartbeat();
        } catch {
          clearAuth();
        }
      }
      setLoading(false);
    };
    init();
    return () => stopHeartbeat();
  }, []);

  // ── Heartbeat — send ping every 5 minutes ──
  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatRef.current = setInterval(async () => {
      try { await authAPI.heartbeat(); } catch {}
    }, 5 * 60 * 1000); // 5 minutes
  }, []);

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  // ── Login ──
  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('crm_token', newToken);
    localStorage.setItem('crm_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    startHeartbeat();
    return userData;
  };

  // ── Logout ──
  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    clearAuth();
    toast.success('Logged out successfully.');
  };

  const clearAuth = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setToken(null);
    setUser(null);
    stopHeartbeat();
  };

  // ── Update user in state (after password change etc) ──
  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    localStorage.setItem('crm_user', JSON.stringify({ ...user, ...updatedUser }));
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout, updateUser, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
