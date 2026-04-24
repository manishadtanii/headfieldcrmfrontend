import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, Check, ClipboardList, Globe, Megaphone, RefreshCw, Trash2, Trophy, TrendingUp } from 'lucide-react';

const POLL_INTERVAL = 30_000; // 30 seconds

const TYPE_CONFIG = {
  lead_assigned:       { icon: ClipboardList, color: 'var(--primary)',  label: 'Lead Assigned'    },
  lead_from_website:   { icon: Globe,         color: '#06b6d4',         label: 'Website Lead'     },
  new_instruction:     { icon: Megaphone,      color: 'var(--warning)', label: 'Instruction'      },
  lead_status_changed: { icon: ClipboardList, color: 'var(--success)',  label: 'Status Changed'   },
  lead_won:            { icon: Trophy,         color: '#10b981',        label: 'Lead Won'          },
  lead_lost:           { icon: ClipboardList, color: '#ef4444',         label: 'Lead Lost'         },
  lead_update:         { icon: TrendingUp,    color: '#818cf8',         label: 'Lead Update'       },
  lead_deleted:        { icon: Trash2,        color: '#f59e0b',         label: 'Lead Removed'      },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const min  = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function NotificationBell({ apiObj }) {
  // apiObj = { getUnreadCount, getNotifications, markAllRead, markOneRead }
  // passed from layout so it works for both BA and Employee
  const { slug } = useParams();
  const navigate = useNavigate();

  const [open, setOpen]               = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]           = useState(0);
  const [loading, setLoading]         = useState(false);
  const dropdownRef                   = useRef(null);

  // ── Poll unread count ──────────────────────────────────────────
  const fetchCount = useCallback(async () => {
    try {
      const res = await apiObj.getUnreadCount(slug);
      setUnread(res.data.count || 0);
    } catch { /* silent */ }
  }, [slug]);

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchCount]);

  // ── Fetch full list when dropdown opens ────────────────────────
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiObj.getNotifications(slug);
      setNotifications(res.data.data || []);
      setUnread(res.data.unreadCount || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) fetchNotifications();
  };

  // ── Close on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Mark all read ──────────────────────────────────────────────
  const handleMarkAll = async () => {
    try {
      await apiObj.markAllRead(slug);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch { /* silent */ }
  };

  // ── Click one notification ─────────────────────────────────────
  const handleClick = async (n) => {
    if (!n.isRead) {
      try { await apiObj.markOneRead(slug, n._id); } catch { /* silent */ }
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
      setUnread(c => Math.max(0, c - 1));
    }
    setOpen(false);
    // Navigate to lead if applicable
    if (n.relatedLead) {
      navigate(`/${slug}/leads`);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>

      {/* ── Bell Button ── */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          background: open ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 10,
          padding: '7px 11px',
          cursor: 'pointer',
          color: open ? '#818cf8' : '#94a3b8',
          display: 'flex', alignItems: 'center',
          transition: 'all 0.15s',
        }}
        title="Notifications"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -5, right: -5,
            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
            color: 'white',
            borderRadius: '50%', fontSize: 10, fontWeight: 800,
            width: 18, height: 18, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 2px #0f172a',
            letterSpacing: '-0.5px',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: 360,
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'bellSlideDown 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        }}>

          {/* ── Header ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px 13px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(99,102,241,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={14} color="#818cf8" />
              <span style={{ fontWeight: 800, fontSize: 14, color: '#f1f5f9', letterSpacing: '-0.2px' }}>
                Notifications
              </span>
              {unread > 0 && (
                <span style={{
                  background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: 'white', borderRadius: 20,
                  fontSize: 10, fontWeight: 800,
                  padding: '1px 7px', letterSpacing: '0.02em',
                }}>{unread} new</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                onClick={fetchNotifications}
                title="Refresh"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#475569', padding: '4px 6px', borderRadius: 6,
                  display: 'flex', alignItems: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#475569'; }}
              ><RefreshCw size={13} /></button>
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  style={{
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 7, cursor: 'pointer',
                    fontSize: 11, color: '#818cf8', fontWeight: 700,
                    padding: '4px 10px',
                    display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                >
                  <Check size={11} /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* ── List ── */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>⏳</div>
                <div style={{ fontSize: 13, color: '#475569' }}>Loading notifications…</div>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 34, marginBottom: 10 }}>🔔</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#64748b', marginBottom: 4 }}>All caught up!</div>
                <div style={{ fontSize: 12, color: '#334155' }}>No notifications yet</div>
              </div>
            ) : (
              notifications.map((n, idx) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.lead_assigned;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n._id}
                    onClick={() => handleClick(n)}
                    style={{
                      display: 'flex', gap: 12, padding: '13px 16px',
                      cursor: 'pointer',
                      background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.04)',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      borderLeft: `3px solid ${n.isRead ? 'transparent' : cfg.color}`,
                      transition: 'background 0.12s',
                      animation: `bellItemIn 0.2s ease ${idx * 0.03}s both`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(99,102,241,0.04)'}
                  >
                    {/* Icon circle */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: `${cfg.color}18`,
                      border: `1px solid ${cfg.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={15} color={cfg.color} />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: n.isRead ? 500 : 700,
                        color: n.isRead ? '#94a3b8' : '#e2e8f0',
                        marginBottom: 3, lineHeight: 1.3,
                      }}>
                        {n.title}
                      </div>
                      <div style={{
                        fontSize: 12, color: '#64748b',
                        lineHeight: 1.5,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 11, color: '#334155', marginTop: 5, fontWeight: 500 }}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: cfg.color,
                        flexShrink: 0, marginTop: 5,
                        boxShadow: `0 0 6px ${cfg.color}80`,
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Footer ── */}
          {notifications.length > 0 && (
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <span style={{ fontSize: 11, color: '#334155', fontWeight: 500 }}>
                Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <style>{`
            @keyframes bellSlideDown {
              from { opacity: 0; transform: translateY(-8px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes bellItemIn {
              from { opacity: 0; transform: translateX(6px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

