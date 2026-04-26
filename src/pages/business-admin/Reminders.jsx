import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  RiAlarmLine, RiCheckboxCircleLine, RiTimeLine, RiTeamLine,
  RiFilterLine, RiRefreshLine, RiCalendarEventLine, RiUserLine,
  RiAlertLine, RiSearchLine,
} from 'react-icons/ri';
import api from '../../api/axios';

// ─────────────────────────────────────────────────────────────────────────────
// BA Team Reminder Monitor
// Shows all employees' reminders with filters and today's stats
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: '#818cf8', bg: '#818cf815' },
  notified: { label: 'Notified', color: '#fbbf24', bg: '#fbbf2415' },
  snoozed:  { label: 'Snoozed',  color: '#f97316', bg: '#f9731615' },
  done:     { label: 'Done',     color: '#10b981', bg: '#10b98115' },
  missed:   { label: 'Missed',   color: '#ef4444', bg: '#ef444415' },
};

const fmt = (date) => new Date(date).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
});

const today = () => new Date().toISOString().slice(0, 10);

export default function BAReminders() {
  const { slug } = useParams();

  const [reminders,  setReminders]  = useState([]);
  const [stats,      setStats]      = useState({ pending: 0, done: 0, missed: 0, snoozed: 0, notified: 0 });
  const [employees,  setEmployees]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [meta,       setMeta]       = useState({ total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    date:       today(),
    employeeId: '',
    status:     '',
    page:       1,
  });

  // Fetch employees for filter dropdown
  useEffect(() => {
    api.get(`/b/${slug}/employees?limit=100`)
      .then((r) => setEmployees(r.data.data || []))
      .catch(() => {});
  }, [slug]);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.date)       params.date       = filters.date;
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.status)     params.status     = filters.status;
      params.page  = filters.page;
      params.limit = 20;

      const { data } = await api.get(`/b/${slug}/reminders/team`, { params });
      setReminders(data.data   || []);
      setStats(data.stats      || {});
      setMeta(data.meta        || {});
    } catch { /* silently fail */ }
    finally   { setLoading(false); }
  }, [slug, filters]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  const statCards = [
    { key: 'pending',  label: 'Pending',  icon: RiAlarmLine,           color: '#818cf8' },
    { key: 'notified', label: 'Notified', icon: RiTimeLine,             color: '#fbbf24' },
    { key: 'snoozed',  label: 'Snoozed',  icon: RiAlertLine,            color: '#f97316' },
    { key: 'done',     label: 'Done',     icon: RiCheckboxCircleLine,   color: '#10b981' },
    { key: 'missed',   label: 'Missed',   icon: RiAlertLine,            color: '#ef4444' },
  ];

  const card = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
  };

  const inputStyle = {
    padding: '9px 14px', borderRadius: 10,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 13, outline: 'none',
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200 }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#818cf820',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RiTeamLine size={22} color="#818cf8" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Team Reminders</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Monitor your team's follow-up activity
            </p>
          </div>
        </div>
      </div>

      {/* ── Today's Stats ───────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))',
        gap: 14, marginBottom: 24,
      }}>
        {statCards.map(({ key, label, icon: Icon, color }) => (
          <div key={key} style={{
            ...card,
            padding: '16px 18px',
            borderLeft: `3px solid ${color}`,
            cursor: 'pointer',
            transition: 'transform .15s',
          }}
            onClick={() => setFilter('status', filters.status === key ? '' : key)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 10,
            }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color }}>
              {stats[key] ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {label}
              {filters.status === key && (
                <span style={{ marginLeft: 6, color, fontWeight: 700 }}>✓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div style={{
        ...card,
        padding: '16px 20px', marginBottom: 20,
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <RiFilterLine size={16} color="var(--text-muted)" />

        {/* Date */}
        <input
          type="date" value={filters.date}
          onChange={(e) => setFilter('date', e.target.value)}
          style={{ ...inputStyle, colorScheme: 'dark' }}
        />

        {/* Employee filter */}
        <select
          value={filters.employeeId}
          onChange={(e) => setFilter('employeeId', e.target.value)}
          style={inputStyle}
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>{emp.name}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
          style={inputStyle}
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={fetchReminders}
          style={{
            ...inputStyle, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            marginLeft: 'auto',
          }}
        >
          <RiRefreshLine size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* ── Reminders Table ─────────────────────────────────────── */}
      <div style={{ ...card, overflow: 'hidden' }}>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 160px 160px 120px 120px',
          gap: 12, padding: '12px 20px',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
        }}>
          <span>Reminder</span>
          <span>Employee</span>
          <span>Lead</span>
          <span>Scheduled</span>
          <span>Status</span>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RiRefreshLine size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
            <div>Loading reminders...</div>
          </div>
        ) : reminders.length === 0 ? (
          <div style={{ padding: '56px', textAlign: 'center' }}>
            <RiCalendarEventLine size={48} color="var(--border)" style={{ marginBottom: 14 }} />
            <div style={{ fontWeight: 700, color: 'var(--text-muted)' }}>No reminders found</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Try changing the date or filters
            </div>
          </div>
        ) : reminders.map((r, i) => {
          const cfg   = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
          const isLast = i === reminders.length - 1;
          return (
            <div key={r._id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 160px 160px 120px 120px',
              gap: 12, padding: '14px 20px',
              borderBottom: isLast ? 'none' : '1px solid var(--border)',
              alignItems: 'center',
              transition: 'background .1s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {/* Title + description */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</div>
                {r.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>
                    {r.description}
                  </div>
                )}
              </div>

              {/* Employee */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#818cf8,#6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0,
                }}>
                  {r.employee?.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.employee?.name || '—'}
                </span>
              </div>

              {/* Lead */}
              <div style={{ fontSize: 13, color: r.lead ? 'var(--text)' : 'var(--text-muted)' }}>
                {r.lead?.name || '—'}
              </div>

              {/* Scheduled */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {fmt(r.scheduledAt)}
              </div>

              {/* Status badge */}
              <div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 12px', borderRadius: 20,
                  background: cfg.bg, color: cfg.color,
                  fontSize: 11, fontWeight: 800,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color }} />
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {meta.total} reminder{meta.total !== 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setFilters((f) => ({ ...f, page: p }))}
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: filters.page === p ? '#818cf8' : 'var(--bg-elevated)',
                    color: filters.page === p ? 'white' : 'var(--text)',
                    cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
