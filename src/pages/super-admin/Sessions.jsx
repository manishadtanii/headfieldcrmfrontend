import { useState, useEffect, useCallback } from 'react';
import {
  Monitor, Smartphone, Tablet, Globe, RefreshCw, Wifi, WifiOff,
  Clock, LogOut, AlertTriangle, Timer, Filter, X, Activity,
  Users, Building2, Shield, Zap,
} from 'lucide-react';
import { adminAnalyticsAPI } from '../../api';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────────
const ONLINE_THRESHOLD = 10 * 60 * 1000; // 10 min

function isOnline(s) {
  if (!s.isActive) return false;
  return Date.now() - new Date(s.lastActiveAt) < ONLINE_THRESHOLD;
}

function timeAgo(date) {
  if (!date) return '—';
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function fmtDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function fmtDuration(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

// ── Config maps ───────────────────────────────────────────────────
const ROLE_CONFIG = {
  superAdmin:    { label: 'Super Admin', color: '#f472b6', bg: '#f472b618', grad: 'linear-gradient(135deg,#f472b6,#fb7185)' },
  businessAdmin: { label: 'Biz Admin',   color: '#818cf8', bg: '#818cf818', grad: 'linear-gradient(135deg,#818cf8,#a78bfa)' },
  employee:      { label: 'Employee',    color: '#34d399', bg: '#34d39918', grad: 'linear-gradient(135deg,#34d399,#6ee7b7)' },
};

const LOGOUT_CONFIG = {
  manual:          { label: 'Manual Logout', color: '#6b7280', bg: '#6b728018', icon: <LogOut size={11}/> },
  session_expired: { label: 'Session Expired', color: '#fbbf24', bg: '#fbbf2418', icon: <Timer size={11}/> },
  force_logout:    { label: 'Force Logout',  color: '#ef4444', bg: '#ef444418', icon: <Zap size={11}/> },
};

// ── Device Icon ───────────────────────────────────────────────────
const DeviceIcon = ({ device, size = 14 }) => {
  if (device === 'Mobile')  return <Smartphone size={size} />;
  if (device === 'Tablet')  return <Tablet size={size} />;
  return <Monitor size={size} />;
};

// ── Session Card ──────────────────────────────────────────────────
const SessionCard = ({ s }) => {
  const online = isOnline(s);
  const rc     = ROLE_CONFIG[s.role] || ROLE_CONFIG.employee;
  const lc     = s.logoutType ? LOGOUT_CONFIG[s.logoutType] : null;
  const dur    = fmtDuration(s.durationMinutes);

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, overflow: 'hidden',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.18)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top bar = role color */}
      <div style={{ height: 3, background: rc.grad }} />

      <div style={{ padding: '14px 16px' }}>
        {/* Row 1: Avatar + Name + Role + Online */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: rc.grad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 15, color: 'white',
              }}>{s.userName?.[0]?.toUpperCase()}</div>
              {online && (
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#34d399', border: '2px solid var(--bg-card)' }} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.userName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.userEmail}</div>
            </div>
          </div>
          {/* Role badge */}
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: rc.bg, color: rc.color, border: `1px solid ${rc.color}30`, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {rc.label}
          </span>
        </div>

        {/* Row 2: Business */}
        {s.businessName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '7px 10px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <Building2 size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.businessName}</span>
          </div>
        )}

        {/* Row 3: Device info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 11, color: 'var(--text-muted)' }}>
          <DeviceIcon device={s.device} size={12} />
          <span>{s.browser}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{s.device}</span>
          {s.os && <>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{s.os}</span>
          </>}
        </div>

        {/* Row 4: Login time + Duration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
            <Clock size={11} />
            <span>{fmtDate(s.loginAt)}</span>
          </div>
          {dur && !online && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
              <Timer size={11} />
              <span>{dur}</span>
            </div>
          )}
          {online && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#34d399', fontWeight: 600 }}>
              <Activity size={11} />
              <span>Active {timeAgo(s.lastActiveAt)}</span>
            </div>
          )}
        </div>

        {/* Row 5: Status + Logout type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {online ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#34d39918', color: '#34d399', border: '1px solid #34d39930' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse-dot 1.5s ease-in-out infinite', display: 'inline-block' }} />
              Live Session
            </span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#6b728018', color: '#6b7280', border: '1px solid #6b728030' }}>
              Offline
            </span>
          )}

          {lc && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: lc.bg, color: lc.color, border: `1px solid ${lc.color}30` }}>
              {lc.icon} {lc.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, grad }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: grad }} />
    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={16} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────
export default function SASessions() {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ role: '', isActive: '', dateFrom: '', dateTo: '' });
  const [page, setPage]         = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const LIMIT = 18;

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.role)     params.role     = filters.role;
      if (filters.isActive !== '') params.isActive = filters.isActive;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo)   params.dateTo   = filters.dateTo;
      const res = await adminAnalyticsAPI.getSessions(params);
      setSessions(res.data.data);
      setTotal(res.data.total);
      setLastRefreshed(new Date());
    } catch {
      toast.error('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchSessions, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchSessions]);

  const clearFilters = () => { setFilters({ role: '', isActive: '', dateFrom: '', dateTo: '' }); setPage(1); };
  const hasFilter = filters.role || filters.isActive || filters.dateFrom || filters.dateTo;

  const liveCount      = sessions.filter(s => isOnline(s)).length;
  const forcedCount    = sessions.filter(s => s.logoutType === 'force_logout').length;
  const expiredCount   = sessions.filter(s => s.logoutType === 'session_expired').length;

  return (
    <div className="page-content">

      {/* ── Header ────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Activity Monitor</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>
            {total} sessions recorded
            {lastRefreshed && <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>· Updated {timeAgo(lastRefreshed)}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setAutoRefresh(a => !a)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
              borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: autoRefresh ? 'linear-gradient(135deg,#34d399,#6ee7b7)' : 'var(--bg-card)',
              border: autoRefresh ? 'none' : '1px solid var(--border)',
              color: autoRefresh ? 'white' : 'var(--text)',
            }}
          >
            <RefreshCw size={13} style={autoRefresh ? { animation: 'spin 2s linear infinite' } : {}} />
            {autoRefresh ? 'Live (30s)' : 'Auto Refresh'}
          </button>
          <button
            onClick={fetchSessions}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard icon={Wifi}          label="Live Right Now"  value={liveCount}    color="#34d399" grad="linear-gradient(90deg,#34d399,#6ee7b7)" />
        <StatCard icon={Users}         label="Total Sessions"  value={total}        color="#818cf8" grad="linear-gradient(90deg,#818cf8,#a78bfa)" />
        <StatCard icon={Zap}           label="Force Logouts"   value={forcedCount}  color="#ef4444" grad="linear-gradient(90deg,#ef4444,#f87171)" />
        <StatCard icon={AlertTriangle} label="Expired Sessions" value={expiredCount} color="#fbbf24" grad="linear-gradient(90deg,#fbbf24,#f59e0b)" />
      </div>


{/* ── Filters ───────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, marginBottom: 20,
      }}>
        <Filter size={13} color="var(--text-muted)" />

        <select
          style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)', cursor: 'pointer', padding: '4px 0' }}
          value={filters.role}
          onChange={e => { setFilters(f => ({ ...f, role: e.target.value })); setPage(1); }}
        >
          <option value="">All Roles</option>
          <option value="superAdmin">Super Admin</option>
          <option value="businessAdmin">Biz Admin</option>
          <option value="employee">Employee</option>
        </select>

        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

        <select
          style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)', cursor: 'pointer', padding: '4px 0' }}
          value={filters.isActive}
          onChange={e => { setFilters(f => ({ ...f, isActive: e.target.value })); setPage(1); }}
        >
          <option value="">All Sessions</option>
          <option value="true">Active Sessions</option>
          <option value="false">Ended Sessions</option>
        </select>

        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <input type="date" style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}
            value={filters.dateFrom}
            onChange={e => { setFilters(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
          />
          <span style={{ fontSize: 11 }}>to</span>
          <input type="date" style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}
            value={filters.dateTo}
            onChange={e => { setFilters(f => ({ ...f, dateTo: e.target.value })); setPage(1); }}
          />
        </div>

        {hasFilter && (
          <>
            <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
            <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12, fontWeight: 600 }}>
              <X size={12} /> Clear
            </button>
          </>
        )}
      </div>

      {/* ── Cards Grid ────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[...Array(9)].map((_, i) => (
            <div key={i} style={{ height: 200, background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <Activity size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: 16 }} />
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No sessions found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {hasFilter ? 'No sessions match your filters.' : 'No activity recorded yet.'}
          </p>
          {hasFilter && <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={clearFilters}>Clear Filters</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {sessions.map((s, i) => <SessionCard key={i} s={s} />)}
        </div>
      )}

      {/* ── Pagination ────────────────────────── */}
      {total > LIMIT && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, padding: '14px 18px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} sessions
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <button className="btn btn-secondary btn-sm" disabled={page * LIMIT >= total} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes pulse     { 0%,100%{opacity:0.4} 50%{opacity:0.15} }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
