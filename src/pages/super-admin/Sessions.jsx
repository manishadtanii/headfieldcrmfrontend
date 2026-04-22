import { useState, useEffect } from 'react';
import { Search, Monitor, Smartphone, Globe, RefreshCw } from 'lucide-react';
import { adminAnalyticsAPI } from '../../api';
import toast from 'react-hot-toast';

const ONLINE_THRESHOLD = 10 * 60 * 1000;

const isSessionOnline = (session) => {
  if (!session.isActive) return false;
  return new Date() - new Date(session.lastActiveAt) < ONLINE_THRESHOLD;
};

const DeviceIcon = ({ device }) => {
  if (device === 'Mobile') return <Smartphone size={13} color="var(--text-muted)" />;
  return <Monitor size={13} color="var(--text-muted)" />;
};

const roleBadge = { superAdmin: 'badge-primary', businessAdmin: 'badge-info', employee: 'badge-success' };
const roleLabel = { superAdmin: 'Super Admin', businessAdmin: 'Biz Admin', employee: 'Employee' };

export default function SASessions() {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', isActive: '', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.role) params.role = filters.role;
      if (filters.isActive !== '') params.isActive = filters.isActive;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      const res = await adminAnalyticsAPI.getSessions(params);
      setSessions(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, [page, filters]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, page, filters]);

  const formatDuration = (minutes) => {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <div className="page-content">
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Activity Monitor</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>{total} total sessions</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`btn btn-sm ${autoRefresh ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAutoRefresh(a => !a)}
          >
            <RefreshCw size={14} style={autoRefresh ? { animation: 'spin 2s linear infinite' } : {}} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={fetchSessions}>
            Refresh Now
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        {/* Filter Bar */}
        <div className="filter-bar">
          <select className="form-select" style={{ width: 150 }}
            value={filters.role} onChange={e => { setFilters(f => ({ ...f, role: e.target.value })); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="superAdmin">Super Admin</option>
            <option value="businessAdmin">Biz Admin</option>
            <option value="employee">Employee</option>
          </select>
          <select className="form-select" style={{ width: 150 }}
            value={filters.isActive} onChange={e => { setFilters(f => ({ ...f, isActive: e.target.value })); setPage(1); }}>
            <option value="">All Sessions</option>
            <option value="true">Active Sessions</option>
            <option value="false">Ended Sessions</option>
          </select>
          <input type="date" className="form-input" style={{ width: 160 }}
            value={filters.dateFrom}
            onChange={e => { setFilters(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>to</span>
          <input type="date" className="form-input" style={{ width: 160 }}
            value={filters.dateTo}
            onChange={e => { setFilters(f => ({ ...f, dateTo: e.target.value })); setPage(1); }} />
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ role: '', isActive: '', dateFrom: '', dateTo: '' }); setPage(1); }}>
            Clear
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Business</th>
              <th>Status</th>
              <th>Device / Browser</th>
              <th>Login Time</th>
              <th>Duration</th>
              <th>Logout Type</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <Globe size={36} />
                    <h3>No sessions found</h3>
                    <p>No activity logs match your filters.</p>
                  </div>
                </td>
              </tr>
            ) : sessions.map((s, i) => {
              const online = isSessionOnline(s);
              return (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--bg-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 12, color: 'var(--primary-light)', flexShrink: 0
                      }}>{s.userName?.[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.userName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${roleBadge[s.role] || 'badge-muted'}`} style={{ fontSize: 11 }}>
                      {roleLabel[s.role] || s.role}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {s.businessName ? (
                      <>
                        <div style={{ fontWeight: 500 }}>{s.businessName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/{s.businessSlug}</div>
                      </>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    {online ? (
                      <span className="badge badge-success" style={{ fontSize: 11 }}>
                        <span className="online-dot" /> Online
                      </span>
                    ) : (
                      <span className="badge badge-muted" style={{ fontSize: 11 }}>
                        <span className="offline-dot" style={{ marginRight: 4 }} /> Offline
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      <DeviceIcon device={s.device} />
                      {s.browser} · {s.device}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.os}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(s.loginAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {online ? (
                      <span style={{ color: 'var(--success)' }}>Active</span>
                    ) : (
                      formatDuration(s.durationMinutes)
                    )}
                  </td>
                  <td>
                    {s.logoutType ? (
                      <span className={`badge ${s.logoutType === 'force_logout' ? 'badge-danger' : s.logoutType === 'session_expired' ? 'badge-warning' : 'badge-muted'}`}
                        style={{ fontSize: 11 }}>
                        {s.logoutType === 'force_logout' ? '⚡ Force' :
                         s.logoutType === 'session_expired' ? '⏰ Expired' : '✓ Manual'}
                      </span>
                    ) : (
                      online ? <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span> : '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {total > 20 && (
          <div className="flex-between" style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn btn-secondary btn-sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
