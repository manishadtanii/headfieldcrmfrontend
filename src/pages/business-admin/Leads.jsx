import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus, Upload, Download, Search, RefreshCw,
  CheckSquare, Square, UserPlus, Trash2, ChevronLeft, ChevronRight,
  ClipboardList, UserRound, UserMinus, Trophy, TrendingUp,
  AlertTriangle, X, Loader2, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { baAPI } from '../../api';
import ImportModal from '../../components/business/ImportModal';
import AssignModal from '../../components/business/AssignModal';
import AddLeadModal from '../../components/business/AddLeadModal';

// ── Status config ──────────────────────────────────────────────────
const SC = {
  new:         { label: 'New',         color: '#818cf8', bg: '#818cf812' },
  contacted:   { label: 'Contacted',   color: '#fbbf24', bg: '#fbbf2412' },
  interested:  { label: 'Interested',  color: '#06b6d4', bg: '#06b6d412' },
  negotiation: { label: 'Negotiation', color: '#a855f7', bg: '#a855f712' },
  closed_won:  { label: 'Won ✓',       color: '#34d399', bg: '#34d39912' },
  closed_lost: { label: 'Lost',        color: '#ef4444', bg: '#ef444412' },
  on_hold:     { label: 'On Hold',     color: '#94a3b8', bg: '#94a3b812' },
};

const PRIORITY_CFG = {
  high:   { color: '#ef4444', label: 'High',   dot: '🔴' },
  medium: { color: '#fbbf24', label: 'Medium', dot: '🟡' },
  low:    { color: '#34d399', label: 'Low',    dot: '🟢' },
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

// ── Status Badge ───────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = SC[status] || SC.new;
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, whiteSpace: 'nowrap', border: `1px solid ${cfg.color}30` }}>
      {cfg.label}
    </span>
  );
};

// ── Mini stat card ─────────────────────────────────────────────────
const MiniStat = ({ icon: Icon, label, value, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, flex: 1 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={14} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

// ── Confirm Delete Modal ──────────────────────────────────────────
const ConfirmModal = ({ lead, onConfirm, onClose, loading }) => (
  <div className="confirm-overlay">
    <div className="confirm-card confirm-card-danger">
      <div className="confirm-strip" style={{ background: 'linear-gradient(90deg,#ef4444,#dc2626)' }} />
      <div className="confirm-body">
        <div className="confirm-icon-wrap" style={{ background: 'rgba(239,68,68,0.12)' }}>
          <Trash2 size={20} color="#ef4444" />
        </div>
        <div className="confirm-texts">
          <div className="confirm-title">Delete this lead?</div>
          <div className="confirm-desc">
            <strong>{lead?.name}</strong> and all its notes will be moved to the Recycle Bin. You can restore it later.
          </div>
        </div>
      </div>

      {/* ⚠️ Assigned employee warning */}
      {lead?.assignedTo && (
        <div className="confirm-warn">
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Assigned to <strong>{lead.assignedTo?.name || 'an employee'}</strong> — they will receive a notification about this removal.</span>
        </div>
      )}

      <div className="confirm-actions">
        <button className="confirm-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="confirm-btn-action confirm-btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
          {loading ? 'Deleting…' : 'Yes, Delete'}
        </button>
      </div>
    </div>
  </div>
);



// ── Pipeline status tabs ───────────────────────────────────────────
const StatusTabs = ({ value, onChange, counts }) => (
  <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
    <button onClick={() => onChange('')}
      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: value === '' ? 'var(--primary)' : 'var(--bg-elevated)', color: value === '' ? 'white' : 'var(--text-muted)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
    >All <span style={{ fontSize: 10, opacity: 0.8 }}>({counts.total || 0})</span></button>
    {Object.entries(SC).map(([k, v]) => (
      <button key={k} onClick={() => onChange(k)}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: `1px solid ${value === k ? v.color : 'transparent'}`, cursor: 'pointer', fontSize: 12, fontWeight: 700, background: value === k ? v.bg : 'var(--bg-elevated)', color: value === k ? v.color : 'var(--text-muted)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
      >
        {v.label}
        {counts[k] !== undefined && <span style={{ fontSize: 10, opacity: 0.8 }}>({counts[k]})</span>}
      </button>
    ))}
  </div>
);

// ── Main Component ─────────────────────────────────────────────────
export default function BALeads() {
  const { slug } = useParams();

  const [leads, setLeads]           = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [overview, setOverview]     = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]       = useState(true);

  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [page, setPage]                   = useState(1);

  const [selected, setSelected]     = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null); // full lead object
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [addOpen, setAddOpen]       = useState(false);
  const [lastBatchId, setLastBatchId] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search)         params.search     = search;
      if (filterStatus)   params.status     = filterStatus;
      if (filterEmployee) params.assignedTo = filterEmployee;
      const res = await baAPI.getLeads(slug, params);
      setLeads(res.data.data);
      setPagination(res.data.pagination);
      setSelected(new Set());
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [slug, page, search, filterStatus, filterEmployee]);

  const fetchOverview = useCallback(() => {
    baAPI.getLeadOverview(slug).then(r => setOverview(r.data.data)).catch(() => {});
  }, [slug]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { fetchOverview(); }, [fetchOverview]);
  useEffect(() => {
    baAPI.getEmployees(slug).then(r => setEmployees(r.data.data || [])).catch(() => {});
  }, [slug]);

  // ── Selection ──────────────────────────────────────────────────
  const toggleAll = () => selected.size === leads.length ? setSelected(new Set()) : setSelected(new Set(leads.map(l => l._id)));
  const toggleOne = (id) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };
  const allSelected  = leads.length > 0 && selected.size === leads.length;
  const someSelected = selected.size > 0;

  // ── Delete ─────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await baAPI.deleteLead(slug, deleteTarget._id); // deleteTarget is full lead object
      toast.success('Lead deleted');
      setDeleteTarget(null);
      fetchLeads(); fetchOverview();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Export ─────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const params = {};
      if (filterStatus)   params.status     = filterStatus;
      if (filterEmployee) params.assignedTo = filterEmployee;
      const res = await baAPI.exportLeads(slug, params);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `leads_${Date.now()}.xlsx`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Leads exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  // Build status counts from overview
  const statusCounts = {};
  if (overview?.byStatus && typeof overview.byStatus === 'object') {
    // byStatus is an object like {new: 5, contacted: 3, ...}
    Object.assign(statusCounts, overview.byStatus);
  }
  statusCounts.total = pagination.total;

  return (
    <div className="page-content">

      {/* ── Header ────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Leads</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>{pagination.total} total leads</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text)' }}>
            <Download size={14} /> Export
          </button>
          <button onClick={() => setImportOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text)' }}>
            <Upload size={14} /> Import Excel
          </button>
          <button onClick={() => setAddOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),#6366f1)', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: 'white' }}>
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* ── Stats Bar ─────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <MiniStat icon={ClipboardList} label="Total Leads"    value={overview?.total}          color="#818cf8" />
        <MiniStat icon={UserRound}     label="Assigned"       value={overview?.assigned}       color="#34d399" />
        <MiniStat icon={UserMinus}     label="Unassigned"     value={overview?.unassigned}     color="#fbbf24" />
        <MiniStat icon={Trophy}        label="Won"            value={overview?.byStatus?.closed_won} color="#a855f7" />
        <MiniStat icon={TrendingUp}    label="New"            value={overview?.byStatus?.new}  color="#06b6d4" />
      </div>

      {/* ── Filters ───────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 16 }}>
        {/* Row 1: Search + Employee filter + actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search name, phone, email…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box', height: 38 }}
            />
          </div>

          <select className="form-input" value={filterEmployee}
            onChange={e => { setFilterEmployee(e.target.value); setPage(1); }}
            style={{ width: 170, height: 38 }}
          >
            <option value="">All Employees</option>
            <option value="unassigned">Unassigned</option>
            {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>

          <button onClick={fetchLeads} title="Refresh"
            style={{ width: 38, height: 38, borderRadius: 10, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}
          ><RefreshCw size={14} /></button>

          {someSelected && (
            <button onClick={() => setAssignOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', height: 38, borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),#6366f1)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'white', marginLeft: 'auto', flexShrink: 0 }}
            >
              <UserPlus size={14} /> Assign ({selected.size})
            </button>
          )}
        </div>

        {/* Row 2: Status pipeline tabs */}
        <StatusTabs value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(1); }} counts={statusCounts} />
      </div>

      {/* ── Table ─────────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '11px 14px', textAlign: 'left', width: 40 }}>
                  <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                    {allSelected ? <CheckSquare size={15} color="var(--primary)" /> : <Square size={15} />}
                  </button>
                </th>
                <th style={{ padding: '11px 0', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', width: 36 }}>#</th>
                <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Lead</th>
                <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Contact</th>
                <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Source</th>
                <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Priority</th>
                <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Assigned</th>
                <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Added</th>
                <th style={{ padding: '11px 14px', width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', display: 'inline', marginBottom: 8 }} />
                  <div style={{ marginTop: 8, fontSize: 13 }}>Loading leads…</div>
                </td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={10}>
                  <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 44, marginBottom: 14 }}>📋</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No leads found</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                      {search || filterStatus || filterEmployee ? 'Try clearing filters.' : 'Import an Excel file or add leads manually.'}
                    </div>
                    {!search && !filterStatus && (
                      <button onClick={() => setImportOpen(true)} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),#6366f1)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'white' }}>
                        <Upload size={13} style={{ display: 'inline', marginRight: 6 }} />Import Excel
                      </button>
                    )}
                  </div>
                </td></tr>
              ) : leads.map((lead, idx) => {
                const isChecked = selected.has(lead._id);
                const rowNum = (pagination.page - 1) * 20 + idx + 1;
                const pCfg = PRIORITY_CFG[lead.priority] || PRIORITY_CFG.medium;
                return (
                  <tr key={lead._id} style={{ borderBottom: '1px solid var(--border)', background: isChecked ? 'rgba(99,102,241,0.05)' : 'transparent', transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={e => { if (!isChecked) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={() => toggleOne(lead._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                        {isChecked ? <CheckSquare size={15} color="var(--primary)" /> : <Square size={15} color="var(--text-muted)" />}
                      </button>
                    </td>
                    <td style={{ padding: '10px 4px', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>{rowNum}</td>

                    {/* Lead name + avatar */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: getGrad(lead.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: 'white', flexShrink: 0 }}>
                          {lead.name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{lead.name}</div>
                          {lead.email && <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{lead.email}</div>}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{lead.phone || '—'}</td>

                    <td style={{ padding: '10px 14px' }}>
                      {lead.source ? (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          {lead.source}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                    </td>

                    <td style={{ padding: '10px 14px' }}><StatusBadge status={lead.status} /></td>

                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: pCfg.color }}>
                        {pCfg.dot} {pCfg.label}
                      </span>
                    </td>

                    <td style={{ padding: '10px 14px' }}>
                      {lead.assignedTo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: getGrad(lead.assignedTo.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                            {lead.assignedTo.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{lead.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24', background: '#fbbf2412', padding: '2px 8px', borderRadius: 20, border: '1px solid #fbbf2430' }}>Unassigned</span>
                      )}
                    </td>

                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(lead.createdAt)}</div>
                    </td>

                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => { setSelected(new Set([lead._id])); setAssignOpen(true); }}
                          title="Assign" style={{ width: 30, height: 30, borderRadius: 7, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        ><UserPlus size={13} /></button>
                        <button onClick={() => setDeleteTarget(lead)}
                          title="Delete" style={{ width: 30, height: 30, borderRadius: 7, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef444412'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef444430'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        ><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────── */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Page {pagination.page} of {pagination.pages} · {pagination.total} leads
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {/* Page numbers */}
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
                style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: page === 1 ? 0.4 : 1 }}
              ><ChevronLeft size={15} /></button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: page === pagination.pages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: page === pagination.pages ? 0.4 : 1 }}
              ><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────── */}
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)}
        onSuccess={(batchId) => { setLastBatchId(batchId); fetchLeads(); fetchOverview(); }} slug={slug} />
      <AssignModal open={assignOpen} onClose={() => { setAssignOpen(false); setSelected(new Set()); }}
        onSuccess={() => { fetchLeads(); fetchOverview(); }} slug={slug}
        selectedLeadIds={[...selected]} employees={employees} lastBatchId={lastBatchId} />
      <AddLeadModal open={addOpen} onClose={() => setAddOpen(false)}
        onSuccess={() => { fetchLeads(); fetchOverview(); }} slug={slug} />

      {deleteTarget && (
        <ConfirmModal
          lead={deleteTarget}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
