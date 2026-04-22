import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function BusinessLogin() {
  const { login, logout } = useAuth();
  const { slug } = useParams();
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

      // Super Admin → wrong portal
      if (user.role === 'superAdmin') {
        await logout();
        toast.error('Super Admin — please use /admin/login');
        return;
      }

      // User must belong to this business slug
      const userSlug = user.business?.slug;
      if (!userSlug || userSlug !== slug) {
        await logout();
        toast.error(`You do not belong to "${slug}". Check your login URL.`);
        return;
      }

      // First login → force change password
      if (user.isFirstLogin) {
        toast.success('Please set your new password.');
        navigate('/change-password');
        return;
      }

      // ✅ Redirect by role
      if (user.role === 'businessAdmin') {
        navigate(`/${slug}/dashboard`);
      } else if (user.role === 'employee') {
        navigate(`/${slug}/emp/my-leads`);
      }

    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: 'var(--success)' }}>
            <Building2 size={22} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'capitalize' }}>{slug}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>CRM Portal</div>
          </div>
        </div>

        <div className="auth-title">Welcome Back</div>
        <div className="auth-subtitle">Sign in to continue to your workspace</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
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

          {/* ✅ Fixed: Link instead of <a href> to prevent page reload */}
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--primary-light)' }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading
              ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              : 'Sign In'
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Wrong portal? &nbsp;
          <Link to="/admin/login" style={{ color: 'var(--primary-light)' }}>Super Admin →</Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
