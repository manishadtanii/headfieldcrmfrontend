import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Users, Wifi, TrendingUp, Globe,
  Mail, Shield, Circle, CheckCircle, XCircle, Clock,
  ToggleRight, ToggleLeft, Edit2, ExternalLink, Layers,
  Tag, Zap, UserCheck, Trophy,
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

// ── KPI Card ─────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, color, gradient }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '18px 20px',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: gradient }} />
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    }}>
      <Icon size={18} color={color} />
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px' }}>{value ?? '—'}</div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
    <div style={{
      position: 'absolute', right: -14, bottom: -14,
      width: 72, height: 72, borderRadius: '50%', background: `${color}08`,
    }} />
  </div>
);

// ── Custom Tooltip ────────────────────────────────────────────────
const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 700 }}>{payload[0].name || payload[0].payload?.status || payload[0].payload?.source}</div>
      <div style={{ color: payload[0].payload?.fill || '#818cf8', marginTop: 3 }}>{payload[0].value} leads</div>
    </div>
  );
};

const STATUS_COLORS = {
  new: '#818cf8', contacted: '#fbbf24', 'follow-up': '#3b82f6',
  interested: '#8b5cf6', won: '#34d399', lost: '#ef4444', default: '#6b7280',
};

const SOURCE_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f472b6', '#3b82f6', '#8b5cf6'];

// ── Main Component ────────────────────────────────────────────────
export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

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
      toast.error('Failed to toggle status.');
    } finally {
      setToggling(false);
    }
  };

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div className="spinner" />
    </div>
  );

  if (!data) return (
    <div className="page-content">
      <p style={{ color: 'var(--text-muted)' }}>Business not found.</p>
    </div>
  );

  const statusChartData = data.leadStatusBreakdown?.map(s => ({
    name: s.status, value: s.count,
    fill: STATUS_COLORS[s.status?.toLowerCase()] || STATUS_COLORS.default,
  })) || [];

  const sourceChartData = data.leadSourceBreakdown?.map((s, i) => ({
    source: s.source, count: s.count,
    fill: SOURCE_COLORS[i % SOURCE_COLORS.length],
  })) || [];

  return (
    <div className="page-content">

      {/* ── Header ──────────────────────────────────────────────── */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <code style={{ fontSize: 12, background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 5, color: '#818cf8' }}>/{data.slug}/login</code>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                  background: data.isActive ? '#34d39918' : '#ef444418',
                  color: data.isActive ? '#34d399' : '#ef4444',
                }}>{data.isActive ? '● Active' : '○ Inactive'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
              className="btn btn-secondary btn-sm"
              onClick={() => window.open(`/${data.slug}/login`, '_blank')}
            >
              <ExternalLink size={13} /> Open Login
            </button>
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
        </div>

        {data.description && (
          <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)', maxWidth: 600 }}>{data.description}</p>
        )}
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        <KpiCard icon={TrendingUp} label="Total Leads" value={data.stats?.totalLeads} color="#818cf8" gradient="linear-gradient(90deg,#818cf8,#a78bfa)" />
        <KpiCard icon={Users}      label="Total Employees" value={data.stats?.totalEmployees} color="#34d399" gradient="linear-gradient(90deg,#34d399,#6ee7b7)" />
        <KpiCard icon={UserCheck}  label="Active Employees" value={data.stats?.activeEmployees} color="#3b82f6" gradient="linear-gradient(90deg,#3b82f6,#60a5fa)" />
        <KpiCard icon={Wifi}       label="Online Now" value={data.stats?.onlineNow} color="#fbbf24" gradient="linear-gradient(90deg,#fbbf24,#f59e0b)" />
        <KpiCard icon={Zap}        label="Webhook Leads" value={data.stats?.webhookLeads} color="#f472b6" gradient="linear-gradient(90deg,#f472b6,#fb7185)" />
      </div>

      {/* ── Admin Info + Pipeline Stages ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Business Admin Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={14} color="#818cf8" /> Business Admin
          </div>
          {data.admin ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: 'white', flexShrink: 0,
                }}>
                  {data.admin.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{data.admin.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{data.admin.email}</div>
                </div>
                <span style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                  background: data.admin.isActive ? '#34d39918' : '#ef444418',
                  color: data.admin.isActive ? '#34d399' : '#ef4444',
                }}>
                  {data.admin.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {[
                { icon: Mail,  label: 'Email',    value: data.admin.email },
                { icon: Clock, label: 'Joined',   value: new Date(data.admin.createdAt).toLocaleDateString('en-IN') },
                { icon: Globe, label: 'Login URL', value: `/${data.slug}/login` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                  <Icon size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 70 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
              No admin assigned yet.
            </div>
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

      {/* ── Charts ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Lead Status Donut */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Lead Status Distribution</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Breakdown by pipeline stage</div>
          {statusChartData.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No leads yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                  {statusChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={<ChartTip />} />
                <Legend iconType="circle" iconSize={7} formatter={(v) => <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Lead Source Bar */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Lead Sources</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Where leads come from</div>
          {sourceChartData.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No source data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sourceChartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="source" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(129,140,248,0.05)' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
                  {sourceChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Employee Performance + Sessions ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>

        {/* Employee Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={14} color="#818cf8" /> Employee Performance
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{data.employees?.length || 0} employees</div>
          </div>
          {!data.employees?.length ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No employees yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {['Employee', 'Status', 'Leads', 'Won', 'Conversion', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Employee' ? 'left' : 'center', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.employees.map((emp, i) => (
                  <tr key={emp._id || i} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--primary-glow)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: 'var(--primary-light)', flexShrink: 0,
                        }}>{emp.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: emp.isActive ? '#34d39918' : '#ef444418',
                        color: emp.isActive ? '#34d399' : '#ef4444',
                      }}>{emp.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#818cf8' }}>{emp.leadsAssigned}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#34d399' }}>{emp.leadsWon}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <div style={{ width: 48, height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${emp.conversionRate}%`, background: '#34d399', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 30 }}>{emp.conversionRate}%</span>
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

        {/* Recent Sessions */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Sessions</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Last 8 logins</div>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 340 }}>
            {!data.recentSessions?.length ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No sessions</div>
            ) : data.recentSessions.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: s.role === 'businessAdmin' ? 'linear-gradient(135deg,#818cf8,#a78bfa)' : 'linear-gradient(135deg,#34d399,#6ee7b7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: 'white',
                  }}>
                    {s.userName?.[0]?.toUpperCase() || '?'}
                  </div>
                  {s.isOnline && (
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 9, height: 9, borderRadius: '50%', background: '#34d399', border: '2px solid var(--bg-card)',
                    }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.userName}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.device} · {s.browser}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {s.isOnline ? (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', background: '#34d39914', padding: '1px 7px', borderRadius: 20 }}>● Live</span>
                  ) : (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{timeAgo(s.loginAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Lead Sources Config + Meta ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Lead Sources Config */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={14} color="#818cf8" /> Lead Sources Configured
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(data.leadSources || []).map((src, i) => (
              <span key={i} style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: `${SOURCE_COLORS[i % SOURCE_COLORS.length]}18`,
                color: SOURCE_COLORS[i % SOURCE_COLORS.length],
                border: `1px solid ${SOURCE_COLORS[i % SOURCE_COLORS.length]}40`,
              }}>{src}</span>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={14} color="#818cf8" /> Business Info
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Created',        value: new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'Slug',           value: data.slug },
              { label: 'Custom Fields',  value: `${data.customFields?.length || 0} configured` },
              { label: 'Webhook Leads',  value: `${data.stats?.webhookLeads || 0} via web forms` },
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
    </div>
  );
}
