import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { KeyRound, Loader2, CheckCircle } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match.');
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form);
      setDone(true);
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid or expired link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><KeyRound size={22} color="white" /></div>
          <div><div style={{ fontWeight: 700, fontSize: 18 }}>Reset Password</div></div>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={48} color="var(--success)" style={{ marginBottom: 16 }} />
            <div className="auth-title">Password Reset!</div>
            <div className="auth-subtitle">Redirecting to login...</div>
          </div>
        ) : (
          <>
            <div className="auth-title">Set New Password</div>
            <div className="auth-subtitle">Enter your new password below.</div>
            <form onSubmit={handleSubmit}>
              {['newPassword', 'confirmPassword'].map((field) => (
                <div className="form-group" key={field}>
                  <label className="form-label">{field === 'newPassword' ? 'New Password' : 'Confirm Password'}</label>
                  <input className="form-input" type="password" placeholder="••••••••"
                    value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} disabled={loading} />
                </div>
              ))}
              <button type="submit" className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
                {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
