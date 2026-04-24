import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  MessageSquarePlus, X, Trash2, Send, StickyNote,
  Loader2, Phone, Mail, MapPin, Banknote, Home, Tag,
  Clock, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { empAPI } from '../../api';

// ── Status Config ────────────────────────────────────────────────
const SC = {
  new:         { label: 'New',         color: '#818cf8', bg: '#818cf812' },
  contacted:   { label: 'Contacted',   color: '#fbbf24', bg: '#fbbf2412' },
  interested:  { label: 'Interested',  color: '#06b6d4', bg: '#06b6d412' },
  negotiation: { label: 'Negotiation', color: '#a855f7', bg: '#a855f712' },
  closed_won:  { label: 'Won ✓',       color: '#34d399', bg: '#34d39912' },
  closed_lost: { label: 'Lost ✗',      color: '#ef4444', bg: '#ef444412' },
  on_hold:     { label: 'On Hold',     color: '#94a3b8', bg: '#94a3b812' },
};

const GRAD = [
  'linear-gradient(135deg,#818cf8,#a78bfa)',
  'linear-gradient(135deg,#34d399,#6ee7b7)',
  'linear-gradient(135deg,#f472b6,#fb7185)',
  'linear-gradient(135deg,#fbbf24,#f59e0b)',
  'linear-gradient(135deg,#60a5fa,#818cf8)',
  'linear-gradient(135deg,#a78bfa,#f472b6)',
];
const getGrad = (name) => GRAD[(name?.charCodeAt(0) || 0) % GRAD.length];

function timeAgo(date) {
  if (!date) return '—';
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── Notes Drawer ─────────────────────────────────────────────────
function NotesDrawer({ lead, slug, onClose }) {
  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const cfg = SC[lead?.status] || SC.new;

  useEffect(() => {
    if (!lead) return;
    setLoading(true);
    empAPI.getNotes(slug, lead._id)
      .then(r => setNotes(r.data.data || []))
      .catch(() => toast.error('Failed to load notes'))
      .finally(() => setLoading(false));
  }, [lead, slug]);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await empAPI.addNote(slug, lead._id, text.trim());
      setNotes(res.data.data || []);
      setText('');
      toast.success('Note added!');
    } catch {
      toast.error('Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    setDeleting(noteId);
    try {
      const res = await empAPI.deleteNote(slug, lead._id, noteId);
      setNotes(res.data.data || []);
    } catch {
      toast.error('Failed to delete note');
    } finally {
      setDeleting(null);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (!lead) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 40px rgba(0,0,0,0.3)', animation: 'slideInRight .3s cubic-bezier(.22,.68,0,1.2)' }}>

        {/* Drawer Header */}
        <div style={{ padding: '0 0 0', flexShrink: 0 }}>
          {/* Color strip */}
          <div style={{ height: 3, background: cfg.color }} />
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: getGrad(lead.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: 'white', flexShrink: 0 }}>
                  {lead.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{lead.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.phone}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 8, display: 'flex' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              ><X size={18} /></button>
            </div>

            {/* Quick info pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
              {lead.source      && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}><Tag size={9} style={{ display:'inline', marginRight:3 }} />{lead.source}</span>}
              {lead.budget      && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}><Banknote size={9} style={{ display:'inline', marginRight:3 }} />{lead.budget}</span>}
              {lead.requirement && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}><Home size={9} style={{ display:'inline', marginRight:3 }} />{lead.requirement}</span>}
              {lead.location    && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}><MapPin size={9} style={{ display:'inline', marginRight:3 }} />{lead.location}</span>}
            </div>
          </div>

          {/* Notes header */}
          <div style={{ padding: '10px 20px 8px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)' }}>
            <StickyNote size={13} color="#818cf8" />
            <span style={{ fontWeight: 700, fontSize: 13 }}>Notes</span>
            <span style={{ background: '#818cf8', color: 'white', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 7px' }}>{notes.length}</span>
          </div>
        </div>

        {/* Notes list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Loader2 size={24} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📝</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No notes yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add your first note below</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...notes].reverse().map((note) => (
                <div key={note._id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 10 }}>{note.text}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: note.addedBy?.role === 'businessAdmin' ? '#818cf830' : '#34d39930', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: note.addedBy?.role === 'businessAdmin' ? '#818cf8' : '#34d399' }}>
                        {note.addedBy?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: note.addedBy?.role === 'businessAdmin' ? '#818cf8' : '#34d399' }}>{note.addedBy?.name || 'You'}</span>
                      <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border)' }} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}><Clock size={9} style={{ display:'inline', marginRight: 3 }} />{formatTime(note.createdAt)}</span>
                    </div>
                    <button onClick={() => handleDelete(note._id)} disabled={deleting === note._id}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 6px', borderRadius: 6, display: 'flex' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#ef444412'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                    >
                      {deleting === note._id ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add note bar */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-elevated)' }}>
          <textarea
            className="form-input"
            placeholder="Write a note… e.g. Client wants 2BHK, callback tomorrow at 4pm"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd(); }}
            rows={3}
            style={{ width: '100%', resize: 'none', fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }}
            autoFocus
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ctrl + Enter to save</span>
            <button onClick={handleAdd} disabled={saving || !text.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#818cf8,#6366f1)', border: 'none', cursor: saving || !text.trim() ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, color: 'white', opacity: !text.trim() ? 0.6 : 1 }}>
              {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
              {saving ? 'Saving…' : 'Add Note'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Status Select Dropdown ───────────────────────────────────────
const StatusSelect = ({ lead, onUpdate }) => {
  const cfg = SC[lead.status] || SC.new;
  return (
    <select value={lead.status} onChange={e => onUpdate(lead._id, e.target.value)}
      style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${cfg.color}50`, color: cfg.color, background: cfg.bg, cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none' }}>
      {Object.entries(SC).map(([k, v]) => (
        <option key={k} value={k} style={{ background: 'var(--bg-card)', color: 'var(--text)' }}>{v.label}</option>
      ))}
    </select>
  );
};

// ── Main Page ────────────────────────────────────────────────────
export default function MyLeads() {
  const { slug }    = useParams();
  const navigate    = useNavigate();

  const [leads, setLeads]           = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('');
  const [page, setPage]             = useState(1);
  const [drawerLead, setDrawerLead] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search)       params.search = search;
      if (filterStatus) params.status = filterStatus;
      const res = await empAPI.getMyLeads(slug, params);
      setLeads(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [slug, page, search, filterStatus]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleStatusChange = async (id, status) => {
    try {
      await empAPI.updateStatus(slug, id, status);
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      toast.success('Status updated!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Status counts for tabs
  const counts = leads.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.15} }
      `}</style>

      <div className="page-content">

        {/* ── Header ───────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>My Leads</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>{pagination.total} leads assigned to you</p>
          </div>
          <button onClick={fetchLeads}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text)' }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>

        {/* ── Filters ──────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 16 }}>
          {/* Row 1: Search */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" placeholder="Search name or phone…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box', height: 38 }}
              />
            </div>
          </div>
          {/* Row 2: Status tabs */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
            <button onClick={() => { setFilter(''); setPage(1); }}
              style={{ padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: filterStatus === '' ? 'var(--primary)' : 'var(--bg-elevated)', color: filterStatus === '' ? 'white' : 'var(--text-muted)', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
              All ({pagination.total})
            </button>
            {Object.entries(SC).map(([k, v]) => (
              <button key={k} onClick={() => { setFilter(k); setPage(1); }}
                style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${filterStatus === k ? v.color : 'transparent'}`, cursor: 'pointer', fontSize: 12, fontWeight: 700, background: filterStatus === k ? v.bg : 'var(--bg-elevated)', color: filterStatus === k ? v.color : 'var(--text-muted)', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Lead', 'Phone', 'Source', 'Budget', 'Requirement', 'Status', 'Notes'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center' }}>
                    <Loader2 size={24} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
                  </td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div style={{ padding: '60px 0', textAlign: 'center' }}>
                      <div style={{ fontSize: 44, marginBottom: 14 }}>📋</div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No leads found</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {search || filterStatus ? 'Try clearing filters.' : 'Ask your manager to assign leads.'}
                      </div>
                    </div>
                  </td></tr>
                ) : leads.map((lead, idx) => {
                  const rowNum   = (pagination.page - 1) * 20 + idx + 1;
                  const noteCount = lead.notes?.length || 0;
                  const cfg      = SC[lead.status] || SC.new;
                  return (
                    <tr key={lead._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>{rowNum}</td>

                      {/* Lead avatar + name */}
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: getGrad(lead.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: 'white', flexShrink: 0 }}>
                            {lead.name?.[0]?.toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, cursor: 'pointer', color: '#818cf8' }}
                              onClick={() => navigate(`/${slug}/emp/my-leads/${lead._id}`, { state: { lead } })}>
                              {lead.name}
                            </div>
                            {lead.email && <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{lead.email}</div>}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        <Phone size={11} style={{ display:'inline', marginRight:4 }} />{lead.phone || '—'}
                      </td>

                      <td style={{ padding: '11px 14px' }}>
                        {lead.source ? (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                            {lead.source}
                          </span>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                      </td>

                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                        {lead.budget ? <span style={{ fontWeight: 600, color: '#34d399' }}>{lead.budget}</span> : '—'}
                      </td>

                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)', maxWidth: 120 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.requirement || '—'}</div>
                      </td>

                      <td style={{ padding: '11px 14px' }}>
                        <StatusSelect lead={lead} onUpdate={handleStatusChange} />
                      </td>

                      <td style={{ padding: '11px 14px' }}>
                        <button onClick={() => setDrawerLead(lead)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9, background: noteCount > 0 ? '#818cf818' : 'var(--bg-elevated)', border: `1px solid ${noteCount > 0 ? '#818cf840' : 'var(--border)'}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: noteCount > 0 ? '#818cf8' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          <MessageSquarePlus size={13} />
                          {noteCount > 0 ? <span>{noteCount}</span> : <span>Add</span>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {pagination.page} of {pagination.pages} · {pagination.total} leads</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page - 2 + i;
                  if (p < 1 || p > pagination.pages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: p === page ? 'var(--primary)' : 'var(--bg-elevated)', color: p === page ? 'white' : 'var(--text-muted)', transition: 'all 0.15s' }}
                    >{p}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: page === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={15} />
                </button>
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                  style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: page === pagination.pages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: page === pagination.pages ? 0.4 : 1 }}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <NotesDrawer lead={drawerLead} slug={slug} onClose={() => setDrawerLead(null)} />
    </>
  );
}
