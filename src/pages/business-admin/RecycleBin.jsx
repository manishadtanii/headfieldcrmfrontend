import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Trash2, RotateCcw, AlertTriangle, Search,
  RefreshCw, Loader2, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { baAPI } from '../../api';

const GRAD = [
  'linear-gradient(135deg,#818cf8,#a78bfa)',
  'linear-gradient(135deg,#34d399,#6ee7b7)',
  'linear-gradient(135deg,#f472b6,#fb7185)',
  'linear-gradient(135deg,#fbbf24,#f59e0b)',
  'linear-gradient(135deg,#60a5fa,#818cf8)',
];
const getGrad = (name) => GRAD[(name?.charCodeAt(0) || 0) % GRAD.length];

function timeAgo(date) {
  if (!date) return '—';
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Confirm Permanent Delete Modal ───────────────────────────────
const PermanentDeleteModal = ({ lead, onConfirm, onClose, loading }) => (
  <div className="confirm-overlay">
    <div className="confirm-card confirm-card-danger">
      <div className="confirm-strip" style={{ background: 'linear-gradient(90deg,#ef4444,#7f1d1d)' }} />
      <div className="confirm-body">
        <div className="confirm-icon-wrap" style={{ background: 'rgba(239,68,68,0.12)' }}>
          <AlertTriangle size={20} color="#ef4444" />
        </div>
        <div className="confirm-texts">
          <div className="confirm-title">Permanently Delete?</div>
          <div className="confirm-desc">
            <strong>{lead?.name}</strong> will be <strong style={{ color: '#ef4444' }}>forever deleted</strong> from the database. This action <strong>CANNOT be undone</strong> — no recovery possible.
          </div>
        </div>
      </div>
      <div className="confirm-warn">
        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>This is different from a normal delete. Once permanently deleted, even support cannot recover this lead.</span>
      </div>
      <div className="confirm-actions">
        <button className="confirm-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="confirm-btn-action confirm-btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
          {loading ? 'Deleting…' : 'Yes, Delete Forever'}
        </button>
      </div>
    </div>
  </div>
);


// ── Main Page ────────────────────────────────────────────────────
export default function RecycleBin() {
  const { slug } = useParams();
  const [leads, setLeads]           = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [restoring, setRestoring]   = useState(null);
  const [permTarget, setPermTarget] = useState(null); // lead to permanently delete
  const [permLoading, setPermLoading] = useState(false);

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const res = await baAPI.getTrash(slug, params);
      setLeads(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load recycle bin');
    } finally {
      setLoading(false);
    }
  }, [slug, page, search]);

  useEffect(() => { fetchTrash(); }, [fetchTrash]);

  const handleRestore = async (lead) => {
    setRestoring(lead._id);
    try {
      await baAPI.restoreLead(slug, lead._id);
      toast.success(`"${lead.name}" restored successfully! ✅`);
      fetchTrash();
    } catch {
      toast.error('Failed to restore lead');
    } finally {
      setRestoring(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!permTarget) return;
    setPermLoading(true);
    try {
      await baAPI.permanentDelete(slug, permTarget._id);
      toast.success(`"${permTarget.name}" permanently deleted`);
      setPermTarget(null);
      fetchTrash();
    } catch {
      toast.error('Failed to delete permanently');
    } finally {
      setPermLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="page-content">

        {/* ── Header ───────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ef444418', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} color="#ef4444" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Recycle Bin</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
                Deleted leads — restore or permanently remove them
              </p>
            </div>
            <button onClick={fetchTrash}
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text)' }}>
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
            </button>
          </div>
        </div>

        {/* ── Info banner ──────────────────────────────────── */}
        <div style={{ background: '#fbbf2410', border: '1px solid #fbbf2430', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <AlertTriangle size={15} color="#fbbf24" />
          <div style={{ fontSize: 13, color: '#d97706', fontWeight: 500 }}>
            <strong>Restore</strong> a lead to bring it back to your active leads list.
            <strong> Permanent delete</strong> removes it forever from the database — no recovery possible.
          </div>
        </div>

        {/* ── Search ───────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search deleted leads by name or phone…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box', height: 38 }}
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                  {['Lead', 'Phone', 'Source', 'Assigned To', 'Deleted', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center' }}>
                    <Loader2 size={24} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
                  </td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div style={{ padding: '60px 0', textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
                      <div style={{ fontSize: 52, marginBottom: 14 }}>🗑️</div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Recycle Bin is Empty</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {search ? 'No deleted leads match your search.' : 'No deleted leads found. Deleted leads will appear here.'}
                      </div>
                    </div>
                  </td></tr>
                ) : leads.map((lead) => (
                  <tr key={lead._id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background .1s', animation: 'fadeIn 0.3s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Lead avatar + name */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: getGrad(lead.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: 'white', flexShrink: 0, opacity: 0.6 }}>
                          {lead.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-muted)' }}>{lead.name}</div>
                          {lead.email && <div style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.6 }}>{lead.email}</div>}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{lead.phone || '—'}</td>

                    <td style={{ padding: '12px 16px' }}>
                      {lead.source ? (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          {lead.source}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {lead.assignedTo?.name || <span style={{ opacity: 0.5 }}>Unassigned</span>}
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#ef4444', whiteSpace: 'nowrap' }}>
                      {timeAgo(lead.deletedAt)}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {/* Restore */}
                        <button onClick={() => handleRestore(lead)} disabled={restoring === lead._id}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#34d39912', border: '1px solid #34d39930', cursor: restoring === lead._id ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, color: '#34d399', transition: 'all 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#34d39920'}
                          onMouseLeave={e => e.currentTarget.style.background = '#34d39912'}
                        >
                          {restoring === lead._id
                            ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            : <RotateCcw size={12} />}
                          Restore
                        </button>

                        {/* Permanent delete */}
                        <button onClick={() => setPermTarget(lead)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#ef444412', border: '1px solid #ef444430', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#ef4444', transition: 'all 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#ef444420'}
                          onMouseLeave={e => e.currentTarget.style.background = '#ef444412'}
                        >
                          <Trash2 size={12} />
                          Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Page {pagination.page} of {pagination.pages} · {pagination.total} deleted leads
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page - 2 + i;
                  if (p < 1 || p > pagination.pages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: p === page ? '#ef4444' : 'var(--bg-elevated)', color: p === page ? 'white' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                      {p}
                    </button>
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

      {/* Permanent delete modal */}
      {permTarget && (
        <PermanentDeleteModal
          lead={permTarget}
          loading={permLoading}
          onConfirm={handlePermanentDelete}
          onClose={() => setPermTarget(null)}
        />
      )}
    </>
  );
}
