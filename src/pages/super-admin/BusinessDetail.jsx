import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Users, Wifi, TrendingUp, Mail, Shield,
  Circle, Clock, ToggleRight, ToggleLeft, Layers, Tag, Zap,
  UserCheck, X, Phone, MapPin, Search, Filter, ChevronDown,
  Loader2,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { adminBusinessAPI } from '../../api';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return '—';
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-IN');
}

const STATUS_COLORS = {
  new: '#818cf8', contacted: '#fbbf24', interested: '#3b82f6',
  negotiation: '#8b5cf6', closed_won: '#34d399', closed_lost: '#ef4444',
  on_hold: '#6b7280',
};
const SOURCE_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f472b6', '#3b82f6', '#8b5cf6'];

// ── Status badge ─────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const color = STATUS_COLORS[status] || '#6b7280';
  const label = status?.replace('_', ' ') || 'Unknown';
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: `${color}18`, color, border: `1px solid ${color}30`,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
};

const PriorityDot = ({ priority }) => {
  const c = { high: '#ef4444', medium: '#fbbf24', low: '#34d399' }[priority] || '#6b7280';
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c, marginRight: 5 }} />;
};

// ── Leads Drawer ─────────────────────────────────────────────────
const LeadsDrawer = ({ businessId, title, subtitle, filterParams, onClose }) => {
  const [leads, setLeads]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await adminBusinessAPI.getLeads(businessId, { ...filterParams, limit: 30, page });
      setLeads(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to fetch leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [page]);

  const filtered = useMemo(() =>
    leads.filter(l =>
      !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search) ||
      l.email?.toLowerCase().includes(search.toLowerCase())
    ), [leads, search]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
        width: 'min(680px, 95vw)',
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.22s ease',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              {loading ? 'Loading…' : `${total} total records`}
              {subtitle && ` · ${subtitle}`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '9px 12px',
          }}>
            <Search size={13} color="var(--text-muted)" />
            <input
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)', flex: 1 }}
              placeholder="Search by name, phone, email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10, color: 'var(--text-muted)' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Loading leads…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No leads found
            </div>
          ) : (
            filtered.map((lead, i) => (
              <div
                key={lead._id || i}
                style={{
                  padding: '14px 24px',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  {/* Left — Lead info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <PriorityDot priority={lead.priority} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{lead.name}</span>
                      <StatusBadge status={lead.status} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Phone size={11} color="var(--text-muted)" /> {lead.phone}
                      </span>
                      {lead.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                          <Mail size={11} color="var(--text-muted)" /> {lead.email}
                        </span>
                      )}
                      {lead.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                          <MapPin size={11} color="var(--text-muted)" /> {lead.location}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                      {lead.source && (
                        <span style={{ fontSize: 11, color: '#818cf8', background: '#818cf815', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                          {lead.source}
                        </span>
                      )}
                      {lead.budget && (
                        <span style={{ fontSize: 11, color: '#fbbf24', background: '#fbbf2415', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                          💰 {lead.budget}
                        </span>
                      )}
                      {lead.requirement && (
                        <span style={{ fontSize: 11, color: '#34d399', background: '#34d39915', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                          🏠 {lead.requirement}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: lead.assignedTo ? '#34d399' : '#6b7280' }}>
                      {lead.assignedTo?.name || 'Unassigned'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination footer */}
        {total > 30 && (
          <div style={{
            padding: '12px 24px', borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0, background: 'var(--bg-elevated)',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Page {page} · {total} total
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1}
                onClick={() => setPage(p => p - 1)}>Prev</button>
              <button className="btn btn-secondary btn-sm" disabled={page * 30 >= total}
                onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
};

// ── Employees Drawer ──────────────────────────────────────────────
const EmployeesDrawer = ({ employees, filterActive, onClose }) => {
  const [search, setSearch] = useState('');
  const list = useMemo(() => {
    let arr = filterActive === null ? employees : employees.filter(e => e.isActive === filterActive);
    if (search) arr = arr.filter(e =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase())
    );
    return arr;
  }, [employees, filterActive, search]);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
        width: 'min(560px, 95vw)',
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.22s ease',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>
              {filterActive === true ? 'Active Employees' : filterActive === false ? 'Inactive Employees' : 'All Employees'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{list.length} employees</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px' }}>
            <Search size={13} color="var(--text-muted)" />
            <input style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)', flex: 1 }}
              placeholder="Search employees…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>No employees found</div>
          ) : list.map((emp, i) => (
            <div key={emp._id || i} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#818cf8,#a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800, color: 'white',
              }}>
                {emp.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{emp.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{emp.email}</div>
              </div>
              {/* Stats */}
              <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#818cf8' }}>{emp.leadsAssigned}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Leads</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#34d399' }}>{emp.leadsWon}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Won</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fbbf24' }}>{emp.conversionRate}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Conv.</div>
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: emp.isActive ? '#34d39918' : '#ef444418',
                color: emp.isActive ? '#34d399' : '#ef4444',
                border: `1px solid ${emp.isActive ? '#34d39930' : '#ef444430'}`,
              }}>{emp.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
};

// ── Sessions Drawer ───────────────────────────────────────────────
const SessionsDrawer = ({ sessions, onClose }) => {
  const online = sessions.filter(s => s.isOnline);
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
        width: 'min(480px, 95vw)',
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.22s ease',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>Live Sessions</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>● {online.length} online</span> · {sessions.length} recent
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>No sessions</div>
          ) : sessions.map((s, i) => (
            <div key={i} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: s.role === 'businessAdmin' ? 'linear-gradient(135deg,#818cf8,#a78bfa)' : 'linear-gradient(135deg,#34d399,#6ee7b7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, color: 'white',
                }}>{s.userName?.[0]?.toUpperCase()}</div>
                {s.isOnline && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#34d399', border: '2px solid var(--bg-card)' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.userName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.role === 'businessAdmin' ? 'Business Admin' : 'Employee'} · {s.device} · {s.browser}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {s.isOnline
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', background: '#34d39914', padding: '2px 8px', borderRadius: 20 }}>● Live</span>
                  : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(s.loginAt)}</span>}
                {s.durationMinutes > 0 && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{s.durationMinutes}m session</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
};

// ── KPI Card (clickable) ──────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, color, gradient, onClick, clickable = true }) => (
  <div
    onClick={clickable && value > 0 ? onClick : undefined}
    style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '18px 20px',
      position: 'relative', overflow: 'hidden',
      cursor: clickable && value > 0 ? 'pointer' : 'default',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
    onMouseEnter={e => { if (clickable && value > 0) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}22`; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: gradient }} />
    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <Icon size={18} color={color} />
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px' }}>{value ?? '—'}</div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
    {clickable && value > 0 && (
      <div style={{ fontSize: 10, color, marginTop: 5, fontWeight: 600 }}>Click to view →</div>
    )}
    <div style={{ position: 'absolute', right: -14, bottom: -14, width: 72, height: 72, borderRadius: '50%', background: `${color}08` }} />
  </div>
);

// ── Chart Tooltip ─────────────────────────────────────────────────
const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 700 }}>{payload[0].payload?.status || payload[0].payload?.source || payload[0].name}</div>
      <div style={{ color: payload[0].payload?.fill || '#818cf8', marginTop: 3 }}>{payload[0].value} leads</div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [toggling, setToggling] = useState(false);

  // Drawer state
  const [drawer, setDrawer] = useState(null);
  // drawer = { type: 'leads' | 'employees' | 'sessions', ...extra }

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await adminBusinessAPI.getById(id);
      setData(res.data.data);
    } catch {
      toast.error('Failed to load business details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchDetail(); }, [id]);

  const handleToggle = async () => {
    if (!confirm(`${data.isActive ? 'Deactivate' : 'Activate'} "${data.name}"?`)) return;
    setToggling(true);
    try {
      const res = await adminBusinessAPI.toggle(id);
      toast.success(res.data.message);
      fetchDetail();
    } catch {
      toast.error('Failed.');
    } finally {
      setToggling(false);
    }
  };

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div className="spinner" />
    </div>
  );
  if (!data) return <div className="page-content"><p style={{ color: 'var(--text-muted)' }}>Business not found.</p></div>;

  const statusChartData = (data.leadStatusBreakdown || []).map(s => ({
    name: s.status, value: s.count,
    fill: STATUS_COLORS[s.status?.toLowerCase()] || '#6b7280',
  }));
  const sourceChartData = (data.leadSourceBreakdown || []).map((s, i) => ({
    source: s.source, count: s.count, fill: SOURCE_COLORS[i % SOURCE_COLORS.length],
  }));

  return (
    <div className="page-content">

      {/* ── Header ─────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate('/admin/businesses')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}
        >
          <ArrowLeft size={14} /> Back to Businesses
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: 'white', flexShrink: 0,
            }}>
              {data.logo ? <img src={data.logo} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8 }} /> : data.name?.[0]}
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px' }}>{data.name}</h1>
              <span style={{
                marginTop: 4, display: 'inline-block',
                fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                background: data.isActive ? '#34d39918' : '#ef444418',
                color: data.isActive ? '#34d399' : '#ef4444',
              }}>{data.isActive ? '● Active' : '○ Inactive'}</span>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleToggle}
            disabled={toggling}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            {data.isActive ? <ToggleRight size={14} color="#34d399" /> : <ToggleLeft size={14} />}
            {data.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>

        {data.description && (
          <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)', maxWidth: 600 }}>{data.description}</p>
        )}
      </div>

      {/* ── KPI Cards (all clickable) ─────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        <KpiCard
          icon={TrendingUp} label="Total Leads"         value={data.stats?.totalLeads}      color="#818cf8" gradient="linear-gradient(90deg,#818cf8,#a78bfa)"
          onClick={() => setDrawer({ type: 'leads', title: 'All Leads', filterParams: {} })}
        />
        <KpiCard
          icon={Users}      label="Total Employees"     value={data.stats?.totalEmployees}   color="#34d399" gradient="linear-gradient(90deg,#34d399,#6ee7b7)"
          onClick={() => setDrawer({ type: 'employees', filterActive: null })}
        />
        <KpiCard
          icon={UserCheck}  label="Active Employees"    value={data.stats?.activeEmployees}  color="#3b82f6" gradient="linear-gradient(90deg,#3b82f6,#60a5fa)"
          onClick={() => setDrawer({ type: 'employees', filterActive: true })}
        />
        <KpiCard
          icon={Wifi}       label="Online Now"           value={data.stats?.onlineNow}        color="#fbbf24" gradient="linear-gradient(90deg,#fbbf24,#f59e0b)"
          onClick={() => setDrawer({ type: 'sessions' })}
        />
        <KpiCard
          icon={Zap}        label="Webhook Leads"        value={data.stats?.webhookLeads}     color="#f472b6" gradient="linear-gradient(90deg,#f472b6,#fb7185)"
          onClick={() => setDrawer({ type: 'leads', title: 'Webhook / Web Form Leads', filterParams: { source: 'Webhook' } })}
        />
      </div>

      {/* ── Admin Info + Pipeline ─────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Admin Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={14} color="#818cf8" /> Business Admin
          </div>
          {data.admin ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#818cf8,#a78bfa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: 'white', flexShrink: 0,
                }}>{data.admin.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{data.admin.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{data.admin.email}</div>
                </div>
                <span style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                  background: data.admin.isActive ? '#34d39918' : '#ef444418',
                  color: data.admin.isActive ? '#34d399' : '#ef4444',
                }}>{data.admin.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              {[
                { icon: Mail, label: 'Email',  value: data.admin.email },
                { icon: Clock, label: 'Joined', value: new Date(data.admin.createdAt).toLocaleDateString('en-IN') },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                  <Icon size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 60 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>No admin assigned yet.</div>
          )}
        </div>

        {/* Pipeline Stages */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={14} color="#818cf8" /> Pipeline Stages
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(data.pipelineStages || []).sort((a, b) => a.order - b.order).map((stage, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{stage.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stage {stage.order + 1}</span>
                {stage.isDefault && (
                  <span style={{ fontSize: 10, background: '#818cf820', color: '#818cf8', padding: '1px 7px', borderRadius: 20, fontWeight: 700 }}>Default</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Status donut — clickable */}
        <div
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', cursor: 'pointer' }}
          onClick={() => setDrawer({ type: 'leads', title: 'All Leads by Status', filterParams: {} })}
        >
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Lead Status Distribution</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Click to view leads →</div>
          {statusChartData.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No leads yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                  {statusChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip content={<ChartTip />} />
                <Legend iconType="circle" iconSize={7} formatter={v => <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{v?.replace('_', ' ')}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Source bar — clickable */}
        <div
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', cursor: 'pointer' }}
          onClick={() => setDrawer({ type: 'leads', title: 'All Leads by Source', filterParams: {} })}
        >
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Lead Sources</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Click to view leads →</div>
          {sourceChartData.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No source data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sourceChartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="source" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(129,140,248,0.05)' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
                  {sourceChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Employee Table + Sessions ─────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>
        {/* Employee Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={14} color="#818cf8" /> Employee Performance
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{data.employees?.length || 0} employees</div>
            </div>
            <button
              style={{ fontSize: 12, color: '#818cf8', background: '#818cf815', border: '1px solid #818cf830', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setDrawer({ type: 'employees', filterActive: null })}
            >View All →</button>
          </div>
          {!data.employees?.length ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No employees yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {['Employee', 'Status', 'Leads', 'Won', 'Conv.%', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Employee' ? 'left' : 'center', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.employees.map((emp, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--primary-light)', flexShrink: 0 }}>
                          {emp.name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: emp.isActive ? '#34d39918' : '#ef444418', color: emp.isActive ? '#34d399' : '#ef4444' }}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#818cf8' }}>{emp.leadsAssigned}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#34d399' }}>{emp.leadsWon}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${emp.conversionRate}%`, background: '#34d399', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.conversionRate}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(emp.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sessions */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Sessions</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Last 8 logins</div>
            </div>
            <button
              style={{ fontSize: 12, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setDrawer({ type: 'sessions' })}
            >View all →</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 340 }}>
            {(data.recentSessions || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: s.role === 'businessAdmin' ? 'linear-gradient(135deg,#818cf8,#a78bfa)' : 'linear-gradient(135deg,#34d399,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>
                    {s.userName?.[0]?.toUpperCase()}
                  </div>
                  {s.isOnline && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: '#34d399', border: '2px solid var(--bg-card)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.userName}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.device}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {s.isOnline
                    ? <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', background: '#34d39914', padding: '1px 7px', borderRadius: 20 }}>● Live</span>
                    : <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{timeAgo(s.loginAt)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Lead Sources Config + Meta ─────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={14} color="#818cf8" /> Lead Sources Configured
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(data.leadSources || []).map((src, i) => (
              <span
                key={i}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: `${SOURCE_COLORS[i % SOURCE_COLORS.length]}18`,
                  color: SOURCE_COLORS[i % SOURCE_COLORS.length],
                  border: `1px solid ${SOURCE_COLORS[i % SOURCE_COLORS.length]}40`,
                  cursor: 'pointer',
                }}
                onClick={() => setDrawer({ type: 'leads', title: `Leads — ${src}`, filterParams: { source: src } })}
                title={`View ${src} leads`}
              >{src}</span>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={14} color="#818cf8" /> Business Info
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Created',         value: new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'Custom Fields',   value: `${data.customFields?.length || 0} configured` },
              { label: 'Webhook Leads',   value: `${data.stats?.webhookLeads || 0} via web forms` },
              { label: 'Pipeline Stages', value: `${data.pipelineStages?.length || 0} stages` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Drawers ────────────────────────────── */}
      {drawer?.type === 'leads' && (
        <LeadsDrawer
          businessId={id}
          title={drawer.title}
          filterParams={drawer.filterParams}
          onClose={() => setDrawer(null)}
        />
      )}
      {drawer?.type === 'employees' && (
        <EmployeesDrawer
          employees={data.employees || []}
          filterActive={drawer.filterActive}
          onClose={() => setDrawer(null)}
        />
      )}
      {drawer?.type === 'sessions' && (
        <SessionsDrawer
          sessions={data.recentSessions || []}
          onClose={() => setDrawer(null)}
        />
      )}

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
