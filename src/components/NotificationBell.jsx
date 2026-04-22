import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, Check, ClipboardList, Globe, Megaphone, RefreshCw } from 'lucide-react';

const POLL_INTERVAL = 30_000; // 30 seconds

const TYPE_CONFIG = {
  lead_assigned:       { icon: ClipboardList, color: 'var(--primary)',  label: 'Lead Assigned'  },
  lead_from_website:   { icon: Globe,         color: '#06b6d4',         label: 'Website Lead'   },
  new_instruction:     { icon: Megaphone,      color: 'var(--warning)', label: 'Instruction'    },
  lead_status_changed: { icon: ClipboardList, color: 'var(--success)',  label: 'Status Changed' },
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
          background: open ? 'var(--bg-elevated)' : 'none',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '6px 10px',
          cursor: 'pointer',
          color: 'var(--text)',
          display: 'flex', alignItems: 'center',
          transition: 'background 0.15s',
        }}
        title="Notifications"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            background: 'var(--danger)', color: 'white',
            borderRadius: '50%', fontSize: 10, fontWeight: 700,
            width: 18, height: 18, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 2px var(--bg-card)',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 340, background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 9999,
          animation: 'fadeSlideDown 0.15s ease',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              Notifications {unread > 0 && (
                <span style={{
                  marginLeft: 6, background: 'var(--danger)', color: 'white',
                  borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 6px',
                }}>{unread}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={fetchNotifications}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
              ><RefreshCw size={13} /></button>
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 11, color: 'var(--primary)', fontWeight: 600, padding: '2px 6px',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No notifications yet</div>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.lead_assigned;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n._id}
                    onClick={() => handleClick(n)}
                    style={{
                      display: 'flex', gap: 12, padding: '12px 16px',
                      cursor: 'pointer', transition: 'background 0.1s',
                      background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                      borderBottom: '1px solid var(--border)',
                      borderLeft: n.isRead ? '3px solid transparent' : `3px solid ${cfg.color}`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)'}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: `${cfg.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={15} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, marginBottom: 2 }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    {!n.isRead && (
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: cfg.color, flexShrink: 0, marginTop: 4,
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          <style>{`
            @keyframes fadeSlideDown {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
