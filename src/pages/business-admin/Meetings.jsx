import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  RiCalendarEventLine, RiVideoLine, RiAddLine, RiExternalLinkLine,
  RiRefreshLine, RiGoogleLine, RiCheckLine, RiCloseLine,
  RiTimeLine, RiUserLine, RiBuildingLine, RiLinkM,
  RiCalendarCheckLine, RiVideoAddLine, RiTeamLine, RiFilterLine,
} from 'react-icons/ri';
import { meetingAPI } from '../../api';
import toast from 'react-hot-toast';
import ScheduleMeetingModal from '../../components/meetings/ScheduleMeetingModal';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
const fmtDuration = (start, end) => {
  const mins = Math.round((new Date(end) - new Date(start)) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};
const isUpcoming = (m) => m.status === 'scheduled' && new Date(m.startTime) > new Date();
const isPast     = (m) => m.status !== 'scheduled' || new Date(m.startTime) <= new Date();

const STATUS_CFG = {
  scheduled:  { label: 'Scheduled',  color: '#818cf8', bg: '#818cf815' },
  completed:  { label: 'Completed',  color: '#10b981', bg: '#10b98115' },
  cancelled:  { label: 'Cancelled',  color: '#ef4444', bg: '#ef444415' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Google Connect Banner
// ─────────────────────────────────────────────────────────────────────────────
function GoogleBanner({ slug, onConnected }) {
  const [loading, setLoading] = useState(false);
  const handleConnect = async () => {
    setLoading(true);
    try {
      const { data } = await meetingAPI.getAuthUrl(slug);
      window.location.href = data.url;
    } catch {
      toast.error('Could not connect to Google. Try again.');
      setLoading(false);
    }
  };
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      border: '1px solid #4f46e580',
      borderRadius: 16, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 20,
      marginBottom: 24, flexWrap: 'wrap',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: '#ffffff15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <RiGoogleLine size={24} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 3 }}>
          Connect Google Calendar
        </div>
        <div style={{ fontSize: 13, color: '#a5b4fc' }}>
          Ek baar connect karo — meetings automatically Calendar mein aur Meet link bane ga
        </div>
      </div>
      <button
        onClick={handleConnect}
        disabled={loading}
        style={{
          background: '#fff', color: '#3730a3',
          border: 'none', borderRadius: 10,
          padding: '10px 22px', fontWeight: 800, fontSize: 14,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          opacity: loading ? 0.7 : 1,
          flexShrink: 0,
        }}
      >
        <RiGoogleLine size={16} />
        {loading ? 'Redirecting...' : 'Connect Google'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Meeting Card
// ─────────────────────────────────────────────────────────────────────────────
function MeetingCard({ meeting, onStatusUpdate }) {
  const cfg      = STATUS_CFG[meeting.status] || STATUS_CFG.scheduled;
  const upcoming = isUpcoming(meeting);
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (status) => {
    setUpdating(true);
    try {
      await onStatusUpdate(meeting._id, status);
    } finally { setUpdating(false); }
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${upcoming ? '#818cf840' : 'var(--border)'}`,
      borderLeft: `4px solid ${cfg.color}`,
      borderRadius: 16, padding: '20px 22px',
      transition: 'transform .15s, box-shadow .15s',
      cursor: 'default',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px #0002'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {meeting.title}
          </div>
          {meeting.description && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {meeting.description}
            </div>
          )}
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 12px', borderRadius: 20,
          background: cfg.bg, color: cfg.color,
          fontSize: 11, fontWeight: 800, flexShrink: 0,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color }} />
          {cfg.label}
        </span>
      </div>

      {/* Info row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
          <RiCalendarEventLine size={14} />
          {fmtDate(meeting.startTime)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
          <RiTimeLine size={14} />
          {fmtTime(meeting.startTime)} · {fmtDuration(meeting.startTime, meeting.endTime)}
        </div>
        {meeting.lead?.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
            <RiUserLine size={14} />
            {meeting.lead.name}
            {meeting.lead.companyName && ` · ${meeting.lead.companyName}`}
          </div>
        )}
        {meeting.createdBy?.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
            <RiTeamLine size={14} />
            {meeting.createdBy.name}
          </div>
        )}
      </div>

      {/* Attendees */}
      {meeting.attendees?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {meeting.attendees.slice(0, 4).map((a, i) => (
            <span key={i} style={{
              padding: '3px 10px', borderRadius: 20,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
            }}>
              {a.name || a.email}
            </span>
          ))}
          {meeting.attendees.length > 4 && (
            <span style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
              +{meeting.attendees.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {meeting.meetLink && (
          <a
            href={meeting.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 10,
              background: 'linear-gradient(135deg,#1a73e8,#0d47a1)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              textDecoration: 'none', border: 'none',
            }}
          >
            <RiVideoLine size={15} /> Join Meeting
          </a>
        )}
        {meeting.calendarLink && (
          <a
            href={meeting.calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 10,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text)', fontSize: 13, fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <RiExternalLinkLine size={14} /> Calendar
          </a>
        )}
        {!meeting.meetLink && !meeting.googleSynced && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No Meet link (Google not connected)
          </span>
        )}

        {/* Status actions — only for scheduled */}
        {meeting.status === 'scheduled' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button
              onClick={() => handleStatus('completed')}
              disabled={updating}
              title="Mark completed"
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#10b98115', border: '1px solid #10b98140',
                color: '#10b981', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            ><RiCheckLine size={16} /></button>
            <button
              onClick={() => handleStatus('cancelled')}
              disabled={updating}
              title="Cancel meeting"
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#ef444415', border: '1px solid #ef444440',
                color: '#ef4444', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            ><RiCloseLine size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function BAMeetings() {
  const { slug }            = useParams();
  const [searchParams]      = useSearchParams();

  const [meetings,  setMeetings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [connected, setConnected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tab,       setTab]       = useState('upcoming'); // 'upcoming' | 'past'
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const LIMIT = 20;

  // Handle Google OAuth redirect back
  useEffect(() => {
    if (searchParams.get('google') === 'connected') {
      toast.success('Google Calendar connected! 🎉');
      setConnected(true);
    }
  }, [searchParams]);

  // Check Google connection status
  useEffect(() => {
    meetingAPI.getStatus(slug)
      .then((r) => setConnected(!!r.data.connected))
      .catch(() => {});
  }, [slug]);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await meetingAPI.getAll(slug, { page, limit: LIMIT });
      setMeetings(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch { toast.error('Could not load meetings'); }
    finally  { setLoading(false); }
  }, [slug, page]);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const upcoming = useMemo(() => meetings.filter(isUpcoming), [meetings]);
  const past     = useMemo(() => meetings.filter(isPast),     [meetings]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await meetingAPI.updateStatus(slug, id, status);
      toast.success(`Meeting marked as ${status}`);
      fetchMeetings();
    } catch { toast.error('Could not update meeting'); }
  };

  const handleCreated = () => {
    setShowModal(false);
    fetchMeetings();
    toast.success('Meeting scheduled! 🎉');
  };

  const displayed = tab === 'upcoming' ? upcoming : past;

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100 }}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#818cf820', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RiCalendarEventLine size={24} color="#818cf8" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Meetings</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Schedule and manage Google Meet meetings
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchMeetings}
            style={{ padding: '9px 16px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
          >
            <RiRefreshLine size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            style={{ padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#818cf8,#6366f1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800 }}
          >
            <RiVideoAddLine size={17} /> Schedule Meeting
          </button>
        </div>
      </div>

      {/* ── Google Connect Banner ─────────────────────────────────── */}
      {!connected && <GoogleBanner slug={slug} onConnected={() => setConnected(true)} />}

      {/* ── Connected badge ───────────────────────────────────────── */}
      {connected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 20,
            background: '#10b98115', border: '1px solid #10b98140',
            color: '#10b981', fontSize: 13, fontWeight: 700,
          }}>
            <RiCheckLine size={14} /> Google Calendar Connected
          </div>
          <button
            onClick={async () => {
              try {
                await meetingAPI.disconnect(slug);
                setConnected(false);
                toast.success('Google Calendar disconnected');
              } catch { toast.error('Could not disconnect'); }
            }}
            style={{
              padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
              background: '#ef444415', border: '1px solid #ef444440',
              color: '#ef4444', fontSize: 12, fontWeight: 700,
            }}
          >
            Disconnect
          </button>
        </div>
      )}

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total',    val: total,          color: '#818cf8', icon: RiCalendarEventLine },
          { label: 'Upcoming', val: upcoming.length, color: '#6366f1', icon: RiTimeLine },
          { label: 'Past',     val: past.length,     color: '#10b981', icon: RiCalendarCheckLine },
        ].map(({ label, val, color, icon: Icon }) => (
          <div key={label} style={{ ...card, padding: '16px 18px', borderLeft: `3px solid ${color}` }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon size={17} color={color} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-elevated)', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
        {[['upcoming', 'Upcoming'], ['past', 'Past']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '7px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: tab === key ? '#818cf8' : 'transparent',
            color: tab === key ? '#fff' : 'var(--text-muted)',
            fontWeight: 700, fontSize: 13, transition: 'all .15s',
          }}>{label}</button>
        ))}
      </div>

      {/* ── Meetings List ─────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <RiRefreshLine size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <div>Loading meetings...</div>
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ ...card, padding: '60px', textAlign: 'center' }}>
          <RiCalendarEventLine size={48} color="var(--border)" style={{ marginBottom: 16 }} />
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
            No {tab === 'upcoming' ? 'upcoming' : 'past'} meetings
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            {tab === 'upcoming' ? 'Schedule a meeting to get started' : 'Past meetings will appear here'}
          </div>
          {tab === 'upcoming' && (
            <button onClick={() => setShowModal(true)} style={{
              padding: '10px 22px', borderRadius: 10,
              background: 'linear-gradient(135deg,#818cf8,#6366f1)',
              border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <RiVideoAddLine size={16} /> Schedule Meeting
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {displayed.map((m) => (
            <MeetingCard key={m._id} meeting={m} onStatusUpdate={handleStatusUpdate} />
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────── */}
      {Math.ceil(total / LIMIT) > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {Array.from({ length: Math.ceil(total / LIMIT) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{
              width: 34, height: 34, borderRadius: 8,
              border: '1px solid var(--border)',
              background: page === p ? '#818cf8' : 'var(--bg-elevated)',
              color: page === p ? '#fff' : 'var(--text)',
              cursor: 'pointer', fontWeight: 700, fontSize: 13,
            }}>{p}</button>
          ))}
        </div>
      )}

      {/* ── Schedule Modal ─────────────────────────────────────────── */}
      {showModal && (
        <ScheduleMeetingModal
          slug={slug}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
