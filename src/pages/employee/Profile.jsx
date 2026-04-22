import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, Mail, Briefcase, Shield, KeyRound, Check, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';

export default function EmpProfile() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [changingPW, setChangingPW] = useState(false);
  const [pwForm, setPwForm]         = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw]         = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving]         = useState(false);

  const handleChangePW = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      return toast.error('New passwords do not match');
    }
    if (pwForm.newPw.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.current,
        newPassword: pwForm.newPw,
      });
      toast.success('Password changed successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
      setChangingPW(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (field) => setShowPw(s => ({ ...s, [field]: !s[field] }));

  return (
    <div className="page-content">
      <div className="mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Profile</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>Your account information</p>
      </div>

      <div style={{ maxWidth: 600 }}>

        {/* Profile Card */}
        <div className="card mb-4">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={16} color="var(--primary)" />
              <div className="card-title">Profile Details</div>
            </div>
          </div>

          <div style={{ padding: '8px 0 16px' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 24px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 700, color: 'white',
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </div>

            {/* Info rows */}
            {[
              { icon: User,     label: 'Full Name',  value: user?.name },
              { icon: Mail,     label: 'Email',      value: user?.email },
              { icon: Briefcase,label: 'Business',   value: user?.business?.name || slug },
              { icon: Shield,   label: 'Role',       value: 'Employee' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 24px',
                borderBottom: '1px solid var(--border)',
              }}>
                <Icon size={16} color="var(--text-muted)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{value || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <KeyRound size={16} color="var(--primary)" />
              <div className="card-title">Change Password</div>
            </div>
            {!changingPW && (
              <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setChangingPW(true)}>
                Change
              </button>
            )}
          </div>

          {changingPW ? (
            <form onSubmit={handleChangePW} style={{ padding: '16px 24px 20px' }}>
              {/* Current Password */}
              {[
                { id: 'current', label: 'Current Password',  key: 'current' },
                { id: 'newPw',   label: 'New Password',      key: 'newPw'   },
                { id: 'confirm', label: 'Confirm New',       key: 'confirm' },
              ].map(({ id, label, key }) => (
                <div className="form-group" key={id}>
                  <label className="form-label">{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      type={showPw[key] ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={pwForm[key]}
                      onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      required
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                      }}
                    >
                      {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setChangingPW(false); setPwForm({ current: '', newPw: '', confirm: '' }); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Check size={14} />
                  {saving ? 'Saving…' : 'Update Password'}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: 13 }}>
              Keep your account secure by changing your password regularly.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
