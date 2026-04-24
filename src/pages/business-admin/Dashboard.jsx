import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users, UserCheck, Wifi, UserX, ClipboardList, UserRound,
  UserMinus, Trophy, TrendingUp, Megaphone, Pin, Trash2,
  Send, RefreshCw, ArrowRight, X, Monitor, Smartphone,
  BarChart2, ChevronRight, Hash, AlertCircle, Star, Zap,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { baAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ── Color palette for charts/sources ──────────────────────────────
const COLORS = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#60a5fa', '#a78bfa'];
const STATUS_CONFIG = {
  new:          { label: 'New',          color: '#818cf8' },
  contacted:    { label: 'Contacted',    color: '#60a5fa' },
  interested:   { label: 'Interested',   color: '#34d399' },
  negotiation:  { label: 'Negotiation',  color: '#fbbf24' },
  closed_won:   { label: 'Won',          color: '#10b981' },
  closed_lost:  { label: 'Lost',         color: '#ef4444' },
  on_hold:      { label: 'On Hold',      color: '#9ca3af' },
};

// ── Helpers ───────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return '—';
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── Bar Chart (pure CSS)  ─────────────────────────────────────────
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  const [tooltip, setTooltip] = useState(null);

  return (
    <div style={{ padding: '8px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
        {data.map((d, i) => {
          const pct = Math.round((d.count / max) * 100);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}
              onMouseEnter={() => setTooltip(i)}
              onMouseLeave={() => setTooltip(null)}
            >
              {tooltip === i && (
                <div style={{ position: 'absolute', top: -32, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10 }}>
                  {d.count} leads
                </div>
              )}
              <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  width: '100%',
                  height: `${Math.max(pct, 4)}%`,
                  background: `linear-gradient(180deg, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}99)`,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s ease',
                  cursor: 'default',
                  boxShadow: tooltip === i ? `0 0 0 2px ${COLORS[i % COLORS.length]}40` : 'none',
                }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
                {d.label.split(' ')[0]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Lead Source Pills ─────────────────────────────────────────────
const SourceBar = ({ sources }) => {
  const total = sources.reduce((s, x) => s + x.count, 0) || 1;
  return (
    <div>
      <div style={{ display: 'flex', gap: 3, height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
        {sources.map((s, i) => (
          <div key={i} style={{ flex: s.count, background: COLORS[i % COLORS.length], transition: 'flex 0.4s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {sources.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
            <span style={{ color: 'var(--text-muted)' }}>{s._id || 'Other'}</span>
            <span style={{ fontWeight: 700 }}>{Math.round((s.count / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Clickable Stat Card ───────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, grad, sub, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'linear-gradient(145deg, #1e2a3a, #151f2e)',
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 14, padding: '16px 18px', position: 'relative',
      overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
    }}
    onMouseEnter={e => { if (onClick) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 8px 28px ${color}25`;
      e.currentTarget.style.borderColor = `${color}40`;
    }}}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
    }}
  >
    {/* Top color bar */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: grad }} />
    {/* Subtle glow bg */}
    <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
      {onClick && <ChevronRight size={14} color="#475569" style={{ marginTop: 4 }} />}
    </div>
    <div style={{ marginTop: 14, position: 'relative' }}>
      <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, color: '#f1f5f9', letterSpacing: '-1px' }}>{value ?? '—'}</div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 5, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 700 }}>{sub}</div>}
    </div>
  </div>
);


// ── Stat Detail Modal ─────────────────────────────────────────────
const StatModal = ({ onClose, filter, slug, title }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('leads');

  useEffect(() => {
    baAPI.getDashboardLeads(slug, filter)
      .then(r => { setItems(r.data.data); setType(r.data.type); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [filter, slug]);

  const sc = STATUS_CONFIG;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(7,11,20,0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 20, width: '100%', maxWidth: 560,
        maxHeight: '82vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        animation: 'cfCardIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(99,102,241,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9', letterSpacing: '-0.3px' }}>{title}</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>
              {loading ? 'Loading…' : `${items.length} record${items.length !== 1 ? 's' : ''} found`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#64748b', padding: 8, borderRadius: 8, display: 'flex', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f1f5f9'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
              <div style={{ fontSize: 13, color: '#475569' }}>Loading records…</div>
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <AlertCircle size={36} style={{ opacity: 0.25, marginBottom: 14, color: '#64748b' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 4 }}>No records found</div>
              <div style={{ fontSize: 12, color: '#1e293b' }}>Nothing to display here</div>
            </div>
          ) : type === 'employees' ? (
            items.map((s, i) => (
              <div
                key={i}
                style={{ padding: '12px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 13, transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.035)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#34d399,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: 'white', flexShrink: 0, boxShadow: '0 0 0 2px rgba(52,211,153,0.2)' }}>
                  {s.userName?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{s.userName}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.userEmail}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#34d399', fontWeight: 700, fontSize: 11 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 6px #34d39980' }} />
                    Online
                  </div>
                  <div style={{ fontSize: 11, color: '#334155', marginTop: 3 }}>{s.browser} · {s.device}</div>
                </div>
              </div>
            ))
          ) : (
            items.map((l, i) => {
              const color = sc[l.status]?.color || '#818cf8';
              return (
                <div
                  key={i}
                  style={{ padding: '12px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 13, transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.035)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Avatar */}
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color, flexShrink: 0 }}>
                    {l.name?.[0]?.toUpperCase()}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                      {l.phone || '—'}
                      {l.assignedTo
                        ? <span style={{ marginLeft: 6, color: '#34d399', fontWeight: 600 }}>· {l.assignedTo.name}</span>
                        : <span style={{ marginLeft: 6, color: '#f59e0b', fontWeight: 600 }}>· Unassigned</span>
                      }
                    </div>
                  </div>
                  {/* Status + time */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: `${color}18`, color, border: `1px solid ${color}30`, letterSpacing: '0.02em' }}>
                      {sc[l.status]?.label || l.status}
                    </span>
                    <div style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>{timeAgo(l.createdAt)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        {!loading && items.length > 0 && (
          <div style={{ padding: '10px 22px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: '#1e293b', fontWeight: 500 }}>
              Showing all {items.length} record{items.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};


// ── Broadcast Compose ─────────────────────────────────────────────
const QUICK_TAGS = ['🔥 Urgent', '📌 Reminder', '💡 Tip', '✅ Update', '⚠️ Alert'];

const BroadcastPanel = ({ slug, onSent }) => {
  const [text, setText] = useState('');
  const [pinNew, setPinNew] = useState(false);
  const [posting, setPosting] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const maxChars = 500;

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    const finalText = selectedTag ? `${selectedTag}\n${text.trim()}` : text.trim();
    try {
      await baAPI.createInstruction(slug, finalText, pinNew);
      setText(''); setSelectedTag(''); setPinNew(false);
      toast.success('📣 Broadcast sent to team!');
      onSent();
    } catch {
      toast.error('Failed to send');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
      {/* Quick tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {QUICK_TAGS.map(tag => (
          <button key={tag} onClick={() => setSelectedTag(t => t === tag ? '' : tag)}
            style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', background: selectedTag === tag ? 'var(--primary)' : 'var(--bg-elevated)', color: selectedTag === tag ? 'white' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}
          >{tag}</button>
        ))}
      </div>

      {/* Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          placeholder="Write a message for your team… e.g. Focus on IndiaMart leads this week"
          value={text}
          onChange={e => setText(e.target.value.slice(0, maxChars))}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePost(); }}
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box', resize: 'none',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13,
            color: 'var(--text)', outline: 'none', lineHeight: 1.6,
            fontFamily: 'inherit',
          }}
        />
        <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 10, color: text.length > maxChars * 0.8 ? 'var(--warning)' : 'var(--text-muted)' }}>
          {text.length}/{maxChars}
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', color: pinNew ? 'var(--warning)' : 'var(--text-muted)' }}>
          <input type="checkbox" checked={pinNew} onChange={e => setPinNew(e.target.checked)} style={{ accentColor: 'var(--warning)' }} />
          <Pin size={12} /> Pin to top
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ctrl+Enter</span>
          <button onClick={handlePost} disabled={posting || !text.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 10, border: 'none', cursor: posting || !text.trim() ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, background: text.trim() ? 'linear-gradient(135deg,var(--primary),#6366f1)' : 'var(--border)', color: text.trim() ? 'white' : 'var(--text-muted)', transition: 'all 0.15s', opacity: posting ? 0.7 : 1 }}
          >
            <Send size={13} /> {posting ? 'Sending…' : 'Send to Team'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────
export default function BADashboard() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [data, setData]           = useState(null);
  const [trend, setTrend]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [instructions, setInstructions] = useState([]);
  const [modal, setModal]         = useState(null); // { filter, title }

  const fetchOverview = useCallback(() => {
    setLoading(true);
    Promise.all([
      baAPI.getOverview(slug),
      baAPI.getLeadTrend(slug),
    ])
      .then(([ov, tr]) => { setData(ov.data.data); setTrend(tr.data.data); })
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const fetchInstructions = useCallback(() => {
    baAPI.getInstructions(slug).then(r => setInstructions(r.data.data || [])).catch(() => {});
  }, [slug]);

  useEffect(() => { fetchOverview(); fetchInstructions(); }, [fetchOverview, fetchInstructions]);

  const handleDelete = async (id) => {
    try {
      await baAPI.deleteInstruction(slug, id);
      setInstructions(prev => prev.filter(i => i._id !== id));
      toast.success('Removed');
    } catch { toast.error('Failed to remove'); }
  };

  const handlePin = async (id) => {
    try { await baAPI.togglePinInstruction(slug, id); fetchInstructions(); }
    catch { toast.error('Failed to pin'); }
  };

  const stats  = data?.stats;
  const logins = data?.recentLogins || [];

  // Skeleton
  const Skel = ({ h = 90 }) => (
    <div style={{ height: h, background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
  );

  return (
    <div className="page-content">

      {/* ── Hero Header Banner ──────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #1a2236 40%, #0f172a 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 18,
        padding: '24px 28px',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -40, right: 60, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 100, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, position: 'relative' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: '#f1f5f9' }}>
              {data?.business?.name || 'Dashboard'}
            </h1>
            <p style={{ color: '#64748b', marginTop: 5, fontSize: 13 }}>
              Welcome back, <strong style={{ color: '#94a3b8' }}>{user?.name}</strong>
              <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { fetchOverview(); fetchInstructions(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button
              onClick={() => navigate(`/${slug}/leads`)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: '1px solid rgba(99,102,241,0.4)', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: 'white', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
            >
              <ArrowRight size={13} /> Manage Leads
            </button>
          </div>
        </div>
      </div>

      {/* ── Team Stats Section ───────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '18px 20px 20px',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg,#818cf8,#a78bfa)' }} />
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase' }}>Team Overview</div>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[...Array(4)].map((_, i) => <Skel key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            <StatCard icon={Users}     label="Total Employees"  value={stats?.totalEmployees}    color="#818cf8" grad="linear-gradient(90deg,#818cf8,#a78bfa)" />
            <StatCard icon={UserCheck} label="Active Employees" value={stats?.activeEmployees}   color="#34d399" grad="linear-gradient(90deg,#34d399,#6ee7b7)" />
            <StatCard icon={Wifi}      label="Online Now"       value={stats?.onlineNow}         color="#06b6d4" grad="linear-gradient(90deg,#06b6d4,#67e8f9)"
              onClick={() => setModal({ filter: 'online', title: '🟢 Online Employees' })} />
            <StatCard icon={UserX}     label="Inactive"         value={stats?.inactiveEmployees} color="#ef4444" grad="linear-gradient(90deg,#ef4444,#f87171)" />
          </div>
        )}
      </div>

      {/* ── Lead Pipeline Section ────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '18px 20px 20px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg,#a855f7,#c084fc)' }} />
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase' }}>Lead Pipeline</div>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[...Array(4)].map((_, i) => <Skel key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            <StatCard icon={ClipboardList} label="Total Leads"    value={stats?.totalLeads}      color="#818cf8" grad="linear-gradient(90deg,#818cf8,#a78bfa)"
              onClick={() => setModal({ filter: 'total', title: '📋 All Leads' })} />
            <StatCard icon={UserRound}     label="Assigned"       value={stats?.assignedLeads}   color="#34d399" grad="linear-gradient(90deg,#34d399,#6ee7b7)"
              sub={stats?.totalLeads > 0 ? `${Math.round((stats.assignedLeads / stats.totalLeads) * 100)}% assigned` : null}
              onClick={() => setModal({ filter: 'assigned', title: '👤 Assigned Leads' })} />
            <StatCard icon={UserMinus}     label="Unassigned"     value={stats?.unassignedLeads} color="#fbbf24" grad="linear-gradient(90deg,#fbbf24,#f59e0b)"
              onClick={() => setModal({ filter: 'unassigned', title: '⚠️ Unassigned Leads' })} />
            <StatCard icon={Trophy}        label="Won This Month" value={stats?.wonThisMonth}    color="#a855f7" grad="linear-gradient(90deg,#a855f7,#c084fc)"
              sub={stats?.wonLeads > 0 ? `${stats.wonLeads} total won` : null}
              onClick={() => setModal({ filter: 'won', title: '🏆 Won Leads' })} />
          </div>
        )}
      </div>

      {/* ── Charts Row ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Bar Chart — 7-day trend */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <BarChart2 size={15} color="var(--primary)" /> 7-Day Lead Trend
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {trend ? `${trend.trend.reduce((s, d) => s + d.count, 0)} leads this week` : '—'}
              </div>
            </div>
            <button style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => navigate(`/${slug}/leads`)}>
              View All <ArrowRight size={11} style={{ display: 'inline' }} />
            </button>
          </div>
          <div style={{ padding: '12px 16px' }}>
            {loading || !trend ? (
              <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading chart…</div>
            ) : (
              <BarChart data={trend.trend} />
            )}
          </div>
        </div>

        {/* Source breakdown */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
              <TrendingUp size={15} color="#34d399" /> Lead Sources
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Distribution by source
            </div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {loading || !trend ? (
              <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
            ) : trend.sources.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No lead data yet</div>
            ) : (
              <SourceBar sources={trend.sources} />
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom: Broadcast + Logins ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Broadcast */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fbbf2418', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Megaphone size={15} color="#fbbf24" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Broadcast to Team</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{instructions.length} messages</div>
              </div>
            </div>
          </div>

          <BroadcastPanel slug={slug} onSent={fetchInstructions} />

          {/* Feed */}
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {instructions.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No messages yet.
              </div>
            ) : instructions.map((inst, i) => (
              <div key={inst._id} style={{ padding: '11px 20px', borderBottom: i < instructions.length - 1 ? '1px solid var(--border)' : 'none', borderLeft: inst.isPinned ? '3px solid #fbbf24' : '3px solid transparent', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {inst.isPinned && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', background: '#fbbf2418', padding: '1px 7px', borderRadius: 10, marginRight: 6, border: '1px solid #fbbf2430' }}>📌 Pinned</span>
                  )}
                  <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: inst.isPinned ? 4 : 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{inst.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {timeAgo(inst.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <button onClick={() => handlePin(inst._id)} title={inst.isPinned ? 'Unpin' : 'Pin'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, color: inst.isPinned ? '#fbbf24' : 'var(--text-muted)', borderRadius: 6 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  ><Pin size={13} /></button>
                  <button onClick={() => handleDelete(inst._id)} title="Delete"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, color: 'var(--text-muted)', borderRadius: 6 }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                  ><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logins */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#818cf818', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wifi size={15} color="#818cf8" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Employee Logins</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{logins.filter(l => l.isOnline).length} online now</div>
              </div>
            </div>
          </div>
          <div style={{ maxHeight: 460, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
            ) : logins.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No sessions yet.</div>
            ) : logins.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: i < logins.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.isOnline ? 'linear-gradient(135deg,#34d399,#6ee7b7)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: s.isOnline ? 'white' : 'var(--text-muted)' }}>
                    {s.userName?.[0]?.toUpperCase()}
                  </div>
                  {s.isOnline && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#34d399', border: '2px solid var(--bg-card)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.userName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {s.device === 'Mobile' ? <Smartphone size={10} style={{ display: 'inline', marginRight: 3 }} /> : <Monitor size={10} style={{ display: 'inline', marginRight: 3 }} />}
                    {s.browser} · {s.device}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {s.isOnline ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#34d39918', color: '#34d399', border: '1px solid #34d39930' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', animation: 'pulse-dot 1.5s ease-in-out infinite', display: 'inline-block' }} /> Live
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Offline</span>
                  )}
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{timeAgo(s.loginAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat Detail Modal ─────────────────────── */}
      {modal && <StatModal slug={slug} filter={modal.filter} title={modal.title} onClose={() => setModal(null)} />}

      <style>{`
        @keyframes pulse     { 0%,100%{opacity:0.4} 50%{opacity:0.15} }
        @keyframes pulse-dot { 0%,100%{opacity:1}   50%{opacity:0.3}  }
      `}</style>
    </div>
  );
}
