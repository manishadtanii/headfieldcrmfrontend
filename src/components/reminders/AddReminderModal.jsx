import { useState, useEffect, useRef } from 'react';
import {
  RiCalendarEventLine, RiCloseLine, RiTimeLine,
  RiFileTextLine, RiSearchLine, RiCheckLine,
} from 'react-icons/ri';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// AddReminderModal — Create or Edit a Reminder
// ─────────────────────────────────────────────────────────────────────────────

const toLocalDT = (date) => {
  if (!date) return '';
  const d   = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function AddReminderModal({ slug, reminder, onClose, onSaved }) {
  const isEdit = !!(reminder?._id);

  const [form, setForm] = useState({
    title:       reminder?.title       || '',
    description: reminder?.description || '',
    scheduledAt: toLocalDT(reminder?.scheduledAt || ''),
    leadId:      reminder?.lead?._id   || '',
  });
  const [saving,        setSaving]       = useState(false);
  const [leads,         setLeads]        = useState([]);
  const [leadSearch,    setLeadSearch]   = useState(reminder?.lead?.name || '');
  const [showDrop,      setShowDrop]     = useState(false);
  const dropRef = useRef(null);

  // Fetch employee's leads
  useEffect(() => {
    api.get(`/b/${slug}/leads/my/leads?limit=100`)
      .then((r) => setLeads(r.data.data || r.data.leads || []))
      .catch(() => {});
  }, [slug]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredLeads = leads.filter((l) =>
    (l.name || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
    (l.phone || '').includes(leadSearch)
  ).slice(0, 6);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.scheduledAt)  return toast.error('Date & time is required');
    const dt = new Date(form.scheduledAt);
    if (dt <= new Date())   return toast.error('Time must be in the future');

    setSaving(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        scheduledAt: dt.toISOString(),
        leadId:      form.leadId || undefined,
      };

      if (isEdit) {
        await api.patch(`/b/${slug}/reminders/${reminder._id}`, payload);
        toast.success('Reminder updated ✅');
      } else {
        await api.post(`/b/${slug}/reminders`, payload);
        toast.success('Reminder scheduled! 📅');
      }
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save reminder');
    } finally {
      setSaving(false);
    }
  };

  const setQuickTime = (mins) => {
    const dt = new Date(Date.now() + mins * 60000);
    setForm((f) => ({ ...f, scheduledAt: toLocalDT(dt) }));
  };

  const selectLead = (lead) => {
    setForm((f) => ({ ...f, leadId: lead._id }));
    setLeadSearch(lead.name);
    setShowDrop(false);
  };

  const clearLead = () => {
    setForm((f) => ({ ...f, leadId: '' }));
    setLeadSearch('');
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: 12, fontWeight: 700, marginBottom: 8,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
      }} />

      {/* Modal — overflow: visible so dropdown can escape */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', zIndex: 1001,
        transform: 'translate(-50%,-50%)',
        width: '95%', maxWidth: 480,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        overflow: 'visible',          // ← KEY FIX: dropdown won't be clipped
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 18px',
          borderBottom: '1px solid var(--border)',
          borderRadius: '20px 20px 0 0',
          background: 'linear-gradient(135deg,rgba(129,140,248,0.08),transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: '#818cf820',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RiCalendarEventLine size={20} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                {isEdit ? 'Edit Reminder' : 'New Reminder'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                {isEdit ? 'Update reminder details' : 'Schedule a follow-up or meeting'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)',
          }}>
            <RiCloseLine size={17} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px 24px' }}>

          {/* Title */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              <RiFileTextLine size={13} /> Title *
            </label>
            <input
              name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Call Rahul about budget"
              maxLength={100} autoFocus style={inputStyle}
            />
          </div>

          {/* Date & Time */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>
              <RiTimeLine size={13} /> Date & Time *
            </label>
            <input
              type="datetime-local" name="scheduledAt"
              value={form.scheduledAt} onChange={handleChange}
              min={toLocalDT(new Date(Date.now() + 2 * 60000))}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>

          {/* Quick time shortcuts */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {[
              { label: '+1 hr',   mins: 60   },
              { label: '+3 hrs',  mins: 180  },
              { label: '+1 day',  mins: 1440 },
              { label: '+2 days', mins: 2880 },
            ].map(({ label, mins }) => (
              <button key={mins} type="button" onClick={() => setQuickTime(mins)} style={{
                padding: '5px 13px', borderRadius: 20, cursor: 'pointer',
                fontSize: 12, fontWeight: 600,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              <RiFileTextLine size={13} /> Notes
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              placeholder="Discuss budget, confirm site visit..."
              maxLength={500} rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Lead search — dropdown fix with ref */}
          <div style={{ marginBottom: 24 }} ref={dropRef}>
            <label style={labelStyle}>
              <RiSearchLine size={13} /> Link to Lead
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                value={leadSearch}
                onChange={(e) => {
                  setLeadSearch(e.target.value);
                  setShowDrop(true);
                  setForm((f) => ({ ...f, leadId: '' }));
                }}
                onFocus={() => setShowDrop(true)}
                placeholder="Search by name or phone..."
                style={inputStyle}
              />
              {form.leadId && (
                <button type="button" onClick={clearLead} style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748b', display: 'flex',
                }}>
                  <RiCloseLine size={16} />
                </button>
              )}
              {form.leadId && (
                <span style={{
                  position: 'absolute', right: 36, top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#10b981',
                }}>
                  <RiCheckLine size={16} />
                </span>
              )}

              {/* Dropdown — positioned relative to input, z-index above modal */}
              {showDrop && leadSearch && !form.leadId && filteredLeads.length > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  zIndex: 9999,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
                  overflow: 'hidden',
                }}>
                  {filteredLeads.map((lead, i) => (
                    <button
                      key={lead._id} type="button"
                      onMouseDown={() => selectLead(lead)}
                      style={{
                        width: '100%', padding: '11px 14px',
                        textAlign: 'left', background: 'transparent',
                        border: 'none', cursor: 'pointer',
                        borderBottom: i < filteredLeads.length - 1 ? '1px solid var(--border)' : 'none',
                        display: 'flex', alignItems: 'center', gap: 12,
                        transition: 'background .1s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#818cf8,#6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800, color: 'white',
                      }}>
                        {lead.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                          {lead.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                          {lead.phone}
                          {lead.status && ` · ${lead.status}`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {showDrop && leadSearch && !form.leadId && leads.length > 0 && filteredLeads.length === 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  zIndex: 9999, background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 12,
                  padding: '14px', textAlign: 'center',
                  fontSize: 13, color: 'var(--text-muted)',
                }}>
                  No leads found
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '12px 0', borderRadius: 12, cursor: 'pointer',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontWeight: 600, fontSize: 14,
            }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{
              flex: 2, padding: '12px 0', borderRadius: 12, cursor: 'pointer',
              background: 'linear-gradient(135deg,#818cf8,#6366f1)',
              border: 'none', color: 'white', fontWeight: 800, fontSize: 14,
              opacity: saving ? 0.7 : 1,
              boxShadow: '0 4px 18px #6366f130',
            }}>
              {saving ? 'Saving...' : isEdit ? '✅ Update Reminder' : '📅 Schedule Reminder'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
