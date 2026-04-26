import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  RiAddLine, RiBellLine, RiNotificationOffLine, RiCalendarEventLine,
  RiListCheck2, RiCheckboxCircleLine, RiTimeLine, RiAlarmLine,
  RiDeleteBinLine, RiEditLine, RiCloseLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import AddReminderModal from '../../components/reminders/AddReminderModal';

// ── date-fns localizer for react-big-calendar ─────────────────────
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-US': enUS },
});

// ── Status config ─────────────────────────────────────────────────
const SC = {
  pending:  { label: 'Pending',  color: '#fbbf24', bg: '#fbbf2415' },
  notified: { label: 'Notified', color: '#818cf8', bg: '#818cf815' },
  snoozed:  { label: 'Snoozed',  color: '#06b6d4', bg: '#06b6d415' },
  done:     { label: 'Done ✓',   color: '#34d399', bg: '#34d39915' },
  missed:   { label: 'Missed',   color: '#ef4444', bg: '#ef444415' },
};

const EVENT_COLORS = {
  pending:  '#fbbf24',
  notified: '#818cf8',
  snoozed:  '#06b6d4',
  done:     '#34d399',
  missed:   '#ef4444',
};

export default function Reminders() {
  const { slug }   = useParams();
  const navigate   = useNavigate();

  const [reminders,    setReminders]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [view,         setView]         = useState('list'); // 'list' | 'calendar'
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [calDate,      setCalDate]      = useState(new Date());
  const [calView,      setCalView]      = useState('month');
  const [confirmDlg,   setConfirmDlg]   = useState({ open: false, id: null, deleting: false });

  const { permission, subscribed, loading: pushLoading, subscribe, unsubscribe } =
    usePushNotifications(slug);

  // ── Fetch reminders ─────────────────────────────────────────────
  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (filterStatus) params.set('status', filterStatus);
      const { data } = await api.get(`/b/${slug}/reminders/my?${params}`);
      setReminders(data.data || []);
    } catch {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  }, [slug, filterStatus]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  // ── Calendar events ─────────────────────────────────────────────
  const calEvents = reminders.map((r) => ({
    id:    r._id,
    title: r.title,
    start: new Date(r.scheduledAt),
    end:   new Date(new Date(r.scheduledAt).getTime() + 30 * 60000),
    resource: r,
  }));

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: EVENT_COLORS[event.resource.status] || '#818cf8',
      border:          'none',
      borderRadius:    6,
      color:           '#0f172a',
      fontWeight:      700,
      fontSize:        12,
      padding:         '2px 6px',
    },
  });

  // ── Actions ─────────────────────────────────────────────────────
  const markDone = async (id) => {
    try {
      await api.patch(`/b/${slug}/reminders/${id}/done`);
      toast.success('Marked as done! ✅');
      fetchReminders();
    } catch {
      toast.error('Failed to mark done');
    }
  };

  const snooze = async (id, minutes = 30) => {
    try {
      await api.patch(`/b/${slug}/reminders/${id}/snooze`, { minutes });
      toast.success(`Snoozed ${minutes} min ⏰`);
      fetchReminders();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Snooze failed');
    }
  };

  const deleteReminder = (id) => {
    // Open custom confirm dialog instead of browser alert
    setConfirmDlg({ open: true, id, deleting: false });
  };

  const confirmDelete = async () => {
    setConfirmDlg((d) => ({ ...d, deleting: true }));
    try {
      await api.delete(`/b/${slug}/reminders/${confirmDlg.id}`);
      toast.success('Reminder deleted');
      setConfirmDlg({ open: false, id: null, deleting: false });
      fetchReminders();
    } catch {
      toast.error('Delete failed');
      setConfirmDlg((d) => ({ ...d, deleting: false }));
    }
  };

  // ── Counts ──────────────────────────────────────────────────────
  const counts = reminders.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const today = reminders.filter((r) => {
    const d = new Date(r.scheduledAt);
    const n = new Date();
    return d.toDateString() === n.toDateString() && ['pending', 'notified', 'snoozed'].includes(r.status);
  });

  const formatTime = (dt) =>
    new Date(dt).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });

  const minsLeft = (dt) => {
    const diff = Math.round((new Date(dt) - new Date()) / 60000);
    if (diff < 0)    return `${Math.abs(diff)}m overdue`;
    if (diff === 0)  return 'Now!';
    if (diff < 60)   return `in ${diff}m`;
    return `in ${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  return (
    <div className="page-content">

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>My Reminders</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {today.length > 0 ? `🔔 ${today.length} reminder(s) due today` : 'Schedule follow-ups and meetings'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Push Notification Toggle */}
          <button
            onClick={subscribed ? unsubscribe : subscribe}
            disabled={pushLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: subscribed ? '#10b98115' : '#818cf815',
              border:     `1px solid ${subscribed ? '#10b981' : '#818cf8'}`,
              color:      subscribed ? '#10b981' : '#818cf8',
            }}
          >
            {subscribed ? <RiBellLine size={15} /> : <RiNotificationOffLine size={15} />}
            {subscribed ? 'Notifications On' : 'Enable Notifications'}
          </button>

          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {[
              { key: 'list',     icon: RiListCheck2,         label: 'List'     },
              { key: 'calendar', icon: RiCalendarEventLine,  label: 'Calendar' },
            ].map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setView(key)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: 13,
                fontWeight: 600, transition: 'all .15s',
                background: view === key ? 'var(--primary)' : 'transparent',
                color:      view === key ? 'white' : 'var(--text-muted)',
              }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Add Reminder */}
          <button onClick={() => { setEditTarget(null); setShowModal(true); }} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 10,
            background: 'linear-gradient(135deg,#818cf8,#6366f1)',
            border: 'none', color: 'white', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', boxShadow: '0 4px 16px #6366f130',
          }}>
            <RiAddLine size={17} /> Add Reminder
          </button>
        </div>
      </div>

      {/* ── Stat Chips ────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        {[
          { key: '', label: 'All', count: reminders.length, color: '#94a3b8' },
          { key: 'pending',  ...SC.pending,  count: counts.pending  || 0 },
          { key: 'notified', ...SC.notified, count: counts.notified || 0 },
          { key: 'snoozed',  ...SC.snoozed,  count: counts.snoozed  || 0 },
          { key: 'done',     ...SC.done,     count: counts.done     || 0 },
          { key: 'missed',   ...SC.missed,   count: counts.missed   || 0 },
        ].map(({ key, label, count, color, bg }) => (
          <button key={key} onClick={() => setFilterStatus(key)} style={{
            padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
            fontSize: 12, fontWeight: 700, transition: 'all .15s',
            background: filterStatus === key ? (bg || 'var(--bg-elevated)') : 'transparent',
            border:     `1px solid ${filterStatus === key ? (color || 'var(--border)') : 'var(--border)'}`,
            color:      filterStatus === key ? (color || 'var(--text)') : 'var(--text-muted)',
          }}>
            {label} {count > 0 && <span style={{ marginLeft: 4, fontWeight: 800 }}>{count}</span>}
          </button>
        ))}
      </div>

      {/* ── LIST VIEW ─────────────────────────────────────────── */}
      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 90, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))
          ) : reminders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📅</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No reminders yet</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                Schedule your first follow-up or meeting
              </div>
              <button onClick={() => setShowModal(true)} style={{
                padding: '10px 24px', borderRadius: 12,
                background: 'linear-gradient(135deg,#818cf8,#6366f1)',
                border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer',
              }}>
                + Add First Reminder
              </button>
            </div>
          ) : [...reminders]
              .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
              .map((r) => {
            const cfg = SC[r.status] || SC.pending;
            const urgent = r.status !== 'done' && r.status !== 'missed' &&
              (new Date(r.scheduledAt) - new Date()) / 60000 <= 16;
            return (
              <div key={r._id} style={{
                background: 'var(--bg-card)',
                border: `1px solid ${urgent ? cfg.color + '50' : 'var(--border)'}`,
                borderLeft: `4px solid ${cfg.color}`,
                borderRadius: 14, padding: '16px 20px',
                display: 'flex', alignItems: 'flex-start', gap: 16,
                transition: 'all .15s',
                boxShadow: urgent ? `0 0 20px ${cfg.color}20` : 'none',
              }}>
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {r.status === 'done'   ? <RiCheckboxCircleLine size={20} color={cfg.color} /> :
                   r.status === 'missed' ? <RiCloseLine size={20} color={cfg.color} /> :
                   <RiAlarmLine size={20} color={cfg.color} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{r.title}</span>
                    <span style={{
                      padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`,
                    }}>{cfg.label}</span>
                    {r.lead?.name && (
                      <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>
                        📋 {r.lead.name}
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                      {r.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                      <RiTimeLine size={12} /> {formatTime(r.scheduledAt)}
                    </span>
                    {!['done', 'missed'].includes(r.status) && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>
                        {minsLeft(r.scheduledAt)}
                      </span>
                    )}
                    {r.snoozeCount > 0 && (
                      <span style={{ fontSize: 11, color: '#06b6d4' }}>
                        ⏰ Snoozed {r.snoozeCount}×
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions — snooze removed */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  {!['done', 'missed'].includes(r.status) && (
                    <>
                      <button onClick={() => markDone(r._id)} style={{
                        padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5,
                        background: '#10b98115', border: '1px solid #10b98140', color: '#10b981',
                      }}>
                        <RiCheckboxCircleLine size={14} /> Done
                      </button>
                      <button onClick={() => { setEditTarget(r); setShowModal(true); }} style={{
                        padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                        fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                      }}>
                        <RiEditLine size={13} /> Edit
                      </button>
                    </>
                  )}
                  {/* Delete available for ALL statuses */}
                  <button onClick={() => deleteReminder(r._id)} style={{
                    padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                    background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444',
                    display: 'flex', alignItems: 'center',
                  }}>
                    <RiDeleteBinLine size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CALENDAR VIEW ─────────────────────────────────────── */}
      {view === 'calendar' && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, overflow: 'hidden', padding: 20,
        }}>
          <style>{`
            .rbc-calendar { background: transparent; color: var(--text); }
            .rbc-header { background: var(--bg-elevated); border-color: var(--border) !important; padding: 10px 0; font-size: 13px; font-weight: 700; }
            .rbc-month-view, .rbc-time-view { border-color: var(--border) !important; }
            .rbc-day-bg { border-color: var(--border) !important; }
            .rbc-off-range-bg { background: rgba(255,255,255,0.02); }
            .rbc-today { background: rgba(129,140,248,0.08) !important; }
            .rbc-toolbar button { color: var(--text); background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 600; }
            .rbc-toolbar button.rbc-active { background: var(--primary); color: white; }
            .rbc-toolbar button:hover { background: var(--primary); color: white; }
            .rbc-show-more { color: #818cf8; font-weight: 700; font-size: 12px; }
            .rbc-date-cell { color: var(--text-muted); font-size: 12px; padding: 4px 8px; }
            .rbc-event:focus { outline: none; }
          `}</style>
          <Calendar
            localizer={localizer}
            events={calEvents}
            date={calDate}
            view={calView}
            onNavigate={setCalDate}
            onView={setCalView}
            style={{ height: 600 }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => {
              setEditTarget(event.resource);
              setShowModal(true);
            }}
            onSelectSlot={(slot) => {
              setEditTarget({ scheduledAt: slot.start });
              setShowModal(true);
            }}
            selectable
            popup
            tooltipAccessor={(event) => `${event.title}\n${formatTime(event.start)}`}
          />
        </div>
      )}

      {/* ── Add/Edit Modal ────────────────────────────────────── */}
      {showModal && (
        <AddReminderModal
          slug={slug}
          reminder={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSaved={() => { setShowModal(false); setEditTarget(null); fetchReminders(); }}
        />
      )}

      {/* ── Premium Delete Confirm Dialog ──────────────────────── */}
      {confirmDlg.open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'dlgFadeIn .15s ease',
        }}
          onClick={(e) => { if (e.target === e.currentTarget && !confirmDlg.deleting) setConfirmDlg({ open: false, id: null, deleting: false }); }}
        >
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 20,
            padding: '32px 28px',
            width: '100%', maxWidth: 380,
            boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(239,68,68,0.1)',
            animation: 'dlgSlideUp .2s ease',
            textAlign: 'center',
          }}>
            {/* Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'radial-gradient(circle, #ef444425 0%, #ef444408 100%)',
              border: '1px solid #ef444430',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <RiDeleteBinLine size={28} color="#ef4444" />
            </div>

            {/* Text */}
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
              Delete Reminder?
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 28 }}>
              This action <strong style={{ color: 'var(--text)' }}>cannot be undone.</strong><br />
              The reminder will be permanently removed.
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setConfirmDlg({ open: false, id: null, deleting: false })}
                disabled={confirmDlg.deleting}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 10,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)', fontWeight: 700, fontSize: 14,
                  cursor: confirmDlg.deleting ? 'not-allowed' : 'pointer',
                  opacity: confirmDlg.deleting ? 0.5 : 1,
                  transition: 'all .15s',
                }}
                onMouseEnter={(e) => { if (!confirmDlg.deleting) e.currentTarget.style.background = 'var(--bg-card)'; }}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={confirmDlg.deleting}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 10,
                  background: confirmDlg.deleting
                    ? 'linear-gradient(135deg,#b91c1c,#991b1b)'
                    : 'linear-gradient(135deg,#ef4444,#dc2626)',
                  border: 'none',
                  color: 'white', fontWeight: 800, fontSize: 14,
                  cursor: confirmDlg.deleting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: confirmDlg.deleting ? 'none' : '0 4px 16px rgba(239,68,68,0.4)',
                  transition: 'all .15s',
                }}
                onMouseEnter={(e) => { if (!confirmDlg.deleting) e.currentTarget.style.boxShadow = '0 6px 24px rgba(239,68,68,0.6)'; }}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(239,68,68,0.4)'}
              >
                {confirmDlg.deleting ? (
                  <><span style={{ animation: 'spin .7s linear infinite', display: 'inline-block' }}>⟳</span> Deleting...</>
                ) : (
                  <><RiDeleteBinLine size={15} /> Delete</>  
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse     { 0%,100%{opacity:0.4} 50%{opacity:0.15} }
        @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes dlgFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes dlgSlideUp{ from{opacity:0;transform:scale(.95)translateY(10px)} to{opacity:1;transform:scale(1)translateY(0)} }
      `}</style>
    </div>
  );
}
