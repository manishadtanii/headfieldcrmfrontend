import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users, ClipboardList, TrendingUp, AlertCircle, RefreshCw,
  Trophy, Target, ChevronRight, BarChart2, Award, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { baAPI } from '../../api';

// ── Status config ──────────────────────────────────────────────────
const SC = {
  new:         { label: 'New',         color: '#818cf8', bg: '#818cf812' },
  contacted:   { label: 'Contacted',   color: '#fbbf24', bg: '#fbbf2412' },
  interested:  { label: 'Interested',  color: '#06b6d4', bg: '#06b6d412' },
  negotiation: { label: 'Negotiation', color: '#a855f7', bg: '#a855f712' },
  closed_won:  { label: 'Won',         color: '#34d399', bg: '#34d39912' },
  closed_lost: { label: 'Lost',        color: '#ef4444', bg: '#ef444412' },
  on_hold:     { label: 'On Hold',     color: '#94a3b8', bg: '#94a3b812' },
};

const GRAD = [
  'linear-gradient(135deg,#818cf8,#a78bfa)',
  'linear-gradient(135deg,#34d399,#6ee7b7)',
  'linear-gradient(135deg,#f472b6,#fb7185)',
  'linear-gradient(135deg,#fbbf24,#f59e0b)',
  'linear-gradient(135deg,#60a5fa,#818cf8)',
  'linear-gradient(135deg,#a78bfa,#f472b6)',
];
const getGrad = (name) => GRAD[(name?.charCodeAt(0) || 0) % GRAD.length];

// ── Stat Card ──────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, grad, sub }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: grad }} />
    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <Icon size={18} color={color} />
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value ?? '—'}</div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color, marginTop: 3, fontWeight: 600 }}>{sub}</div>}
  </div>
);

// ── Horizontal Bar ─────────────────────────────────────────────────
const HBar = ({ value, max, color }) => (
  <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
    <div style={{ height: '100%', width: `${max ? Math.round((value / max) * 100) : 0}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
  </div>
);

// ── Rank Badge ─────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  if (rank === 1) return <span style={{ fontSize: 16 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: 16 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: 16 }}>🥉</span>;
  return <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', minWidth: 20, display: 'inline-block', textAlign: 'center' }}>#{rank}</span>;
};

export default function LeadOverview() {
  const { slug } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('total'); // total | won | lost

  const fetchData = useCallback(() => {
    setLoading(true);
    baAPI.getLeadOverview(slug)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load overview'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const d         = data || {};
  const statusMap = d.byStatus || {};
  const totalLeads = d.total || 0;
  const rawEmps   = d.employees || [];

  // Sort employees
  const employees = [...rawEmps].sort((a, b) => b[sortBy === 'won' ? 'won' : sortBy === 'lost' ? 'lost' : 'total'] - a[sortBy === 'won' ? 'won' : sortBy === 'lost' ? 'lost' : 'total']);
  const maxTotal  = employees[0]?.total || 1;

  // Pipeline funnel data
  const funnelStages = ['new', 'contacted', 'interested', 'negotiation', 'closed_won', 'closed_lost', 'on_hold'];

  // Top performer
  const topPerformer = employees[0];

  const Skel = () => <div style={{ height: 100, background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />;

  return (
    <div className="page-content">

      {/* ── Header ────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Lead Overview</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>Team performance & pipeline analytics</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--text)', opacity: loading ? 0.6 : 1 }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* ── Top 4 Stats ───────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => <Skel key={i} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard icon={ClipboardList} label="Total Leads"    value={totalLeads}             color="#818cf8" grad="linear-gradient(90deg,#818cf8,#a78bfa)" />
          <StatCard icon={Users}         label="Assigned"       value={d.assigned}             color="#34d399" grad="linear-gradient(90deg,#34d399,#6ee7b7)"
            sub={totalLeads ? `${Math.round((d.assigned / totalLeads) * 100)}% coverage` : null} />
          <StatCard icon={AlertCircle}   label="Unassigned"     value={d.unassigned}           color="#fbbf24" grad="linear-gradient(90deg,#fbbf24,#f59e0b)" />
          <StatCard icon={Trophy}        label="Won"            value={statusMap.closed_won||0}  color="#a855f7" grad="linear-gradient(90deg,#a855f7,#c084fc)"
            sub={totalLeads ? `${Math.round(((statusMap.closed_won||0) / totalLeads) * 100)}% win rate` : null} />
        </div>
      )}

      {/* ── Charts Row ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Pipeline Funnel */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={15} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Pipeline Distribution</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Leads by stage</div>
            </div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
            ) : funnelStages.map(key => {
              const count = statusMap[key] || 0;
              const pct   = totalLeads ? Math.round((count / totalLeads) * 100) : 0;
              const cfg   = SC[key];
              return (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{cfg.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 800 }}>{count}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 30, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performer + Status Tiles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Top Performer card */}
          {topPerformer && !loading && (
            <div style={{ background: 'linear-gradient(135deg,#818cf810,#a78bfa10)', border: '1px solid #818cf830', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Award size={12} /> Top Performer
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: getGrad(topPerformer.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white', flexShrink: 0 }}>
                  {topPerformer.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{topPerformer.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{topPerformer.email}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#818cf8', lineHeight: 1 }}>{topPerformer.total}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>leads assigned</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                {[
                  { label: 'Won', value: topPerformer.won, color: '#34d399' },
                  { label: 'Lost', value: topPerformer.lost, color: '#ef4444' },
                  { label: 'Interested', value: topPerformer.interested, color: '#06b6d4' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ flex: 1, textAlign: 'center', padding: '8px', background: `${color}12`, borderRadius: 8, border: `1px solid ${color}20` }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status tiles grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, flex: 1 }}>
            {funnelStages.slice(0, 6).map(key => {
              const count = statusMap[key] || 0;
              const cfg   = SC[key];
              return (
                <div key={key} style={{ background: cfg.bg, border: `1px solid ${cfg.color}25`, borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>{count}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: cfg.color, opacity: 0.8, marginTop: 2 }}>{cfg.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Employee Performance Table ─────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={15} color="#34d399" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Employee Performance</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{employees.length} employees assigned</div>
            </div>
          </div>
          {/* Sort controls */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', padding: 4, borderRadius: 9, border: '1px solid var(--border)' }}>
            {[['total', 'By Total'], ['won', 'By Won'], ['lost', 'By Lost']].map(([val, label]) => (
              <button key={val} onClick={() => setSortBy(val)}
                style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: sortBy === val ? 'var(--bg-card)' : 'none', color: sortBy === val ? 'var(--text)' : 'var(--text-muted)', boxShadow: sortBy === val ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
              >{label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 13 }}>Loading performance data…</div>
          </div>
        ) : employees.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📊</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No data yet</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Import and assign leads to see performance here.</div>
          </div>
        ) : (
          <div>
            {employees.map((emp, idx) => {
              const wonPct  = emp.total ? Math.round((emp.won / emp.total) * 100) : 0;
              const convPct = emp.total ? Math.round(((emp.won + emp.interested + emp.negotiation) / emp.total) * 100) : 0;
              return (
                <div key={emp.employeeId} style={{ padding: '14px 20px', borderBottom: idx < employees.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>

                  {/* Rank */}
                  <div style={{ flexShrink: 0, width: 24, textAlign: 'center' }}>
                    <RankBadge rank={idx + 1} />
                  </div>

                  {/* Avatar */}
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: getGrad(emp.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'white', flexShrink: 0 }}>
                    {emp.name?.[0]?.toUpperCase()}
                  </div>

                  {/* Name */}
                  <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.email}</div>
                  </div>

                  {/* Status pills */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: '2 1 280px' }}>
                    {[
                      { label: 'Total',       value: emp.total,       color: '#818cf8' },
                      { label: 'Won',         value: emp.won,         color: '#34d399' },
                      { label: 'Interested',  value: emp.interested,  color: '#06b6d4' },
                      { label: 'Negotiation', value: emp.negotiation, color: '#a855f7' },
                      { label: 'Lost',        value: emp.lost,        color: '#ef4444' },
                      { label: 'On Hold',     value: emp.on_hold,     color: '#94a3b8' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: value > 0 ? color : 'var(--text-muted)' }}>{value}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div style={{ flex: '1 1 140px', minWidth: 120 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <HBar value={emp.total} max={maxTotal} color="#818cf8" />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 30 }}>{Math.round((emp.total / maxTotal) * 100)}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Win rate:</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#34d399' }}>{wonPct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.15} }
      `}</style>
    </div>
  );
}
