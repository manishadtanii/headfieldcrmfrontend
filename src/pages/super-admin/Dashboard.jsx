import { useState, useEffect, useRef } from 'react';
import { Building2, Users, Wifi, TrendingUp, ArrowRight, RefreshCw, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { adminAnalyticsAPI } from '../../api';
import toast from 'react-hot-toast';

// ── Animated counter hook ─────────────────────────────────────────
function useCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(t); }
      else setValue(start);
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return value;
}

// ── KPI Card ─────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color, gradient, onClick }) => {
  const count = useCounter(value ?? 0);
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '20px 22px',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.18s, box-shadow 0.18s',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${color}22`; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Gradient top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: gradient, borderRadius: '16px 16px 0 0' }} />

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>

      {/* Value */}
      <div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
          {count ?? '—'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color, fontWeight: 700, marginTop: 6 }}>{sub}</div>
        )}
      </div>

      {/* Nav arrow */}
      {onClick && (
        <div style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', opacity: 0.5,
        }}>
          <ArrowRight size={14} />
        </div>
      )}

      {/* Decorative circle */}
      <div style={{
        position: 'absolute', right: -20, bottom: -20,
        width: 90, height: 90, borderRadius: '50%',
        background: `${color}08`, pointerEvents: 'none',
      }} />
    </div>
  );
};

// ── Custom Bar Tooltip ────────────────────────────────────────────
const BarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
    }}>
      <div style={{ fontWeight: 700 }}>{payload[0].payload.name}</div>
      <div style={{ color: '#818cf8', marginTop: 4 }}>
        {payload[0].value} leads
      </div>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
    }}>
      <div style={{ fontWeight: 700 }}>{payload[0].name}</div>
      <div style={{ color: payload[0].payload.fill, marginTop: 4 }}>
        {payload[0].value} users
      </div>
    </div>
  );
};

const DONUT_COLORS = ['#818cf8', '#34d399'];

// ── Time ago ─────────────────────────────────────────────────────
function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Main Component ────────────────────────────────────────────────
export default function SADashboard() {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminAnalyticsAPI.getStats();
      setStats(res.data.data);
      setLastRefresh(new Date());
    } catch {
      toast.error('Failed to load stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const ov = stats?.overview;

  const barData = (stats?.leadsPerBusiness || []).map(b => ({
    name: b.name?.length > 12 ? b.name.slice(0, 12) + '…' : b.name,
    fullName: b.name,
    leads: b.count,
  }));

  const donutData = (stats?.roleSplit || []).filter(r => r.value > 0);

  return (
    <div className="page-content">

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Platform Overview</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>
            Welcome back, Super Admin
            {lastRefresh && (
              <span style={{ marginLeft: 12, fontSize: 12, opacity: 0.6 }}>
                · Updated {timeAgo(lastRefresh)}
              </span>
            )}
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchStats}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <KpiCard
          icon={Building2} label="Total Businesses"
          value={ov?.totalBusinesses}
          sub={`${ov?.activeBusinesses ?? 0} active`}
          color="#818cf8"
          gradient="linear-gradient(90deg, #818cf8, #a78bfa)"
          onClick={() => navigate('/admin/businesses')}
        />
        <KpiCard
          icon={Users} label="Total Users"
          value={ov?.totalUsers}
          sub={`${ov?.activeUsers ?? 0} active`}
          color="#34d399"
          gradient="linear-gradient(90deg, #34d399, #6ee7b7)"
          onClick={() => navigate('/admin/users')}
        />
        <KpiCard
          icon={Wifi} label="Live Sessions"
          value={ov?.onlineNow}
          sub="Online right now"
          color="#fbbf24"
          gradient="linear-gradient(90deg, #fbbf24, #f59e0b)"
          onClick={() => navigate('/admin/sessions')}
        />
        <KpiCard
          icon={TrendingUp} label="Total Leads"
          value={ov?.totalLeads}
          sub="Across all businesses"
          color="#f472b6"
          gradient="linear-gradient(90deg, #f472b6, #fb7185)"
        />
      </div>

      {/* ── Charts Row ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 24 }}>

        {/* Bar Chart — Leads per Business */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '20px 24px',
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Leads Per Business</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Top businesses by lead volume</div>
          </div>
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading…</div>
          ) : barData.length === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No leads data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(129,140,248,0.06)' }} />
                <Bar dataKey="leads" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut Chart — Role Split */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '20px 24px',
        }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>User Role Split</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Business Admins vs Employees</div>
          </div>
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading…</div>
          ) : donutData.length === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No users yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%" cy="50%"
                  innerRadius={62} outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Business Breakdown + Sessions ───────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

        {/* Business Breakdown Table */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Business Breakdown</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Click a row to view business details</div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
            ) : (stats?.businessBreakdown?.length === 0) ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                <Building2 size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                <br />No businesses yet
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {['Business', 'Employees', 'Online', 'Leads', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Business' ? 'left' : 'center', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.businessBreakdown?.map((b, i) => (
                    <tr
                      key={b._id || i}
                      onClick={() => navigate('/admin/businesses')}
                      style={{
                        borderTop: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{b.businessName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>/{b.businessSlug}</div>
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{b.emps ?? b.total}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                          <Circle size={7} fill={b.onlineNow > 0 ? '#34d399' : '#6b7280'} color="transparent" />
                          <span style={{ color: b.onlineNow > 0 ? '#34d399' : 'var(--text-muted)' }}>{b.onlineNow}</span>
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#818cf8' }}>{b.totalLeads}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: 11, fontWeight: 700,
                          background: b.isActive ? '#34d39918' : '#ef444418',
                          color: b.isActive ? '#34d399' : '#ef4444',
                        }}>
                          {b.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Sessions Feed */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Recent Sessions</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Live activity feed</div>
            </div>
            <button
              onClick={() => navigate('/admin/sessions')}
              style={{ fontSize: 12, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 420 }}>
            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
            ) : (stats?.recentLogins?.length === 0) ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No sessions yet</div>
            ) : (
              stats?.recentLogins?.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: 'white',
                    }}>
                      {s.userName?.[0]?.toUpperCase() || '?'}
                    </div>
                    {s.isOnline && (
                      <div style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 10, height: 10, borderRadius: '50%',
                        background: '#34d399',
                        border: '2px solid var(--bg-card)',
                      }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.userName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {s.businessName || 'Super Admin'} · {s.device}
                    </div>
                  </div>

                  {/* Time */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {s.isOnline ? (
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: '#34d399',
                        background: '#34d39915', padding: '2px 8px', borderRadius: 20,
                      }}>● Live</span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {timeAgo(s.loginAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Spin keyframe for refresh icon */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
