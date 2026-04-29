import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import {
  User, Mail, Shield, Lock, Eye, EyeOff,
  KeyRound, CheckCircle2, Clock,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// SA Profile Page — account info + change password
// ─────────────────────────────────────────────────────────────────

const card = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: '24px 28px',
};

function PasswordInput({ id, label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 40px 10px 14px',
            borderRadius: 10, fontSize: 14,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text)', outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex', padding: 0,
          }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function SAProfile() {
  const { user } = useAuth();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return toast.error('All fields are required');
    }
    if (form.newPassword !== form.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (form.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    if (form.newPassword === form.currentPassword) {
      return toast.error('New password must be different from current password');
    }

    setSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (date) => date
    ? new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div style={{ padding: '24px 28px', maxWidth: 760 }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'linear-gradient(135deg, #a855f7, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 900, color: 'white',
          boxShadow: '0 4px 14px rgba(168,85,247,0.4)',
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>My Profile</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Manage your account settings
          </p>
        </div>
      </div>

      {/* ── Account Info Card ──────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Shield size={16} color="#a855f7" />
          <span style={{ fontWeight: 800, fontSize: 14 }}>Account Information</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Name */}
          <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <User size={13} color="var(--text-muted)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Name</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.name}</div>
          </div>

          {/* Email */}
          <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <Mail size={13} color="var(--text-muted)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Email</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, wordBreak: 'break-all' }}>{user?.email}</div>
          </div>

          {/* Role */}
          <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <Shield size={13} color="#a855f7" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#a855f7' }}>Role</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#a855f7' }}>Super Admin</div>
          </div>

          {/* Last Login */}
          <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <Clock size={13} color="var(--text-muted)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Last Login</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{fmt(user?.lastLogin)}</div>
          </div>
        </div>
      </div>

      {/* ── Change Password Card ────────────────────────────────── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          <KeyRound size={16} color="#818cf8" />
          <span style={{ fontWeight: 800, fontSize: 14 }}>Change Password</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PasswordInput
            id="current-password"
            label="Current Password"
            value={form.currentPassword}
            onChange={set('currentPassword')}
            placeholder="Enter your current password"
          />
          <PasswordInput
            id="new-password"
            label="New Password"
            value={form.newPassword}
            onChange={set('newPassword')}
            placeholder="At least 8 characters"
          />
          <PasswordInput
            id="confirm-password"
            label="Confirm New Password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            placeholder="Re-enter new password"
          />

          {/* Password strength hint */}
          {form.newPassword.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { check: form.newPassword.length >= 8,            label: '8+ chars' },
                { check: /[A-Z]/.test(form.newPassword),          label: 'Uppercase' },
                { check: /[0-9]/.test(form.newPassword),          label: 'Number' },
                { check: /[^A-Za-z0-9]/.test(form.newPassword),   label: 'Symbol' },
              ].map(({ check, label }) => (
                <span key={label} style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                  background: check ? '#10b98115' : 'var(--bg-elevated)',
                  color: check ? '#10b981' : 'var(--text-muted)',
                  border: `1px solid ${check ? '#10b98140' : 'var(--border)'}`,
                  transition: 'all .2s',
                }}>
                  {check ? '✓ ' : ''}{label}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            {success && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#10b981' }}>
                <CheckCircle2 size={15} />
                Password updated successfully!
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              style={{
                marginLeft: 'auto',
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 24px', borderRadius: 12,
                background: saving ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #818cf8, #6366f1)',
                border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 14, color: saving ? 'var(--text-muted)' : 'white',
                boxShadow: saving ? 'none' : '0 4px 14px rgba(129,140,248,0.4)',
                transition: 'all .2s',
              }}
            >
              <Lock size={14} />
              {saving ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
