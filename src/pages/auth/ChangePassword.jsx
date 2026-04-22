import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match.');
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await authAPI.changePassword(form);
      toast.success('Password changed successfully!');
      updateUser({ isFirstLogin: false });
      // Redirect based on role
      if (user?.role === 'superAdmin') navigate('/admin/dashboard');
      else if (user?.role === 'businessAdmin') navigate(`/${user.business?.slug}/dashboard`);
      else navigate(`/${user.business?.slug}/emp/my-leads`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><KeyRound size={22} color="white" /></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Set New Password</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>First Login Required</div>
          </div>
        </div>

        <div className="auth-title">Change Your Password</div>
        <div className="auth-subtitle">You must set a new password before continuing.</div>

        <form onSubmit={handleSubmit}>
          {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
            <div className="form-group" key={field}>
              <label className="form-label">
                {field === 'currentPassword' ? 'Current / Temp Password' :
                 field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
              </label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                disabled={loading}
              />
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Set New Password'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button className="btn btn-ghost" onClick={() => logout().then(() => navigate('/admin/login'))}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
