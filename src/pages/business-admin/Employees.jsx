import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, ToggleLeft, ToggleRight, LogOut, KeyRound,
  X, Loader2, Check, Copy, Users, UserCheck, Wifi, UserX,
  ChevronRight, Shield, Mail, Calendar, AlertTriangle, Zap,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { baAPI } from '../../api';
import toast from 'react-hot-toast';

// ── Helpers ────────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return 'Never';
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = Math.floor(diff / 86400);
  return d === 1 ? 'Yesterday' : `${d} days ago`;
}

const GRAD = [
  'linear-gradient(135deg,#818cf8,#a78bfa)',
  'linear-gradient(135deg,#34d399,#6ee7b7)',
  'linear-gradient(135deg,#f472b6,#fb7185)',
  'linear-gradient(135deg,#fbbf24,#f59e0b)',
  'linear-gradient(135deg,#60a5fa,#818cf8)',
  'linear-gradient(135deg,#a78bfa,#f472b6)',
];
const getGrad = (name) => GRAD[(name?.charCodeAt(0) || 0) % GRAD.length];

// ── Confirm Modal ──────────────────────────────────────────────────
const ConfirmModal = ({ title, desc, confirmLabel, danger, onConfirm, onClose, loading }) => (
  <div className="confirm-overlay">
    <div className={`confirm-card ${danger ? 'confirm-card-danger' : 'confirm-card-warning'}`}>
      <div className="confirm-strip" style={{ background: danger
        ? 'linear-gradient(90deg,#ef4444,#dc2626)'
        : 'linear-gradient(90deg,#f59e0b,#d97706)'
      }} />
      <div className="confirm-body">
        <div className="confirm-icon-wrap" style={{ background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(251,191,36,0.12)' }}>
          <AlertTriangle size={20} color={danger ? '#ef4444' : '#fbbf24'} />
        </div>
        <div className="confirm-texts">
          <div className="confirm-title">{title}</div>
          <div className="confirm-desc">{desc}</div>
        </div>
      </div>
      <div className="confirm-actions">
        <button className="confirm-btn-cancel" onClick={onClose}>Cancel</button>
        <button
          className={`confirm-btn-action ${danger ? 'confirm-btn-danger' : 'confirm-btn-warning'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <AlertTriangle size={14} />}
          {loading ? 'Processing…' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);


// ── Credentials Box ────────────────────────────────────────────────
const CredentialsBox = ({ creds, onClose }) => {
  const copyAll = () => {
    const text = `Name: ${creds.name}\nEmail: ${creds.email}\nPassword: ${creds.tempPassword}\nLogin URL: ${creds.loginUrl}`;
    navigator.clipboard.writeText(text);
    toast.success('All credentials copied!');
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 18, maxWidth: 460, width: '100%', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#34d39915,#6ee7b710)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#34d39920', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={18} color="#34d399" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#34d399' }}>Employee Created!</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Save these credentials now</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}><X size={18} /></button>
        </div>
        {/* Creds */}
        <div style={{ padding: '16px 24px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
            ⚠️ Password won't be shown again. Share with employee securely.
          </p>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {[
              { key: 'Name', val: creds.name },
              { key: 'Email', val: creds.email },
              { key: 'Password', val: creds.tempPassword, mono: true },
              { key: 'Login URL', val: creds.loginUrl },
            ].map(({ key, val, mono }, i, arr) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{key}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{val}</div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(val); toast.success(`${key} copied!`); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6, flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                ><Copy size={13} /></button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={copyAll} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
              <Copy size={13} style={{ display: 'inline', marginRight: 6 }} />Copy All
            </button>
            <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),#6366f1)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'white' }}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Create Modal ───────────────────────────────────────────────────
const CreateModal = ({ slug, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return toast.error('Name and email required.');
    setLoading(true);
    try {
      const res = await baAPI.createEmployee(slug, form);
      onCreated(res.data.credentials);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--bg-card)', borderRadius: 18, maxWidth: 420, width: '100%', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Add New Employee</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Credentials will be auto-generated</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Full Name *</label>
            <input
              className="form-input" placeholder="Rahul Kumar" autoFocus
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Email Address *</label>
            <input
              className="form-input" type="email" placeholder="rahul@company.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          {/* Role badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: '#34d39910', border: '1px solid #34d39930', marginBottom: 20 }}>
            <Shield size={14} color="#34d399" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>Employee</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>— Fixed role, can be changed later</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, background: 'linear-gradient(135deg,var(--primary),#6366f1)', color: 'white', opacity: loading ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</> : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Employee Card ──────────────────────────────────────────────────
const EmployeeCard = ({ emp, onToggle, onForceLogout, onResetPW }) => {
  const grad = getGrad(emp.name);
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top strip */}
      <div style={{ height: 3, background: grad }} />

      <div style={{ padding: '16px' }}>
        {/* Row 1: Avatar + Name + Online */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: 'white' }}>
                {emp.name?.[0]?.toUpperCase()}
              </div>
              {emp.isOnline && (
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: '#34d399', border: '2px solid var(--bg-card)', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.email}</div>
            </div>
          </div>
          {/* Status pill */}
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: emp.isActive ? '#34d39918' : '#ef444418', color: emp.isActive ? '#34d399' : '#ef4444', border: `1px solid ${emp.isActive ? '#34d39930' : '#ef444430'}`, flexShrink: 0 }}>
            {emp.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* First login warning */}
        {emp.isFirstLogin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: '#fbbf2412', border: '1px solid #fbbf2430', marginBottom: 10 }}>
            <Zap size={11} color="#fbbf24" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24' }}>First login pending</span>
          </div>
        )}

        {/* Last login */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
          <Calendar size={11} />
          <span>Last login: <strong style={{ color: 'var(--text)' }}>{timeAgo(emp.lastLogin)}</strong></span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {/* Toggle */}
          <button onClick={() => onToggle(emp)} title={emp.isActive ? 'Deactivate' : 'Activate'}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: emp.isActive ? '#ef4444' : '#34d399', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {emp.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
            {emp.isActive ? 'Deactivate' : 'Activate'}
          </button>

          {/* Force logout — only if online */}
          <button onClick={() => onForceLogout(emp)} title="Force Logout"
            style={{ visibility: emp.isOnline ? 'visible' : 'hidden', width: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: '#fbbf24', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          ><LogOut size={13} /></button>

          {/* Reset Password */}
          <button onClick={() => onResetPW(emp)} title="Reset Password"
            style={{ width: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: '#818cf8', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          ><KeyRound size={13} /></button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────
export default function Employees() {
  const { slug } = useParams();
  const [employees, setEmployees] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [page, setPage]           = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [confirm, setConfirm]     = useState(null); // { type, emp }
  const [actionLoading, setActionLoading] = useState(false);

  const LIMIT = 15;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search)        params.search   = search;
      if (filterActive !== '') params.isActive = filterActive;
      const res = await baAPI.getEmployees(slug, params);
      setEmployees(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterActive, slug]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // computed stats
  const onlineCount   = employees.filter(e => e.isOnline).length;
  const activeCount   = employees.filter(e => e.isActive).length;
  const inactiveCount = employees.filter(e => !e.isActive).length;

  // ── Action handlers ────────────────────────────────────────────
  const handleToggle = (emp) => setConfirm({ type: 'toggle', emp });
  const handleForceLogout = (emp) => setConfirm({ type: 'logout', emp });
  const handleResetPW = (emp) => setConfirm({ type: 'reset', emp });

  const executeAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    const { type, emp } = confirm;
    try {
      if (type === 'toggle') {
        const res = await baAPI.toggleEmployee(slug, emp._id);
        toast.success(res.data.message);
        fetchEmployees();
      } else if (type === 'logout') {
        const res = await baAPI.forceLogoutEmployee(slug, emp._id);
        toast.success(res.data.message);
        fetchEmployees();
      } else if (type === 'reset') {
        const res = await baAPI.resetEmployeePassword(slug, emp._id);
        setCredentials(res.data.credentials);
      }
      setConfirm(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmConfig = confirm ? {
    toggle: {
      title: confirm.emp.isActive ? `Deactivate ${confirm.emp.name}?` : `Activate ${confirm.emp.name}?`,
      desc: confirm.emp.isActive
        ? 'Employee will be logged out immediately and cannot access the system.'
        : 'Employee will regain access to the system.',
      confirmLabel: confirm.emp.isActive ? 'Yes, Deactivate' : 'Yes, Activate',
      danger: confirm.emp.isActive,
    },
    logout: {
      title: `Force Logout ${confirm.emp.name}?`,
      desc: 'This will immediately end their active session. They will need to login again.',
      confirmLabel: 'Force Logout',
      danger: false,
    },
    reset: {
      title: `Reset Password for ${confirm.emp.name}?`,
      desc: 'A new temporary password will be generated. They will be logged out and must change it on next login.',
      confirmLabel: 'Reset Password',
      danger: false,
    },
  }[confirm.type] : null;

  return (
    <div className="page-content">

      {/* ── Header ────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Employees</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>{total} total employees</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,var(--primary),#6366f1)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'white' }}
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* ── Stats Row ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: Users,     label: 'Total',    value: total,         color: '#818cf8', grad: 'linear-gradient(90deg,#818cf8,#a78bfa)' },
          { icon: UserCheck, label: 'Active',   value: activeCount,   color: '#34d399', grad: 'linear-gradient(90deg,#34d399,#6ee7b7)' },
          { icon: Wifi,      label: 'Online',   value: onlineCount,   color: '#06b6d4', grad: 'linear-gradient(90deg,#06b6d4,#67e8f9)' },
          { icon: UserX,     label: 'Inactive', value: inactiveCount, color: '#ef4444', grad: 'linear-gradient(90deg,#ef4444,#f87171)' },
        ].map(({ icon: Icon, label, value, color, grad }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: grad }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{loading ? '—' : value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search name or email…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
          {[['', 'All'], ['true', 'Active'], ['false', 'Inactive']].map(([val, label]) => (
            <button key={val} onClick={() => { setFilterActive(val); setPage(1); }}
              style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filterActive === val ? 'var(--bg-card)' : 'none', color: filterActive === val ? 'var(--text)' : 'var(--text-muted)', boxShadow: filterActive === val ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* ── Card Grid ─────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 200, background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No employees found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{search ? 'Try a different search.' : 'Add your first employee to get started.'}</p>
          {!search && (
            <button onClick={() => setShowCreate(true)} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),#6366f1)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'white' }}>
              <Plus size={14} style={{ display: 'inline', marginRight: 6 }} />Add Employee
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {employees.map(emp => (
            <EmployeeCard key={emp._id} emp={emp}
              onToggle={handleToggle}
              onForceLogout={handleForceLogout}
              onResetPW={handleResetPW}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ────────────────────────────── */}
      {total > LIMIT && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, padding: '14px 18px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <button className="btn btn-secondary btn-sm" disabled={page * LIMIT >= total} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* ── Modals ────────────────────────────────── */}
      {showCreate && <CreateModal slug={slug} onClose={() => setShowCreate(false)} onCreated={(creds) => { setCredentials(creds); fetchEmployees(); }} />}
      {credentials && <CredentialsBox creds={credentials} onClose={() => setCredentials(null)} />}
      {confirm && confirmConfig && (
        <ConfirmModal
          {...confirmConfig}
          loading={actionLoading}
          onConfirm={executeAction}
          onClose={() => setConfirm(null)}
        />
      )}

      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes pulse     { 0%,100%{opacity:0.4} 50%{opacity:0.15} }
        @keyframes pulse-dot { 0%,100%{opacity:1}   50%{opacity:0.3}  }
      `}</style>
    </div>
  );
}
