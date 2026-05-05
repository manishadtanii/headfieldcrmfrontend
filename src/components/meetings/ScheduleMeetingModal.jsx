import { useState, useEffect } from 'react';
import {
  RiCloseLine, RiCalendarEventLine, RiVideoLine,
  RiAddLine, RiDeleteBinLine, RiUserLine, RiTimeLine,
} from 'react-icons/ri';
import { meetingAPI, baAPI } from '../../api';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Shared ScheduleMeetingModal — used by both BA and Employee
// ─────────────────────────────────────────────────────────────────────────────

const DURATIONS = [
  { label: '30 min',  mins: 30  },
  { label: '1 hour',  mins: 60  },
  { label: '1.5 hrs', mins: 90  },
  { label: '2 hours', mins: 120 },
  { label: '3 hours', mins: 180 },
];

// Returns local datetime string in format YYYY-MM-DDTHH:mm (for datetime-local inputs)
const toLocalDateTimeInput = (date) => {
  const d = new Date(date);
  d.setSeconds(0, 0);
  // Use LOCAL time (not UTC) — datetime-local input expects local time
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const addMinutes = (dateStr, mins) => {
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() + mins);
  return toLocalDateTimeInput(d);
};

const defaultStart = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30, 0, 0);
  return toLocalDateTimeInput(d);
};

export default function ScheduleMeetingModal({ slug, onClose, onCreated }) {
  const [form, setForm] = useState({
    title:       '',
    description: '',
    startTime:   defaultStart(),
    duration:    60,
    leadId:      '',
    attendees:   [{ name: '', email: '' }],
  });
  const [submitting, setSubmitting] = useState(false);
  const [leads, setLeads] = useState([]);

  // Load leads for dropdown
  useEffect(() => {
    baAPI.getLeads(slug, { limit: 100 })
      .then((r) => setLeads(r.data.data || []))
      .catch(() => {});
  }, [slug]);

  const endTime = addMinutes(form.startTime, form.duration);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addAttendee    = () => setForm((f) => ({ ...f, attendees: [...f.attendees, { name: '', email: '' }] }));
  const removeAttendee = (i) => setForm((f) => ({ ...f, attendees: f.attendees.filter((_, idx) => idx !== i) }));
  const setAttendee    = (i, key, val) => setForm((f) => {
    const att = [...f.attendees];
    att[i] = { ...att[i], [key]: val };
    return { ...f, attendees: att };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.startTime)    return toast.error('Start time is required');

    const validAttendees = form.attendees.filter((a) => a.email.trim());

    setSubmitting(true);
    try {
      await meetingAPI.create(slug, {
        title:       form.title.trim(),
        description: form.description.trim(),
        startTime:   new Date(form.startTime).toISOString(),
        endTime:     new Date(endTime).toISOString(),
        attendees:   validAttendees,
        leadId:      form.leadId || undefined,
      });
      onCreated();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not schedule meeting');
    } finally {
      setSubmitting(false);
    }
  };

  const inp = {
    padding: '10px 14px', borderRadius: 10,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none', width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: '#00000070', zIndex: 999, backdropFilter: 'blur(4px)' }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: 560,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20, padding: 28,
        zIndex: 1000,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px #00000060',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#818cf820', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RiVideoLine size={20} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Schedule Meeting</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Creates Google Meet + Calendar event</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <RiCloseLine size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Meeting Title *
            </label>
            <input
              type="text" value={form.title} required
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Product Demo with Client"
              style={inp}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Optional agenda or notes..."
              rows={2}
              style={{ ...inp, resize: 'vertical', minHeight: 60 }}
            />
          </div>

          {/* Date/Time + Duration — 2 col */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Start Time *
              </label>
              <input
                type="datetime-local" required
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
                style={{ ...inp, colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Duration
              </label>
              <select value={form.duration} onChange={(e) => set('duration', Number(e.target.value))} style={inp}>
                {DURATIONS.map((d) => <option key={d.mins} value={d.mins}>{d.label}</option>)}
              </select>
            </div>
          </div>

          {/* End time preview */}
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <RiTimeLine size={13} />
            Ends at: <strong style={{ color: 'var(--text-primary)' }}>
              {new Date(endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </strong>
          </div>

          {/* Lead */}
          {leads.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Link to Lead (Optional)
              </label>
              <select value={form.leadId} onChange={(e) => set('leadId', e.target.value)} style={inp}>
                <option value="">No lead</option>
                {leads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}{l.companyName ? ` — ${l.companyName}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Attendees */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Attendees
              </label>
              <button type="button" onClick={addAttendee} style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, color: 'var(--text)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <RiAddLine size={13} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.attendees.map((att, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text" placeholder="Name" value={att.name}
                    onChange={(e) => setAttendee(i, 'name', e.target.value)}
                    style={{ ...inp, flex: '0 0 35%' }}
                  />
                  <input
                    type="email" placeholder="Email *" value={att.email}
                    onChange={(e) => setAttendee(i, 'email', e.target.value)}
                    style={{ ...inp, flex: 1 }}
                  />
                  {form.attendees.length > 1 && (
                    <button type="button" onClick={() => removeAttendee(i)} style={{
                      background: '#ef444415', border: '1px solid #ef444440',
                      borderRadius: 8, color: '#ef4444', cursor: 'pointer',
                      width: 38, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <RiDeleteBinLine size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Attendees receive Google Calendar invites automatically
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '12px', borderRadius: 12,
            background: 'linear-gradient(135deg,#818cf8,#6366f1)',
            border: 'none', color: '#fff',
            fontWeight: 800, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            opacity: submitting ? 0.7 : 1,
          }}>
            <RiVideoLine size={18} />
            {submitting ? 'Scheduling...' : 'Schedule Meeting + Create Meet Link'}
          </button>
        </form>
      </div>
    </>
  );
}
