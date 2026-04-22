import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  MessageSquarePlus, X, Trash2, Send, StickyNote,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { empAPI } from '../../api';

// ── Status Config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'var(--primary)' },
  contacted:   { label: 'Contacted',   color: 'var(--warning)' },
  interested:  { label: 'Interested',  color: '#06b6d4' },
  negotiation: { label: 'Negotiation', color: '#a855f7' },
  closed_won:  { label: 'Won ✓',       color: 'var(--success)' },
  closed_lost: { label: 'Lost ✗',      color: 'var(--danger)' },
  on_hold:     { label: 'On Hold',     color: 'var(--text-muted)' },
};

// ── Notes Drawer ─────────────────────────────────────────────────
function NotesDrawer({ lead, slug, onClose }) {
  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);

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
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    } finally {
      setDeleting(null);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return (
      d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    );
  };

  if (!lead) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 1000, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
        zIndex: 1001, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
        animation: 'slideInRight .25s ease',
      }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <StickyNote size={16} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: 16 }}>Notes</span>
                <span style={{
                  background: 'var(--primary)', color: 'white',
                  borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '1px 7px',
                }}>{notes.length}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {lead.name} · {lead.phone}
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        {/* Notes list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              Loading notes…
            </div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No notes yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Add a note below to keep track of this lead.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...notes].reverse().map((note) => (
                <div key={note._id} style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  {/* Text */}
                  <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
                    {note.text}
                  </div>
                  {/* Meta + delete */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                      onClick={() => handleDelete(note._id)}
                      disabled={deleting === note._id}
                      title="Delete note"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: 4, borderRadius: 4,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      {deleting === note._id
                        ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add note */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <textarea
            className="form-input"
            placeholder="Write a note… e.g. Client wants 2BHK, call back tomorrow"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd(); }}
            rows={3}
            style={{ width: '100%', resize: 'none', fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ctrl+Enter to save</span>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={saving || !text.trim()}
            >
              <Send size={14} />
              {saving ? 'Saving…' : 'Add Note'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function MyLeads() {
  const { slug } = useParams();

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
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <div className="page-content">
        {/* Header */}
        <div className="flex-between mb-6">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Leads</h1>
            <p className="text-muted" style={{ marginTop: 4 }}>
              {pagination.total} leads assigned to you
            </p>
          </div>
          <button className="btn btn-ghost" onClick={fetchLeads}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-4" style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={15} style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
              }} />
              <input
                className="form-input"
                placeholder="Search name, phone…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: 34, height: 36 }}
              />
            </div>
            <select
              className="form-input"
              value={filterStatus}
              onChange={e => { setFilter(e.target.value); setPage(1); }}
              style={{ width: 150, height: 36 }}
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Source</th>
                  <th>Budget</th>
                  <th>Requirement</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      Loading…
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state" style={{ padding: '48px 0' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                        <h3>No leads assigned yet</h3>
                        <p>Ask your manager to assign leads to you.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, idx) => {
                    const rowNum    = (pagination.page - 1) * 20 + idx + 1;
                    const noteCount = lead.notes?.length || 0;
                    return (
                      <tr key={lead._id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{rowNum}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.name}</div>
                          {lead.email && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.email}</div>
                          )}
                        </td>
                        <td style={{ fontSize: 13 }}>{lead.phone}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.source || '—'}</td>
                        <td style={{ fontSize: 12 }}>{lead.budget || '—'}</td>
                        <td style={{ fontSize: 12 }}>{lead.requirement || '—'}</td>
                        <td>
                          <select
                            value={lead.status}
                            onChange={e => handleStatusChange(lead._id, e.target.value)}
                            style={{
                              padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                              border: `1px solid ${STATUS_CONFIG[lead.status]?.color || 'var(--border)'}`,
                              color: STATUS_CONFIG[lead.status]?.color || 'var(--text)',
                              background: 'var(--bg-elevated)', cursor: 'pointer',
                            }}
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost"
                            onClick={() => setDrawerLead(lead)}
                            style={{ gap: 6, fontSize: 12, padding: '4px 10px' }}
                            title="View / Add Notes"
                          >
                            <MessageSquarePlus size={14} />
                            {noteCount > 0 ? (
                              <span style={{
                                background: 'var(--primary)', color: 'white',
                                borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 6px',
                              }}>
                                {noteCount}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Add</span>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', borderTop: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes Drawer */}
      <NotesDrawer
        lead={drawerLead}
        slug={slug}
        onClose={() => setDrawerLead(null)}
      />
    </>
  );
}
