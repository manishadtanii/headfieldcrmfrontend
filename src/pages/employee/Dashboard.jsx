import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ClipboardList, PhoneCall, TrendingUp, XCircle, ArrowRight,
  Pin, Megaphone, RefreshCw, Zap, Star, Clock, CheckCircle2,
  AlertCircle, PauseCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { empAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

// ── Status Config ────────────────────────────────────────────────
const SC = {
  new:         { label: 'New',         color: '#818cf8', bg: '#818cf812' },
  contacted:   { label: 'Contacted',   color: '#fbbf24', bg: '#fbbf2412' },
  interested:  { label: 'Interested',  color: '#06b6d4', bg: '#06b6d412' },
  negotiation: { label: 'Negotiation', color: '#a855f7', bg: '#a855f712' },
  closed_won:  { label: 'Won ✓',       color: '#34d399', bg: '#34d39912' },
  closed_lost: { label: 'Lost ✗',      color: '#ef4444', bg: '#ef444412' },
  on_hold:     { label: 'On Hold',     color: '#94a3b8', bg: '#94a3b812' },
};

const GRAD = [
  'linear-gradient(135deg,#818cf8,#a78bfa)',
  'linear-gradient(135deg,#34d399,#6ee7b7)',
  'linear-gradient(135deg,#f472b6,#fb7185)',
  'linear-gradient(135deg,#fbbf24,#f59e0b)',
];
const getGrad = (name) => GRAD[(name?.charCodeAt(0) || 0) % GRAD.length];

function timeAgo(date) {
  if (!date) return '—';
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── Stat Card ─────────────────────────────────────────────────────
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

export default function EmpDashboard() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow]         = useState(new Date());

  const fetchDash = useCallback(() => {
    setLoading(true);
    empAPI.getDashboard(slug)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { fetchDash(); }, [fetchDash]);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const stats        = data?.stats        || {};
  const recentLeads  = data?.recentLeads  || [];
  const instructions = data?.instructions || [];

  const wonPct  = stats.total ? Math.round((stats.won  / stats.total) * 100) : 0;
  const lostPct = stats.total ? Math.round((stats.lost / stats.total) * 100) : 0;

  const hour    = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0];

  const PIPELINE = [
    { key: 'new',         w: stats.new,         color: '#818cf8' },
    { key: 'contacted',   w: stats.contacted,   color: '#fbbf24' },
    { key: 'interested',  w: stats.interested,  color: '#06b6d4' },
    { key: 'negotiation', w: stats.negotiation, color: '#a855f7' },
    { key: 'won',         w: stats.won,         color: '#34d399' },
    { key: 'lost',        w: stats.lost,        color: '#ef4444' },
    { key: 'hold',        w: stats.on_hold,     color: '#94a3b8' },
  ];

  const Skel = ({ h = 100 }) => (
    <div style={{ height: h, background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
  );

  return (
    <div className="page-content">

      {/* ── Welcome Banner ────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)', borderRadius: 18, padding: '24px 28px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(129,140,248,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 120, width: 90, height: 90, borderRadius: '50%', background: 'rgba(167,139,250,0.10)' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: getGrad(user?.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, color: 'white', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                {greeting}
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px', margin: 0 }}>
                {firstName}! 👋
              </h1>
              <div style={{ fontSize: 12, color: '#c7d2fe', marginTop: 3 }}>
                {stats.total > 0 ? `You have ${stats.new || 0} new leads to follow up` : 'Your leads will appear here once assigned'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399' }}>{stats.won || 0}</div>
              <div style={{ fontSize: 10, color: '#a5b4fc', fontWeight: 600 }}>WON</div>
            </div>
            <div style={{ width: 1, background: '#ffffff20', flexShrink: 0 }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>{wonPct}%</div>
              <div style={{ fontSize: 10, color: '#a5b4fc', fontWeight: 600 }}>WIN RATE</div>
            </div>
            <div style={{ width: 1, background: '#ffffff20', flexShrink: 0 }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24' }}>{stats.total || 0}</div>
              <div style={{ fontSize: 10, color: '#a5b4fc', fontWeight: 600 }}>TOTAL</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => <Skel key={i} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard icon={ClipboardList} label="Total Assigned" value={stats.total}    color="#818cf8" grad="linear-gradient(90deg,#818cf8,#a78bfa)" sub={`${stats.new || 0} new`} />
          <StatCard icon={PhoneCall}     label="Contacted"       value={stats.contacted} color="#fbbf24" grad="linear-gradient(90deg,#fbbf24,#f59e0b)" sub={`${stats.interested || 0} interested`} />
          <StatCard icon={TrendingUp}    label="Won"             value={stats.won}      color="#34d399" grad="linear-gradient(90deg,#34d399,#6ee7b7)" sub={`${wonPct}% conversion`} />
          <StatCard icon={XCircle}       label="Lost"            value={stats.lost}     color="#ef4444" grad="linear-gradient(90deg,#ef4444,#f87171)" sub={`${stats.on_hold || 0} on hold`} />
        </div>
      )}

      {/* ── Pipeline Bar ─────────────────────────────────────── */}
      {!loading && stats.total > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Pipeline Progress</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stats.total} total leads</div>
          </div>
          {/* Stacked bar */}
          <div style={{ display: 'flex', height: 12, borderRadius: 8, overflow: 'hidden', gap: 2, marginBottom: 14 }}>
            {PIPELINE.filter(s => s.w > 0).map(s => (
              <div key={s.key} title={`${s.key}: ${s.w}`}
                style={{ width: `${(s.w / stats.total) * 100}%`, background: s.color, borderRadius: 4, transition: 'width .5s', cursor: 'default' }}
              />
            ))}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'New',         val: stats.new,         color: '#818cf8' },
              { label: 'Contacted',   val: stats.contacted,   color: '#fbbf24' },
              { label: 'Interested',  val: stats.interested,  color: '#06b6d4' },
              { label: 'Negotiation', val: stats.negotiation, color: '#a855f7' },
              { label: 'Won',         val: stats.won,         color: '#34d399' },
              { label: 'Lost',        val: stats.lost,        color: '#ef4444' },
              { label: 'On Hold',     val: stats.on_hold,     color: '#94a3b8' },
            ].filter(s => s.val > 0).map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                <span style={{ fontWeight: 800, color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom grid ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Recent Leads */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Leads</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Your latest assigned</div>
            </div>
            <button onClick={() => navigate(`/${slug}/emp/my-leads`)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
              View All <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 20 }}>
              {[...Array(4)].map((_, i) => <div key={i} style={{ height: 56, borderRadius: 10, background: 'var(--bg-elevated)', marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : recentLeads.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontWeight: 700 }}>No leads yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Ask your manager to assign leads</div>
            </div>
          ) : recentLeads.map((lead, i) => {
            const cfg = SC[lead.status] || SC.new;
            return (
              <div key={lead._id}
                onClick={() => navigate(`/${slug}/emp/my-leads`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < recentLeads.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Avatar */}
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: getGrad(lead.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                  {lead.name?.[0]?.toUpperCase()}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{lead.phone} · {lead.source || 'No source'}</div>
                </div>
                {/* Status + time */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                    {cfg.label}
                  </span>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{timeAgo(lead.updatedAt)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fbbf2418', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Megaphone size={14} color="#fbbf24" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Manager Instructions</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{instructions.length} messages</div>
              </div>
            </div>
            {instructions.some(i => i.isPinned) && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', background: '#fbbf2412', padding: '3px 8px', borderRadius: 20, border: '1px solid #fbbf2430' }}>
                📌 Pinned
              </span>
            )}
          </div>

          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20 }}>
                {[...Array(3)].map((_, i) => <div key={i} style={{ height: 72, borderRadius: 10, background: 'var(--bg-elevated)', marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />)}
              </div>
            ) : instructions.length === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>
                <div style={{ fontWeight: 700 }}>No instructions yet</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Your manager hasn't sent any messages</div>
              </div>
            ) : [...instructions]
                .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                .map((inst, i, arr) => (
              <div key={inst._id} style={{ padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', borderLeft: inst.isPinned ? '3px solid #fbbf24' : '3px solid transparent', background: inst.isPinned ? 'rgba(251,191,36,0.03)' : 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  {inst.isPinned ? (
                    <Pin size={13} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
                  ) : (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', flexShrink: 0, marginTop: 5 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 6, color: 'var(--text)' }}>{inst.text}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8' }}>
                        {inst.createdBy?.name || 'Manager'}
                      </span>
                      <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border)' }} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />
                        {timeAgo(inst.createdAt)}
                      </span>
                      {inst.isPinned && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', background: '#fbbf2412', padding: '1px 6px', borderRadius: 10 }}>PINNED</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.15} }
      `}</style>
    </div>
  );
}
