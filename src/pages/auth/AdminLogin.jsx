import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields.');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'superAdmin') {
        toast.error('Access denied. Not a Super Admin account.');
        return;
      }
      if (user.isFirstLogin) {
        navigate('/change-password');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Shield size={22} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>CRM Platform</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Admin Portal</div>
          </div>
        </div>

        <div className="auth-title">Super Admin Login</div>
        <div className="auth-subtitle">Sign in to manage your CRM platform</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="superadmin@crm.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="spin" /> : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-muted)' }}>
          🔒 This portal is for authorized administrators only.
        </div>
      </div>

      <style>{`.spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}
