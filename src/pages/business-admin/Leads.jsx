import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus, Upload, Download, Search, Filter, RefreshCw,
  CheckSquare, Square, UserPlus, Trash2, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { baAPI } from '../../api';
import ImportModal from '../../components/business/ImportModal';
import AssignModal from '../../components/business/AssignModal';
import AddLeadModal from '../../components/business/AddLeadModal';

// ── Status config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  new:          { label: 'New',         color: 'var(--primary)',  bg: 'rgba(99,102,241,0.12)' },
  contacted:    { label: 'Contacted',   color: 'var(--warning)',  bg: 'rgba(245,158,11,0.12)' },
  interested:   { label: 'Interested',  color: '#06b6d4',         bg: 'rgba(6,182,212,0.12)'  },
  negotiation:  { label: 'Negotiation', color: '#a855f7',         bg: 'rgba(168,85,247,0.12)' },
  closed_won:   { label: 'Won',         color: 'var(--success)',  bg: 'rgba(16,185,129,0.12)' },
  closed_lost:  { label: 'Lost',        color: 'var(--danger)',   bg: 'rgba(239,68,68,0.12)'  },
  on_hold:      { label: 'On Hold',     color: 'var(--text-muted)', bg: 'rgba(100,116,139,0.12)' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      color: cfg.color, background: cfg.bg, whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
};

const PRIORITY_COLOR = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--success)' };

export default function BALeads() {
  const { slug } = useParams();

  // ── Data state ─────────────────────────────────────────────────
  const [leads, setLeads]             = useState([]);
  const [employees, setEmployees]     = useState([]);
  const [pagination, setPagination]   = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]         = useState(true);

  // ── Filter state ───────────────────────────────────────────────
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [page, setPage]               = useState(1);

  // ── Selection state ────────────────────────────────────────────
  const [selected, setSelected]       = useState(new Set());

  // ── Modal state ────────────────────────────────────────────────
  const [importOpen, setImportOpen]   = useState(false);
  const [assignOpen, setAssignOpen]   = useState(false);
  const [addOpen, setAddOpen]         = useState(false);
  const [lastBatchId, setLastBatchId] = useState(null);

  // ── Fetch leads ────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search)         params.search = search;
      if (filterStatus)   params.status = filterStatus;
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

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // ── Fetch employees for filter dropdown ────────────────────────
  useEffect(() => {
    baAPI.getEmployees(slug).then(r => setEmployees(r.data.data || [])).catch(() => {});
  }, [slug]);

  // ── Selection helpers ──────────────────────────────────────────
  const toggleAll = () => {
    if (selected.size === leads.length) setSelected(new Set());
    else setSelected(new Set(leads.map(l => l._id)));
  };
  const toggleOne = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await baAPI.deleteLead(slug, id);
      toast.success('Lead deleted');
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  // ── Export ─────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const params = {};
      if (filterStatus)   params.status = filterStatus;
      if (filterEmployee) params.assignedTo = filterEmployee;
      const res = await baAPI.exportLeads(slug, params);
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement('a');
      a.href = url; a.download = `leads_${Date.now()}.xlsx`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Leads exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  const allSelected = leads.length > 0 && selected.size === leads.length;
  const someSelected = selected.size > 0;

  return (
    <div className="page-content">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Leads</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>
            {pagination.total} total leads
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={handleExport} title="Export Excel">
            <Download size={16} /> Export
          </button>
          <button className="btn btn-secondary" onClick={() => setImportOpen(true)}>
            <Upload size={16} /> Import Excel
          </button>
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="card mb-4" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              placeholder="Search name, phone, email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: 34, height: 36 }}
            />
          </div>

          {/* Status filter */}
          <select
            className="form-input"
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            style={{ width: 150, height: 36 }}
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Employee filter */}
          <select
            className="form-input"
            value={filterEmployee}
            onChange={e => { setFilterEmployee(e.target.value); setPage(1); }}
            style={{ width: 160, height: 36 }}
          >
            <option value="">All Employees</option>
            <option value="unassigned">Unassigned</option>
            {employees.map(e => (
              <option key={e._id} value={e._id}>{e.name}</option>
            ))}
          </select>

          <button className="btn btn-ghost btn-icon" onClick={fetchLeads} title="Refresh">
            <RefreshCw size={15} />
          </button>

          {someSelected && (
            <button className="btn btn-primary" onClick={() => setAssignOpen(true)} style={{ marginLeft: 'auto' }}>
              <UserPlus size={15} /> Assign Selected ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <button className="btn btn-ghost btn-icon" onClick={toggleAll} style={{ padding: 2 }}>
                    {allSelected ? <CheckSquare size={16} color="var(--primary)" /> : <Square size={16} />}
                  </button>
                </th>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Source</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading leads…</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={10}>
                  <div className="empty-state" style={{ padding: '48px 0' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                    <h3>No leads found</h3>
                    <p>Import an Excel file or add leads manually.</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setImportOpen(true)}>
                      <Upload size={15} /> Import Excel
                    </button>
                  </div>
                </td></tr>
              ) : (
                leads.map((lead, idx) => {
                  const isChecked = selected.has(lead._id);
                  const rowNum = (pagination.page - 1) * 20 + idx + 1;
                  return (
                    <tr key={lead._id} style={{ background: isChecked ? 'rgba(99,102,241,0.06)' : '' }}>
                      <td>
                        <button className="btn btn-ghost btn-icon" onClick={() => toggleOne(lead._id)} style={{ padding: 2 }}>
                          {isChecked ? <CheckSquare size={16} color="var(--primary)" /> : <Square size={16} />}
                        </button>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{rowNum}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.name}</div>
                        {lead.email && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.email}</div>}
                      </td>
                      <td style={{ fontSize: 13 }}>{lead.phone}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.source || '—'}</td>
                      <td><StatusBadge status={lead.status} /></td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: PRIORITY_COLOR[lead.priority] }}>
                          {lead.priority}
                        </span>
                      </td>
                      <td>
                        {lead.assignedTo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                              {lead.assignedTo.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: 12 }}>{lead.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-ghost btn-icon"
                            title="Assign"
                            onClick={() => { setSelected(new Set([lead._id])); setAssignOpen(true); }}
                          >
                            <UserPlus size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon"
                            title="Delete"
                            onClick={() => handleDelete(lead._id)}
                            style={{ color: 'var(--danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ────────────────────────────────────────── */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Page {pagination.page} of {pagination.pages} · {pagination.total} leads
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={16} />
              </button>
              <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={(batchId) => { setLastBatchId(batchId); fetchLeads(); }}
        slug={slug}
      />
      <AssignModal
        open={assignOpen}
        onClose={() => { setAssignOpen(false); setSelected(new Set()); }}
        onSuccess={fetchLeads}
        slug={slug}
        selectedLeadIds={[...selected]}
        employees={employees}
        lastBatchId={lastBatchId}
      />
      <AddLeadModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={fetchLeads}
        slug={slug}
      />
    </div>
  );
}
