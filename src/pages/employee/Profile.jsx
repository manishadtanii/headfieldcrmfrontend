import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  User, Mail, Briefcase, Shield, KeyRound, Check,
  Eye, EyeOff, Lock, ChevronRight, Building2, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';

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

const GRAD = [
  'linear-gradient(135deg,#818cf8,#a78bfa)',
  'linear-gradient(135deg,#34d399,#6ee7b7)',
  'linear-gradient(135deg,#f472b6,#fb7185)',
  'linear-gradient(135deg,#fbbf24,#f59e0b)',
];
const getGrad = (name) => GRAD[(name?.charCodeAt(0) || 0) % GRAD.length];

export default function EmpProfile() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [changingPW, setChangingPW] = useState(false);
  const [pwForm, setPwForm]         = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw]         = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving]         = useState(false);
  const [pwStrength, setPwStrength] = useState(0);

  // Password strength
  useEffect(() => {
    const pw = pwForm.newPw;
    let score = 0;
    if (pw.length >= 6)             score++;
    if (pw.length >= 10)            score++;
    if (/[A-Z]/.test(pw))           score++;
    if (/[0-9]/.test(pw))           score++;
    if (/[^a-zA-Z0-9]/.test(pw))   score++;
    setPwStrength(score);
  }, [pwForm.newPw]);

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][pwStrength];
  const strengthColor = ['', '#ef4444', '#f97316', '#fbbf24', '#34d399', '#22c55e'][pwStrength];

  const toggle = (field) => setShowPw(s => ({ ...s, [field]: !s[field] }));

  const handleChangePW = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPw.length < 6) return toast.error('Minimum 6 characters required');
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

  const avatarGrad = getGrad(user?.name);

  // Account info rows
  const profileRows = [
    { icon: User,      label: 'Full Name',  value: user?.name },
    { icon: Mail,      label: 'Email',      value: user?.email },
    { icon: Building2, label: 'Business',   value: user?.business?.name || slug },
    { icon: Shield,    label: 'Role',       value: 'Employee' },
  ];

  return (
    <div className="page-content">

      {/* ── Header ────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>My Profile</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>Your account information & security</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT: Profile card ──────────────────────────── */}
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Gradient header */}
            <div style={{ background: avatarGrad, padding: '32px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0,0,0,0.15)' }} />
              <div style={{ position: 'relative', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'white', margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{user?.email}</div>
                <span style={{ display: 'inline-block', marginTop: 10, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                  Employee
                </span>
              </div>
            </div>

            {/* Info rows */}
            <div>
              {profileRows.map(({ icon: Icon, label, value }, i, arr) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={13} color="var(--text-muted)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Business slug */}
            <div style={{ margin: '0 20px 20px', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Business Slug</div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>/{slug}</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Password + Quick tips ──────────────────── */}
        <div>
          {/* Change Password */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#818cf818', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={15} color="#818cf8" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Change Password</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Keep your account secure</div>
                </div>
              </div>
              {!changingPW && (
                <button onClick={() => setChangingPW(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                  Change <ChevronRight size={12} />
                </button>
              )}
            </div>

            {changingPW ? (
              <form onSubmit={handleChangePW} style={{ padding: '20px 22px' }}>
                <PwField label="Current Password"     field="current" pwForm={pwForm} setPwForm={setPwForm} showPw={showPw} toggle={toggle} />
                <PwField label="New Password"         field="newPw"   pwForm={pwForm} setPwForm={setPwForm} showPw={showPw} toggle={toggle} />

                {/* Strength indicator */}
                {pwForm.newPw && (
                  <div style={{ marginBottom: 14, marginTop: -8 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStrength ? strengthColor : 'var(--border)', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: strengthColor, fontWeight: 700 }}>{strengthLabel}</div>
                  </div>
                )}

                <PwField label="Confirm New Password" field="confirm" pwForm={pwForm} setPwForm={setPwForm} showPw={showPw} toggle={toggle} />

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => { setChangingPW(false); setPwForm({ current:'', newPw:'', confirm:'' }); }}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, background: avatarGrad, color: 'white', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
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
                  Update your password regularly to keep the account secure.
                </div>
              </div>
            )}
          </div>

          {/* Today's Game Plan */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Card header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.2px' }}>🗓️ Today's Game Plan</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} — make it count 💪
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#22c55e15', color: '#22c55e', border: '1px solid #22c55e30' }}>DAILY</span>
            </div>

            {/* Checklist items */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { emoji: '☀️', title: 'Start strong',       desc: 'Open your dashboard — know your pipeline before your first call.' },
                { emoji: '📞', title: 'Call first, type later', desc: 'Update lead status right after every conversation. Memory fades fast.' },
                { emoji: '📝', title: 'Leave a breadcrumb',  desc: 'Add a quick note — budget, timeline, next step. Future-you will thank you.' },
                { emoji: '🎯', title: 'Chase the hot ones',   desc: 'Green-tagged leads are waiting. One follow-up today = one deal closer.' },
                { emoji: '🔒', title: 'Log out clean',       desc: 'End of day — update statuses, add pending notes, log out securely.' },
              ].map(({ emoji, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 11, border: '1px solid var(--border)', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>{emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer motivator */}
            <div style={{ margin: '0 16px 14px', padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,rgba(129,140,248,0.08),rgba(34,197,94,0.06))', border: '1px solid rgba(129,140,248,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🏆</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text)' }}>Pro tip:</strong> Employees who update notes daily close <em>40% more deals</em>. Small habits, big results.
              </span>
            </div>
          </div>


          {/* ── Dev card ─────────────────────────────────────────── */}
          <div style={{ marginTop: 16, borderRadius: 14, padding: 1, background: 'linear-gradient(135deg,#818cf8,#a855f7,#f472b6,#fbbf24)', boxShadow: '0 4px 20px rgba(168,85,247,0.2)' }}>
            <div style={{ borderRadius: 13, background: 'var(--bg-card)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26, flexShrink: 0 }}>🧑‍💻</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>
                  Built by{' '}
                  <span style={{ background: 'linear-gradient(90deg,#818cf8,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Manish</span>
                  {' '}— midnight chai, zero bugs (eventually). ☕
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.6 }}>
                  Every pixel here cost him sleep. A quick <em style={{ color: 'var(--text)', fontStyle: 'normal', fontWeight: 700 }}>"thank you Manish"</em> is the only salary he didn't negotiate. 🙏😄
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
