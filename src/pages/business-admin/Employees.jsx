import { useState, useEffect } from 'react';
import { Plus, Search, ToggleLeft, ToggleRight, LogOut, KeyRound, X, Loader2, Check, Copy } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { baAPI } from '../../api';
import toast from 'react-hot-toast';

// ── Credentials Box ────────────────────────
const CredentialsBox = ({ creds, onClose }) => (
  <div className="modal-overlay">
    <div className="modal" style={{ maxWidth: 440 }}>
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Check size={20} color="var(--success)" />
          <div className="modal-title" style={{ color: 'var(--success)' }}>
            Employee Created!
          </div>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
        Share these credentials with the employee. Save now — password won't be shown again.
      </p>
      <div className="credentials-box">
        {[
          { key: 'Name', val: creds.name },
          { key: 'Email', val: creds.email },
          { key: 'Temp Password', val: creds.tempPassword },
          { key: 'Login URL', val: creds.loginUrl },
        ].map(({ key, val }) => (
          <div className="credentials-row" key={key}>
            <span className="credentials-key">{key}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="credentials-val font-mono">{val}</span>
              <button className="btn btn-ghost btn-icon" style={{ padding: 4 }}
                onClick={() => { navigator.clipboard.writeText(val); toast.success(`${key} copied!`); }}>
                <Copy size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}
        onClick={onClose}>Done</button>
    </div>
  </div>
);

// ── Create Modal ───────────────────────────
const CreateModal = ({ slug, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Name and email required.');
    setLoading(true);
    try {
      const res = await baAPI.createEmployee(slug, form);
      onCreated(res.data.credentials);
      onClose();
      toast.success('Employee created!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add New Employee</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="Rahul Kumar"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className="form-input" type="email" placeholder="rahul@company.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <div className="form-input" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' }}>
              <span className="badge badge-success">Employee</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fixed role</span>
            </div>
          </div>
          <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────
export default function Employees() {
  const { slug } = useParams();
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (filterActive !== '') params.isActive = filterActive;
      const res = await baAPI.getEmployees(slug, params);
      setEmployees(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [page, search, filterActive, slug]);

  const handleToggle = async (emp) => {
    try {
      const res = await baAPI.toggleEmployee(slug, emp.id);
      toast.success(res.data.message);
      fetchEmployees();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed.');
    }
  };

  const handleForceLogout = async (emp) => {
    if (!confirm(`Force logout ${emp.name}?`)) return;
    try {
      const res = await baAPI.forceLogoutEmployee(slug, emp.id);
      toast.success(res.data.message);
      fetchEmployees();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed.');
    }
  };

  const handleResetPW = async (emp) => {
    if (!confirm(`Reset password for ${emp.name}?`)) return;
    try {
      const res = await baAPI.resetEmployeePassword(slug, emp.id);
      setCredentials(res.data.credentials);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed.');
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Employees</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>{total} total employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="table-wrapper">
        {/* Filters */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input className="form-input" placeholder="Search by name or email..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-select" style={{ width: 150 }}
            value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Status</th>
              <th>Online</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                Loading...
              </td></tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
                    <h3>No employees yet</h3>
                    <p>Add your first employee to get started.</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }}
                      onClick={() => setShowCreate(true)}>
                      <Plus size={16} /> Add Employee
                    </button>
                  </div>
                </td>
              </tr>
            ) : employees.map(emp => (
              <tr key={emp.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14, color: 'var(--success)', flexShrink: 0
                    }}>
                      {emp.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.email}</div>
                      {emp.isFirstLogin && (
                        <span className="badge badge-warning" style={{ fontSize: 10, marginTop: 2 }}>
                          First Login Pending
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${emp.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {emp.isOnline ? (
                    <span className="badge badge-success" style={{ fontSize: 11 }}>
                      <span className="online-dot" /> Online
                    </span>
                  ) : (
                    <span className="offline-dot" />
                  )}
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {emp.lastLogin
                    ? new Date(emp.lastLogin).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short',
                        hour: '2-digit', minute: '2-digit'
                      })
                    : 'Never'}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-icon btn-sm"
                      title={emp.isActive ? 'Deactivate' : 'Activate'}
                      onClick={() => handleToggle(emp)}>
                      {emp.isActive
                        ? <ToggleRight size={16} color="var(--success)" />
                        : <ToggleLeft size={16} />}
                    </button>
                    {emp.isOnline && (
                      <button className="btn btn-ghost btn-icon btn-sm"
                        title="Force Logout"
                        onClick={() => handleForceLogout(emp)}
                        style={{ color: 'var(--warning)' }}>
                        <LogOut size={14} />
                      </button>
                    )}
                    <button className="btn btn-ghost btn-icon btn-sm"
                      title="Reset Password"
                      onClick={() => handleResetPW(emp)}
                      style={{ color: 'var(--info)' }}>
                      <KeyRound size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {total > 15 && (
          <div className="flex-between" style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" disabled={page === 1}
                onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn btn-secondary btn-sm" disabled={page * 15 >= total}
                onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          slug={slug}
          onClose={() => setShowCreate(false)}
          onCreated={(creds) => { setCredentials(creds); fetchEmployees(); }}
        />
      )}

      {credentials && (
        <CredentialsBox creds={credentials} onClose={() => setCredentials(null)} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
