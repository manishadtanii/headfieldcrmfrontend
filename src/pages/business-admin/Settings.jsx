import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  KeyRound, Check, Eye, EyeOff, User, Mail, Briefcase, Shield,
  Globe, Copy, RefreshCw, Zap, Lock, AlertTriangle, ChevronRight,
  Code2, Terminal, Info, ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authAPI, baAPI } from '../../api';

// ── Section wrapper ────────────────────────────────────────────────
const Section = ({ icon: Icon, iconColor = 'var(--primary)', title, subtitle, badge, children }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
    <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={iconColor} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      {badge}
    </div>
    {children}
  </div>
);

// ── Code block ─────────────────────────────────────────────────────
const CodeBlock = ({ code, onCopy }) => (
  <div style={{ position: 'relative' }}>
    <pre style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '14px 16px', fontSize: 11, overflowX: 'auto', lineHeight: 1.7, margin: 0, fontFamily: '"Fira Code", "Cascadia Code", monospace', color: '#94a3b8' }}>
      {code}
    </pre>
    <button onClick={onCopy}
      style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, background: '#1e293b', border: '1px solid #334155', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#94a3b8', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.color = 'white'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#94a3b8'; }}
    >
      <Copy size={11} /> Copy
    </button>
  </div>
);

// ── Password field ─────────────────────────────────────────────────
const PwField = ({ label, field, pwForm, setPwForm, showPw, toggle }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <input
        className="form-input"
        type={showPw[field] ? 'text' : 'password'}
        placeholder="••••••••"
        value={pwForm[field]}
        onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
        required
        style={{ width: '100%', boxSizing: 'border-box', paddingRight: 42 }}
      />
      <button type="button" onClick={() => toggle(field)}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
        {showPw[field] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  </div>
);

export default function BASettings() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [changingPW, setChangingPW] = useState(false);
  const [pwForm, setPwForm]         = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw]         = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving]         = useState(false);
  const [pwStrength, setPwStrength] = useState(0);

  const [apiKey, setApiKey]             = useState(null);
  const [showKey, setShowKey]           = useState(false);
  const [keyLoading, setKeyLoading]     = useState(false);
  const [webhookCount, setWebhookCount] = useState(0);
  const [activeTab, setActiveTab]       = useState('embed'); // embed | api

  useEffect(() => {
    baAPI.getApiKey(slug)
      .then(r => { setApiKey(r.data.apiKey); setWebhookCount(r.data.webhookLeadsCount || 0); })
      .catch(() => {});
  }, [slug]);

  // Password strength checker
  useEffect(() => {
    const pw = pwForm.newPw;
    let score = 0;
    if (pw.length >= 6)  score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    setPwStrength(score);
  }, [pwForm.newPw]);

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][pwStrength];
  const strengthColor = ['', '#ef4444', '#f97316', '#fbbf24', '#34d399', '#22c55e'][pwStrength];

  const handleGenerateKey = async () => {
    if (apiKey && !confirm('⚠️ Regenerating will break existing integrations. Continue?')) return;
    setKeyLoading(true);
    try {
      const r = await baAPI.generateApiKey(slug);
      setApiKey(r.data.apiKey);
      setShowKey(true);
      toast.success('API key generated!');
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

  const toggle = (field) => setShowPw(s => ({ ...s, [field]: !s[field] }));

  const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://your-backend.com';

  const embedCode = `<script
  src="${BACKEND_URL}/embed.js"
  data-key="${apiKey || 'YOUR_API_KEY'}"
  data-form="#your-form-id"
  data-source="Website Form">
</script>`;

  const fetchCode = `await fetch('${BACKEND_URL}/api/webhook/${slug}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey || 'YOUR_API_KEY'}'
  },
  body: JSON.stringify({
    name: 'Rahul Sharma',       // required
    phone: '9220265398',        // required
    email: 'rahul@email.com',   // optional
    source: 'Contact Form',     // optional
    budget: '50L'               // optional
  })
});`;

  const handleChangePW = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) return toast.error('New passwords do not match');
    if (pwForm.newPw.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.current,
        newPassword:     pwForm.newPw,
        confirmPassword: pwForm.confirm,
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

  const GRAD = ['linear-gradient(135deg,#818cf8,#a78bfa)', 'linear-gradient(135deg,#34d399,#6ee7b7)', 'linear-gradient(135deg,#f472b6,#fb7185)', 'linear-gradient(135deg,#fbbf24,#f59e0b)'];
  const avatarGrad = GRAD[(user?.name?.charCodeAt(0) || 0) % GRAD.length];

  return (
    <div className="page-content">

      {/* ── Header ────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Settings & Developer Zone</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>Manage your account, security & API integrations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT COLUMN ──────────────────────────────── */}
        <div>

          {/* Profile Card */}
          <Section icon={User} title="Profile" subtitle="Your account details">
            {/* Avatar */}
            <div style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: avatarGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{user?.name}</div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#818cf818', color: '#818cf8', border: '1px solid #818cf830', marginTop: 5 }}>
                Business Admin
              </span>
            </div>

            {/* Fields */}
            {[
              { icon: User,      label: 'Name',     value: user?.name },
              { icon: Mail,      label: 'Email',    value: user?.email },
              { icon: Briefcase, label: 'Business', value: user?.business?.name || slug },
              { icon: Shield,    label: 'Role',     value: 'Business Admin' },
            ].map(({ icon: Icon, label, value }, i, arr) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={13} color="var(--text-muted)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</div>
                </div>
              </div>
            ))}
          </Section>

          {/* Change Password */}
          <Section icon={Lock} iconColor="#818cf8" title="Change Password"
            subtitle="Keep your account secure"
            badge={!changingPW && (
              <button onClick={() => setChangingPW(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                Change <ChevronRight size={12} />
              </button>
            )}
          >
            {changingPW ? (
              <form onSubmit={handleChangePW} style={{ padding: '20px 22px' }}>
                <PwField label="Current Password" field="current" pwForm={pwForm} setPwForm={setPwForm} showPw={showPw} toggle={toggle} />
                <PwField label="New Password"     field="newPw"   pwForm={pwForm} setPwForm={setPwForm} showPw={showPw} toggle={toggle} />

                {/* Strength bar */}
                {pwForm.newPw && (
                  <div style={{ marginBottom: 14, marginTop: -8 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStrength ? strengthColor : 'var(--border)', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</div>
                  </div>
                )}

                <PwField label="Confirm New Password" field="confirm" pwForm={pwForm} setPwForm={setPwForm} showPw={showPw} toggle={toggle} />

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => { setChangingPW(false); setPwForm({ current:'', newPw:'', confirm:'' }); }}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, background: 'linear-gradient(135deg,#818cf8,#6366f1)', color: 'white', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    <Check size={14} /> {saving ? 'Saving…' : 'Update Password'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#818cf812', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <KeyRound size={15} color="#818cf8" />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Your password was last changed recently. Update regularly to stay secure.
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────── */}
        <div>
          <Section icon={Globe} iconColor="#06b6d4" title="Web Forms & API Integration"
            subtitle="Auto-capture leads from your website"
            badge={
              webhookCount > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#34d399', background: '#34d39912', padding: '5px 10px', borderRadius: 20, border: '1px solid #34d39930' }}>
                  <Zap size={11} /> {webhookCount} leads
                </div>
              ) : null
            }
          >
            <div style={{ padding: '20px 22px' }}>
              {/* Description */}
              <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: '#06b6d410', borderRadius: 10, border: '1px solid #06b6d420', marginBottom: 20 }}>
                <Info size={14} color="#06b6d4" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: '#06b6d4', lineHeight: 1.6, margin: 0 }}>
                  Connect any website form to your CRM. When someone fills a form, the lead appears here <strong>instantly</strong> — no manual work needed.
                </p>
              </div>

              {/* API Key */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>API Key</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input readOnly
                      type={showKey ? 'text' : 'password'}
                      value={apiKey || (keyLoading ? 'Generating…' : 'No key yet — click Generate')}
                      style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 42px 10px 14px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text)', outline: 'none' }}
                    />
                    {apiKey && (
                      <button type="button" onClick={() => setShowKey(s => !s)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                        {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                  {apiKey && (
                    <button onClick={() => copyText(apiKey, 'API Key')}
                      style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
                      <Copy size={14} />
                    </button>
                  )}
                  <button onClick={handleGenerateKey} disabled={keyLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#06b6d4,#0284c7)', border: 'none', cursor: keyLoading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, color: 'white', flexShrink: 0, opacity: keyLoading ? 0.7 : 1 }}>
                    <RefreshCw size={13} style={{ animation: keyLoading ? 'spin 1s linear infinite' : 'none' }} />
                    {apiKey ? 'Regenerate' : 'Generate'}
                  </button>
                </div>
                {apiKey && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: '#fbbf24' }}>
                    <AlertTriangle size={11} /> Keep this key secret. Regenerating breaks existing integrations.
                  </div>
                )}
              </div>

              {/* Integration tabs */}
              {apiKey && (
                <>
                  {/* Tab switcher */}
                  <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', padding: 4, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}>
                    {[['embed', Code2, 'Script Embed', 'HTML websites'], ['api', Terminal, 'API Call', 'React / Next.js']].map(([tab, Icon, label, sub]) => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', background: activeTab === tab ? 'var(--bg-card)' : 'none', transition: 'all 0.15s', boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                        <Icon size={13} color={activeTab === tab ? 'var(--primary)' : 'var(--text-muted)'} />
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)' }}>{label}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {activeTab === 'embed' ? (
                    <>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>
                        Add this script to your HTML page. It auto-detects your form and sends data on submit.
                      </p>
                      <CodeBlock code={embedCode} onCopy={() => copyText(embedCode, 'Script code')} />
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>
                        Call this endpoint directly from your React, Next.js, or any JavaScript app.
                      </p>
                      <CodeBlock code={fetchCode} onCopy={() => copyText(fetchCode, 'API code')} />
                    </>
                  )}

                  {/* Required fields info */}
                  <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Required & Optional Fields</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {[
                        { field: 'name', required: true },
                        { field: 'phone', required: true },
                        { field: 'email', required: false },
                        { field: 'source', required: false },
                        { field: 'budget', required: false },
                        { field: 'requirement', required: false },
                        { field: 'location', required: false },
                        { field: 'message', required: false },
                      ].map(({ field, required }) => (
                        <span key={field} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: required ? '#818cf818' : 'var(--bg-card)', color: required ? '#818cf8' : 'var(--text-muted)', border: `1px solid ${required ? '#818cf830' : 'var(--border)'}` }}>
                          {field} {required && <span style={{ color: '#ef4444' }}>*</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Section>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
