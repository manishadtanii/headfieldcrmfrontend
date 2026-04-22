import { useState } from 'react';
import { X, UserPlus, List, Sliders, Shuffle } from 'lucide-react';
import toast from 'react-hot-toast';
import { baAPI } from '../../api';

const TABS = [
  { id: 'selected', label: 'Selected Leads', icon: List },
  { id: 'range',    label: 'Row Range',       icon: Sliders },
  { id: 'auto',     label: 'Auto Distribute', icon: Shuffle },
];

export default function AssignModal({ open, onClose, onSuccess, slug, selectedLeadIds, employees, lastBatchId }) {
  const [tab, setTab]               = useState('selected');
  const [employeeId, setEmployeeId] = useState('');
  const [fromRow, setFromRow]       = useState('');
  const [toRow, setToRow]           = useState('');
  const [empIds, setEmpIds]         = useState([]);
  const [loading, setLoading]       = useState(false);

  if (!open) return null;

  const activeEmployees = employees.filter(e => e.isActive !== false);

  const toggleEmpId = (id) => {
    setEmpIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      if (tab === 'selected') {
        if (!employeeId) { toast.error('Select an employee'); setLoading(false); return; }
        if (selectedLeadIds.length === 0) { toast.error('No leads selected'); setLoading(false); return; }
        await baAPI.bulkAssign(slug, { leadIds: selectedLeadIds, employeeId });
        toast.success(`${selectedLeadIds.length} leads assigned!`);
      } else if (tab === 'range') {
        if (!employeeId) { toast.error('Select an employee'); setLoading(false); return; }
        if (!fromRow || !toRow) { toast.error('Enter row range'); setLoading(false); return; }
        await baAPI.bulkAssign(slug, {
          fromRow: Number(fromRow), toRow: Number(toRow),
          employeeId, batchId: lastBatchId || undefined,
        });
        toast.success(`Rows ${fromRow}–${toRow} assigned!`);
      } else {
        if (empIds.length === 0) { toast.error('Select at least one employee'); setLoading(false); return; }
        await baAPI.bulkAssign(slug, { assignAll: true, employeeIds: empIds });
        toast.success('Leads distributed!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">Assign Leads</div>
            <div className="modal-subtitle">Choose how to assign</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: '10px 14px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                border: 'none', background: 'none', cursor: 'pointer',
                color: tab === id ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: tab === id ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {/* ── Tab: Selected Leads ─────────────────────────────── */}
          {tab === 'selected' && (
            <div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
                <strong>{selectedLeadIds.length}</strong> lead{selectedLeadIds.length !== 1 ? 's' : ''} selected
              </div>
              <div className="form-group">
                <label className="form-label">Assign to Employee *</label>
                <select className="form-input" value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
                  <option value="">Select employee…</option>
                  {activeEmployees.map(e => (
                    <option key={e._id} value={e._id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── Tab: Row Range ──────────────────────────────────── */}
          {tab === 'range' && (
            <div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                Assign leads by their row number from the Excel import.
                {lastBatchId && <div style={{ marginTop: 4 }}>Using latest import batch.</div>}
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">From Row *</label>
                  <input className="form-input" type="number" min={1} placeholder="1" value={fromRow} onChange={e => setFromRow(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">To Row *</label>
                  <input className="form-input" type="number" min={1} placeholder="50" value={toRow} onChange={e => setToRow(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign to Employee *</label>
                <select className="form-input" value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
                  <option value="">Select employee…</option>
                  {activeEmployees.map(e => (
                    <option key={e._id} value={e._id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── Tab: Auto Distribute ────────────────────────────── */}
          {tab === 'auto' && (
            <div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                All <strong style={{ color: 'var(--text)' }}>unassigned</strong> leads will be distributed evenly (round-robin) among selected employees.
              </div>
              <div className="form-label" style={{ marginBottom: 10 }}>Select Employees *</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeEmployees.map(e => (
                  <label key={e._id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', borderRadius: 8, border: `1px solid ${empIds.includes(e._id) ? 'var(--primary)' : 'var(--border)'}`, background: empIds.includes(e._id) ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
                    <input type="checkbox" checked={empIds.includes(e._id)} onChange={() => toggleEmpId(e._id)} />
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                      {e.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{e.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAssign} disabled={loading}>
            <UserPlus size={15} />
            {loading ? 'Assigning…' : 'Assign Leads'}
          </button>
        </div>
      </div>
    </div>
  );
}
