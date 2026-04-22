import { useState, useEffect, useRef } from 'react';
import {
  Users, UserCheck, Wifi, UserX,
  ClipboardList, UserRound, UserMinus, Trophy, TrendingUp,
  Megaphone, Pin, Trash2, Send, RefreshCw, ArrowRight,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { baAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ── Stat Card ─────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
    <div className="stat-icon" style={{ background: `${color}20` }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sub && (
        <div style={{ fontSize: 11, color, marginTop: 2, fontWeight: 600 }}>{sub}</div>
      )}
    </div>
    {/* Decorative circle */}
    <div style={{
      position: 'absolute', right: -16, bottom: -16,
      width: 72, height: 72, borderRadius: '50%',
      background: `${color}10`, pointerEvents: 'none',
    }} />
  </div>
);

// ── Section Label ─────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
    color: 'var(--text-muted)', textTransform: 'uppercase',
    marginBottom: 12, marginTop: 4,
  }}>
    {children}
  </div>
);

export default function BADashboard() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [data, setData]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [instructions, setInstructions] = useState([]);
  const [instText, setInstText]         = useState('');
  const [pinNew, setPinNew]             = useState(false);
  const [posting, setPosting]           = useState(false);
  const textareaRef                     = useRef(null);

  // ── Fetch data ───────────────────────────────────────────────
  const fetchOverview = () => {
    setLoading(true);
    baAPI.getOverview(slug)
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load overview.'))
      .finally(() => setLoading(false));
  };

  const fetchInstructions = () => {
    baAPI.getInstructions(slug)
      .then(r => setInstructions(r.data.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchOverview();
    fetchInstructions();
  }, [slug]);

  // ── Instructions CRUD ────────────────────────────────────────
  const handlePost = async () => {
    if (!instText.trim()) return;
    setPosting(true);
    try {
      await baAPI.createInstruction(slug, instText.trim(), pinNew);
      setInstText('');
      setPinNew(false);
      toast.success('Instruction sent to team!');
      fetchInstructions();
    } catch {
      toast.error('Failed to send instruction');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await baAPI.deleteInstruction(slug, id);
      setInstructions(prev => prev.filter(i => i._id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handlePin = async (id) => {
    try {
      await baAPI.togglePinInstruction(slug, id);
      fetchInstructions();
    } catch {
      toast.error('Failed to pin');
    }
  };

  const stats  = data?.stats;
  const logins = data?.recentLogins || [];

  // ── Skeleton for stat cards ──────────────────────────────────
  const SkeletonCards = ({ count }) => (
    <div className={`grid grid-${count} mb-4`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="stat-card" style={{ minHeight: 90 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--border)', opacity: 0.4 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 24, width: '60%', borderRadius: 6, background: 'var(--border)', opacity: 0.4, marginBottom: 6 }} />
            <div style={{ height: 14, width: '80%', borderRadius: 4, background: 'var(--border)', opacity: 0.2 }} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="page-content">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>
            {data?.business?.name || 'Dashboard'}
          </h1>
          <p className="text-muted" style={{ marginTop: 4 }}>
            Welcome back, {user?.name}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => { fetchOverview(); fetchInstructions(); }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/${slug}/leads`)}>
            <ArrowRight size={14} /> Manage Leads
          </button>
        </div>
      </div>

      {/* ── Row 1: Employee Stats ─────────────────────────────────── */}
      <SectionLabel>Team Overview</SectionLabel>
      {loading ? <SkeletonCards count={4} /> : (
        <div className="grid grid-4 mb-6">
          <StatCard icon={Users}     label="Total Employees"  value={stats?.totalEmployees}    color="var(--primary)" />
          <StatCard icon={UserCheck} label="Active Employees" value={stats?.activeEmployees}   color="var(--success)" />
          <StatCard icon={Wifi}      label="Online Now"       value={stats?.onlineNow}         color="#06b6d4" />
          <StatCard icon={UserX}     label="Inactive"         value={stats?.inactiveEmployees} color="var(--danger)" />
        </div>
      )}

      {/* ── Row 2: Lead Stats ─────────────────────────────────────── */}
      <SectionLabel>Lead Pipeline</SectionLabel>
      {loading ? <SkeletonCards count={4} /> : (
        <div className="grid grid-4 mb-6">
          <StatCard
            icon={ClipboardList}
            label="Total Leads"
            value={stats?.totalLeads}
            color="var(--primary)"
          />
          <StatCard
            icon={UserRound}
            label="Assigned"
            value={stats?.assignedLeads}
            color="var(--success)"
            sub={stats?.totalLeads > 0
              ? `${Math.round((stats.assignedLeads / stats.totalLeads) * 100)}% assigned`
              : null}
          />
          <StatCard
            icon={UserMinus}
            label="Unassigned"
            value={stats?.unassignedLeads}
            color="var(--warning)"
          />
          <StatCard
            icon={Trophy}
            label="Won This Month"
            value={stats?.wonThisMonth}
            color="#a855f7"
            sub={stats?.wonLeads > 0 ? `${stats.wonLeads} total won` : null}
          />
        </div>
      )}

      {/* ── Bottom Grid: Instructions + Logins ───────────────────── */}
      <div className="grid grid-2">

        {/* ── Broadcast Instructions ──────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Megaphone size={16} color="var(--warning)" />
              <div className="card-title">Broadcast to Team</div>
            </div>
            <div className="card-subtitle">{instructions.length} sent</div>
          </div>

          {/* Compose box */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <textarea
              ref={textareaRef}
              className="form-input"
              placeholder="Write a message for your team… e.g. Focus on IndiaMart leads this week"
              value={instText}
              onChange={e => setInstText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePost(); }}
              rows={3}
              style={{ resize: 'none', fontSize: 13, width: '100%', boxSizing: 'border-box', marginBottom: 10 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={pinNew}
                  onChange={e => setPinNew(e.target.checked)}
                  style={{ accentColor: 'var(--warning)' }}
                />
                <Pin size={12} color="var(--warning)" />
                Pin this message
              </label>
              <button
                className="btn btn-primary"
                onClick={handlePost}
                disabled={posting || !instText.trim()}
                style={{ gap: 6 }}
              >
                <Send size={13} />
                {posting ? 'Sending…' : 'Send to Team'}
              </button>
            </div>
          </div>

          {/* Instructions list */}
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {instructions.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px 0' }}>
                <p>No instructions sent yet.</p>
              </div>
            ) : (
              instructions.map((inst, i) => (
                <div
                  key={inst._id}
                  style={{
                    padding: '11px 20px',
                    borderBottom: i < instructions.length - 1 ? '1px solid var(--border)' : 'none',
                    borderLeft: inst.isPinned ? '3px solid var(--warning)' : '3px solid transparent',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 4 }}>
                      {inst.isPinned && <Pin size={11} color="var(--warning)" style={{ marginRight: 5, verticalAlign: 'middle' }} />}
                      {inst.text}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(inst.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => handlePin(inst._id)}
                      title={inst.isPinned ? 'Unpin' : 'Pin'}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                        color: inst.isPinned ? 'var(--warning)' : 'var(--text-muted)',
                      }}
                    >
                      <Pin size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(inst._id)}
                      title="Remove"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Recent Employee Logins ────────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Employee Logins</div>
            <div className="card-subtitle">{logins.length} sessions</div>
          </div>
          <div style={{ maxHeight: 430, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
            ) : logins.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <p>No employee sessions yet.</p>
              </div>
            ) : (
              logins.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 20px',
                  borderBottom: i < logins.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: s.isOnline ? 'rgba(16,185,129,0.12)' : 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13,
                    color: s.isOnline ? 'var(--success)' : 'var(--text-muted)',
                    flexShrink: 0, border: s.isOnline ? '1px solid var(--success)' : '1px solid var(--border)',
                  }}>
                    {s.userName?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.userName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {s.browser} · {s.device}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {s.isOnline ? (
                      <span className="badge badge-success" style={{ fontSize: 11 }}>
                        <span className="online-dot" />Online
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Offline</span>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(s.loginAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
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
