import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { KeyRound, Check, Eye, EyeOff, User, Mail, Briefcase, Shield, Globe, Copy, RefreshCw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authAPI, baAPI } from '../../api';

export default function BASettings() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [changingPW, setChangingPW] = useState(false);
  const [pwForm, setPwForm]         = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw]         = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving]         = useState(false);

  // Web Forms state
  const [apiKey, setApiKey]           = useState(null);
  const [showKey, setShowKey]         = useState(false);
  const [keyLoading, setKeyLoading]   = useState(false);
  const [webhookCount, setWebhookCount] = useState(0);

  useEffect(() => {
    baAPI.getApiKey(slug)
      .then(r => {
        setApiKey(r.data.apiKey);
        setWebhookCount(r.data.webhookLeadsCount || 0);
      })
      .catch(() => {});
  }, [slug]);

  const handleGenerateKey = async () => {
    setKeyLoading(true);
    try {
      const r = await baAPI.generateApiKey(slug);
      setApiKey(r.data.apiKey);
      setShowKey(true);
      toast.success('New API key generated!');
    } catch {
      toast.error('Failed to generate key');
    } finally {
      setKeyLoading(false);
    }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://your-backend.com';

  const embedCode = `<script\n  src="${BACKEND_URL}/embed.js"\n  data-key="${apiKey || 'YOUR_API_KEY'}"\n  data-form="#your-form-id"\n  data-source="Website Form">\n<\/script>`;

  const fetchCode = `await fetch('${BACKEND_URL}/api/webhook/${slug}', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n    'x-api-key': '${apiKey || 'YOUR_API_KEY'}'\n  },\n  body: JSON.stringify({\n    name: 'Rahul Sharma',\n    phone: '9220265398',\n    email: 'rahul@email.com',\n    source: 'Contact Form',\n    budget: '50L'\n  })\n});`;

  const handleChangePW = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) return toast.error('New passwords do not match');
    if (pwForm.newPw.length < 6) return toast.error('Password must be at least 6 characters');

    setSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.current,
        newPassword:     pwForm.newPw,
        confirmPassword: pwForm.confirm,   // ← backend needs this
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
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Settings</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>Manage your account settings</p>
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
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 24px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 700, color: 'white',
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </div>

            {[
              { icon: User,      label: 'Full Name',   value: user?.name },
              { icon: Mail,      label: 'Email',       value: user?.email },
              { icon: Briefcase, label: 'Business',    value: user?.business?.name || slug },
              { icon: Shield,    label: 'Role',        value: 'Business Admin' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 24px', borderBottom: '1px solid var(--border)',
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

        {/* Change Password */}
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
              {[
                { id: 'current', label: 'Current Password', key: 'current' },
                { id: 'newPw',   label: 'New Password',     key: 'newPw'   },
                { id: 'confirm', label: 'Confirm New',      key: 'confirm' },
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
                <button
                  type="button" className="btn btn-ghost"
                  onClick={() => { setChangingPW(false); setPwForm({ current: '', newPw: '', confirm: '' }); }}
                >
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
              Keep your account secure by updating your password regularly.
            </div>
          )}
        </div>

        {/* ── Web Forms & API ─────────────────────────────────────── */}
        <div className="card mt-4">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={16} color="#06b6d4" />
              <div className="card-title">Web Forms & API Integration</div>
            </div>
            {webhookCount > 0 && (
              <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                <Zap size={12} style={{ marginRight: 3 }} />
                {webhookCount} leads received
              </span>
            )}
          </div>

          <div style={{ padding: '16px 24px 20px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
              Connect any website form to your CRM. When someone fills the form,
              lead appears here <strong>instantly</strong> — no manual work needed.
            </p>

            {/* API Key Row */}
            <div className="form-group">
              <label className="form-label">API Key</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    className="form-input"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey || (keyLoading ? 'Generating…' : 'No key yet — click Generate')}
                    readOnly
                    style={{ paddingRight: 40, fontFamily: 'monospace', fontSize: 12 }}
                  />
                  {apiKey && (
                    <button
                      type="button"
                      onClick={() => setShowKey(s => !s)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
                {apiKey && (
                  <button className="btn btn-ghost" onClick={() => copyText(apiKey, 'API Key')} title="Copy">
                    <Copy size={14} />
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={handleGenerateKey}
                  disabled={keyLoading}
                  title={apiKey ? 'Regenerate Key' : 'Generate Key'}
                >
                  {keyLoading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
                  {apiKey ? 'Regenerate' : 'Generate Key'}
                </button>
              </div>
              {apiKey && (
                <p style={{ fontSize: 11, color: 'var(--warning)', marginTop: 6 }}>
                  ⚠️ Keep this key secret. Regenerating will break existing integrations.
                </p>
              )}
            </div>

            {apiKey && (
              <>
                {/* Option A: Script embed */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ margin: 0 }}>Option A — Script Embed (HTML websites)</label>
                    <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => copyText(embedCode, 'Script code')}>
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <pre style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '12px 14px', fontSize: 11,
                    overflowX: 'auto', lineHeight: 1.6, margin: 0,
                    fontFamily: 'monospace', color: 'var(--text)',
                  }}>{embedCode}</pre>
                </div>

                {/* Option B: Direct API call */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ margin: 0 }}>Option B — Direct API Call (React / Next.js)</label>
                    <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => copyText(fetchCode, 'API code')}>
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <pre style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '12px 14px', fontSize: 11,
                    overflowX: 'auto', lineHeight: 1.6, margin: 0,
                    fontFamily: 'monospace', color: 'var(--text)',
                  }}>{fetchCode}</pre>
                </div>

                <div style={{
                  background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#06b6d4',
                }}>
                  ✅ Send <code style={{ background: 'rgba(6,182,212,0.1)', padding: '1px 5px', borderRadius: 3 }}>name</code> + 
                  <code style={{ background: 'rgba(6,182,212,0.1)', padding: '1px 5px', borderRadius: 3 }}>phone</code> (required).
                  Optional: <code style={{ background: 'rgba(6,182,212,0.1)', padding: '1px 5px', borderRadius: 3 }}>email, budget, requirement, location, source, message</code>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
