import { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email.');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Mail size={22} color="white" /></div>
          <div><div style={{ fontWeight: 700, fontSize: 18 }}>Reset Password</div></div>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={48} color="var(--success)" style={{ marginBottom: 16 }} />
            <div className="auth-title">Check Your Email</div>
            <div className="auth-subtitle">If your email exists, a reset link has been sent. Check your inbox.</div>
          </div>
        ) : (
          <>
            <div className="auth-title">Forgot Password?</div>
            <div className="auth-subtitle">Enter your email and we'll send a reset link.</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="your@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} autoFocus />
              </div>
              <button type="submit" className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
                {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/admin/login" style={{ fontSize: 13, color: 'var(--primary-light)' }}>← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
