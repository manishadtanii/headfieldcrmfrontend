import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ClipboardList, PhoneCall, TrendingUp, XCircle,
  ArrowRight, Pin, Megaphone, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { empAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

// ── Status Config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'var(--primary)',     bg: 'rgba(99,102,241,0.12)' },
  contacted:   { label: 'Contacted',   color: 'var(--warning)',     bg: 'rgba(245,158,11,0.12)' },
  interested:  { label: 'Interested',  color: '#06b6d4',            bg: 'rgba(6,182,212,0.12)'  },
  negotiation: { label: 'Negotiation', color: '#a855f7',            bg: 'rgba(168,85,247,0.12)' },
  closed_won:  { label: 'Won ✓',       color: 'var(--success)',     bg: 'rgba(16,185,129,0.12)' },
  closed_lost: { label: 'Lost ✗',      color: 'var(--danger)',      bg: 'rgba(239,68,68,0.12)'  },
  on_hold:     { label: 'On Hold',     color: 'var(--text-muted)',  bg: 'rgba(100,116,139,0.12)' },
};

// ── Stat Card ─────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card" style={{ cursor: 'default' }}>
    <div className="stat-icon" style={{ background: `${color}20` }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────
export default function EmpDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    empAPI.getDashboard(slug)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [slug]);

  const stats       = data?.stats        || {};
  const recentLeads = data?.recentLeads  || [];
  const instructions = data?.instructions || [];

  const wonPct = stats.total
    ? Math.round((stats.won / stats.total) * 100)
    : 0;

  return (
    <div className="page-content">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted" style={{ marginTop: 4 }}>
            Here's your lead activity overview
          </p>
        </div>
        <button className="btn btn-ghost" onClick={fetch} title="Refresh">
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card" style={{ minHeight: 90, opacity: 0.25 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-4 mb-6">
          <StatCard
            icon={ClipboardList}
            label="Total Assigned"
            value={stats.total}
            color="var(--primary)"
            sub={`${stats.new || 0} new`}
          />
          <StatCard
            icon={PhoneCall}
            label="Contacted"
            value={stats.contacted}
            color="var(--warning)"
            sub={`${stats.interested || 0} interested`}
          />
          <StatCard
            icon={TrendingUp}
            label="Won"
            value={stats.won}
            color="var(--success)"
            sub={`${wonPct}% conversion`}
          />
          <StatCard
            icon={XCircle}
            label="Lost"
            value={stats.lost}
            color="var(--danger)"
            sub={`${stats.on_hold || 0} on hold`}
          />
        </div>
      )}

      {/* ── Progress Bar ─────────────────────────────────────── */}
      {!loading && stats.total > 0 && (
        <div className="card mb-6" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>Lead Pipeline Progress</span>
            <span style={{ color: 'var(--text-muted)' }}>{stats.total} total</span>
          </div>
          <div style={{ display: 'flex', height: 10, borderRadius: 8, overflow: 'hidden', gap: 2 }}>
            {[
              { key: 'new',       w: stats.new,         color: 'var(--primary)'    },
              { key: 'contacted', w: stats.contacted,   color: 'var(--warning)'    },
              { key: 'interested',w: stats.interested,  color: '#06b6d4'           },
              { key: 'negotiation',w: stats.negotiation,color: '#a855f7'           },
              { key: 'won',       w: stats.won,         color: 'var(--success)'    },
              { key: 'lost',      w: stats.lost,        color: 'var(--danger)'     },
              { key: 'hold',      w: stats.on_hold,     color: 'var(--text-muted)' },
            ].filter(s => s.w > 0).map(s => (
              <div
                key={s.key}
                title={`${s.key}: ${s.w}`}
                style={{
                  width: `${(s.w / stats.total) * 100}%`,
                  background: s.color,
                  borderRadius: 4,
                  transition: 'width .4s',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'New',         val: stats.new,         color: 'var(--primary)'    },
              { label: 'Contacted',   val: stats.contacted,   color: 'var(--warning)'    },
              { label: 'Interested',  val: stats.interested,  color: '#06b6d4'           },
              { label: 'Negotiation', val: stats.negotiation, color: '#a855f7'           },
              { label: 'Won',         val: stats.won,         color: 'var(--success)'    },
              { label: 'Lost',        val: stats.lost,        color: 'var(--danger)'     },
              { label: 'On Hold',     val: stats.on_hold,     color: 'var(--text-muted)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                <span style={{ fontWeight: 700 }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom grid: Recent Leads + Instructions ─────────── */}
      <div className="grid grid-2">

        {/* Recent Leads */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Leads</div>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => navigate(`/${slug}/emp/my-leads`)}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ padding: '0 0 8px' }}>
            {loading ? (
              <div style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center' }}>Loading…</div>
            ) : recentLeads.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <p>No leads assigned yet.</p>
              </div>
            ) : (
              recentLeads.map((lead, i) => {
                const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                return (
                  <div
                    key={lead._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 20px',
                      borderBottom: i < recentLeads.length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer', transition: 'background .15s',
                    }}
                    onClick={() => navigate(`/${slug}/emp/my-leads`)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: cfg.bg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 14, fontWeight: 700,
                      color: cfg.color, flexShrink: 0,
                    }}>
                      {lead.name?.[0]?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {lead.phone} · {lead.source || 'No source'}
                      </div>
                    </div>

                    {/* Status + time */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                        color: cfg.color, background: cfg.bg,
                      }}>
                        {cfg.label}
                      </span>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                        {new Date(lead.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Instructions from Manager */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Megaphone size={16} color="var(--warning)" />
              <div className="card-title">Manager Instructions</div>
            </div>
            <div className="card-subtitle">{instructions.length} messages</div>
          </div>

          <div style={{ padding: '8px 0' }}>
            {loading ? (
              <div style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center' }}>Loading…</div>
            ) : instructions.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <p>No instructions from your manager yet.</p>
              </div>
            ) : (
              instructions.map((inst, i) => (
                <div
                  key={inst._id}
                  style={{
                    padding: '12px 20px',
                    borderBottom: i < instructions.length - 1 ? '1px solid var(--border)' : 'none',
                    borderLeft: inst.isPinned ? '3px solid var(--warning)' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    {inst.isPinned && (
                      <Pin size={13} color="var(--warning)" style={{ marginTop: 2, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 4 }}>
                        {inst.text}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          {inst.createdBy?.name || 'Manager'}
                        </span>
                        {' · '}
                        {new Date(inst.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
