import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, Tag,
  Wallet, Home, Clock, RefreshCw, Send, Trash2, StickyNote,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { empAPI } from '../../api';

// ── Status config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'var(--primary)',    bg: 'rgba(99,102,241,0.12)'  },
  contacted:   { label: 'Contacted',   color: 'var(--warning)',    bg: 'rgba(245,158,11,0.12)'  },
  interested:  { label: 'Interested',  color: '#06b6d4',           bg: 'rgba(6,182,212,0.12)'   },
  negotiation: { label: 'Negotiation', color: '#a855f7',           bg: 'rgba(168,85,247,0.12)'  },
  closed_won:  { label: 'Won ✓',       color: 'var(--success)',    bg: 'rgba(16,185,129,0.12)'  },
  closed_lost: { label: 'Lost ✗',      color: 'var(--danger)',     bg: 'rgba(239,68,68,0.12)'   },
  on_hold:     { label: 'On Hold',     color: 'var(--text-muted)', bg: 'rgba(100,116,139,0.12)' },
};

// ── Info Row ──────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '10px 0', borderBottom: '1px solid var(--border)',
    }}>
      <Icon size={15} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
export default function LeadDetail() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [lead, setLead]         = useState(null);
  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ── Fetch lead detail ──────────────────────────────────────────
  const fetchLead = useCallback(async () => {
    setLoading(true);
    try {
      // Reuse getMyLeads with search to get lead detail via notes endpoint
      const [notesRes] = await Promise.all([
        empAPI.getNotes(slug, id),
      ]);
      setNotes(notesRes.data.data || []);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [slug, id]);

  // ── Get lead from MyLeads list (via navigation state or fetch) ─
  useEffect(() => {
    // Lead data passed via navigate state
    if (location.state?.lead) {
      setLead(location.state.lead);
    }
    fetchLead();
  }, [fetchLead]);

  // ── Status update ──────────────────────────────────────────────
  const handleStatusChange = async (status) => {
    if (!lead) return;
    setUpdatingStatus(true);
    try {
      await empAPI.updateStatus(slug, id, status);
      setLead(prev => ({ ...prev, status }));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Add note ──────────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      const res = await empAPI.addNote(slug, id, noteText.trim());
      setNotes(res.data.data || []);
      setNoteText('');
      toast.success('Note added!');
    } catch {
      toast.error('Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete note ───────────────────────────────────────────────
  const handleDeleteNote = async (noteId) => {
    setDeleting(noteId);
    try {
      const res = await empAPI.deleteNote(slug, id, noteId);
      setNotes(res.data.data || []);
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    } finally {
      setDeleting(null);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const cfg = lead ? (STATUS_CONFIG[lead.status] || STATUS_CONFIG.new) : STATUS_CONFIG.new;

  return (
    <div className="page-content">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex-between mb-6">
        <button
          className="btn btn-ghost"
          onClick={() => navigate(`/${slug}/emp/my-leads`)}
          style={{ gap: 6 }}
        >
          <ArrowLeft size={16} /> Back to My Leads
        </button>
        <button className="btn btn-ghost" onClick={fetchLead}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {!lead ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          {loading ? 'Loading lead…' : 'Lead not found. Please go back and reopen.'}
        </div>
      ) : (
        <div className="grid grid-2" style={{ alignItems: 'start' }}>

          {/* ── Left: Lead Info ──────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Name card */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: cfg.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22, fontWeight: 700,
                  color: cfg.color, flexShrink: 0,
                }}>
                  {lead.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{lead.name}</div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    color: cfg.color, background: cfg.bg,
                  }}>
                    {cfg.label}
                  </span>
                </div>
              </div>

              {/* Status selector */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Update Status</label>
                <select
                  className="form-input"
                  value={lead.status}
                  onChange={e => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  style={{ height: 38 }}
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="card" style={{ padding: '16px 24px' }}>
              <div className="card-title" style={{ marginBottom: 8, fontSize: 14 }}>Contact Info</div>
              <InfoRow icon={Phone}    label="Phone"     value={lead.phone} />
              <InfoRow icon={Mail}     label="Email"     value={lead.email} />
              <InfoRow icon={MapPin}   label="Location"  value={lead.location} />
            </div>

            {/* Lead Info */}
            <div className="card" style={{ padding: '16px 24px' }}>
              <div className="card-title" style={{ marginBottom: 8, fontSize: 14 }}>Lead Details</div>
              <InfoRow icon={Tag}      label="Source"           value={lead.source} />
              <InfoRow icon={Wallet}   label="Budget"           value={lead.budget} />
              <InfoRow icon={Home}     label="Interested In"    value={lead.requirement} />
              <InfoRow icon={Home}     label="Currently Renting?" value={lead.isRenting} />
              <InfoRow icon={Clock}    label="Preferred Callback" value={lead.callbackTime} />
              <InfoRow icon={Calendar} label="Lead Created"     value={lead.createdAt ? formatTime(lead.createdAt) : null} />
            </div>
          </div>

          {/* ── Right: Notes ─────────────────────────────────────── */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StickyNote size={15} color="var(--primary)" />
                <div className="card-title">Notes</div>
                <span style={{
                  background: 'var(--primary)', color: 'white', borderRadius: 10,
                  fontSize: 10, fontWeight: 700, padding: '1px 7px',
                }}>{notes.length}</span>
              </div>
            </div>

            {/* Notes list */}
            <div style={{ flex: 1, maxHeight: 400, overflowY: 'auto', padding: '8px 0' }}>
              {loading ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
              ) : notes.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📝</div>
                  <p>No notes yet. Add your first note below.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[...notes].reverse().map((note, i) => (
                    <div key={note._id} style={{
                      padding: '12px 20px',
                      borderBottom: i < notes.length - 1 ? '1px solid var(--border)' : 'none',
                      borderLeft: note.addedBy?.role === 'businessAdmin'
                        ? '3px solid var(--primary)'
                        : '3px solid var(--success)',
                    }}>
                      <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>
                        {note.text}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          <span style={{
                            fontWeight: 600, marginRight: 4,
                            color: note.addedBy?.role === 'businessAdmin' ? 'var(--primary)' : 'var(--success)',
                          }}>
                            {note.addedBy?.name || 'You'}
                          </span>
                          · {formatTime(note.createdAt)}
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          disabled={deleting === note._id}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', padding: 4, borderRadius: 4,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          {deleting === note._id
                            ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            : <Trash2 size={12} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add note */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
              <textarea
                className="form-input"
                placeholder="Write a note about this lead…"
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddNote(); }}
                rows={3}
                style={{ resize: 'none', width: '100%', fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ctrl+Enter to save</span>
                <button
                  className="btn btn-primary"
                  onClick={handleAddNote}
                  disabled={saving || !noteText.trim()}
                  style={{ gap: 6 }}
                >
                  <Send size={13} />
                  {saving ? 'Saving…' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
