import { useState, useEffect } from 'react';
import { Plus, Search, X, Loader2, ToggleLeft, ToggleRight, LogOut, KeyRound, Copy, Check, Eye } from 'lucide-react';
import { adminUserAPI, adminBusinessAPI } from '../../api';
import toast from 'react-hot-toast';

// ── Credentials Display Box ────────────────
const CredentialsBox = ({ creds, onClose }) => (
  <div className="modal-overlay">
    <div className="modal" style={{ maxWidth: 460 }}>
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Check size={20} color="var(--success)" />
          <div className="modal-title" style={{ color: 'var(--success)' }}>User Created!</div>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 13 }}>
        Share these credentials with the user. Save them now — password won't be shown again.
      </p>

      <div className="credentials-box">
        {[
          { key: 'Name', val: creds.name },
          { key: 'Email', val: creds.email },
          { key: 'Temp Password', val: creds.tempPassword },
          { key: 'Login URL', val: creds.loginUrl },
          { key: 'Role', val: creds.role },
        ].map(({ key, val }) => (
          <div className="credentials-row" key={key}>
            <span className="credentials-key">{key}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="credentials-val font-mono">{val}</span>
              <button
                className="btn btn-ghost btn-icon" style={{ padding: 4 }}
                onClick={() => { navigator.clipboard.writeText(val); toast.success(`${key} copied!`); }}
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}
        onClick={onClose}>
        Done
      </button>
    </div>
  </div>
);

// ── Password Reveal Cell ──────────────────────
const PasswordCell = ({ password }) => {
  const [show, setShow] = useState(false);
  if (!password) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: 1 }}>
        {show ? password : '••••••••'}
      </span>
      <button
        className="btn btn-ghost btn-icon" style={{ padding: 3 }}
        title={show ? 'Hide' : 'Show'}
        onClick={() => setShow(s => !s)}
      >
        <Eye size={12} />
      </button>
      <button
        className="btn btn-ghost btn-icon" style={{ padding: 3 }}
        title="Copy password"
        onClick={() => { navigator.clipboard.writeText(password); toast.success('Password copied!'); }}
      >
        <Copy size={12} />
      </button>
    </div>
  );
};

// ── Create User Modal ──────────────────────
const CreateUserModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '', role: 'businessAdmin', businessId: '' });
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminBusinessAPI.getAll({ limit: 100, isActive: 'true' }).then(res => {
      setBusinesses(res.data.data);
      if (res.data.data.length > 0) setForm(f => ({ ...f, businessId: res.data.data[0].id }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.businessId) return toast.error('All fields required.');
    setLoading(true);
    try {
      const res = await adminUserAPI.create(form);
      onCreated(res.data.credentials);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Create New User</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="John Doe"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" placeholder="john@company.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-light)', cursor: 'default' }}>
                <span className="badge badge-primary">Business Admin</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Business Admin creates employees</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Business *</label>
              <select className="form-select" value={form.businessId}
                onChange={e => setForm(f => ({ ...f, businessId: e.target.value }))}>
                <option value="">Select business</option>
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────
export default function SAUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (filterRole) params.role = filterRole;
      if (filterActive !== '') params.isActive = filterActive;
      const res = await adminUserAPI.getAll(params);
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search, filterRole, filterActive]);

  const handleToggle = async (user) => {
    try {
      const res = await adminUserAPI.toggle(user._id);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed.');
    }
  };

  const handleForceLogout = async (user) => {
    if (!confirm(`Force logout ${user.name}?`)) return;
    try {
      const res = await adminUserAPI.forceLogout(user._id);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed.');
    }
  };

  const handleResetPW = async (user) => {
    if (!confirm(`Reset password for ${user.name}? A new temp password will be generated.`)) return;
    try {
      const res = await adminUserAPI.resetPassword(user._id);
      toast.success('Password reset!');
      setCredentials(res.data.credentials);
      fetchUsers(); // refresh to show new tempPassword
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed.');
    }
  };

  const roleColors = {
    businessAdmin: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', label: 'Biz Admin' },
    employee: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Employee' },
  };

  return (
    <div className="page-content">
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Users</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>{total} total users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New User
        </button>
      </div>

      <div className="table-wrapper">
        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input className="form-input" placeholder="Search by name or email..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-select" style={{ width: 150 }}
            value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="businessAdmin">Biz Admin</option>
          </select>
          <select className="form-select" style={{ width: 140 }}
            value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Business</th>
              <th>Password</th>
              <th>Status</th>
              <th>Online</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <h3>No users found</h3>
                    <p>Create your first user to get started.</p>
                  </div>
                </td>
              </tr>
            ) : users.map(user => {
              const rc = roleColors[user.role] || {};
              return (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'var(--bg-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 13, color: 'var(--primary-light)', flexShrink: 0
                      }}>{user.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: rc.bg, color: rc.color }}>
                      {rc.label}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {user.business ? (
                      <>
                        <div style={{ fontWeight: 500 }}>{user.business.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/{user.business.slug}</div>
                      </>
                    ) : '—'}
                  </td>

                  {/* Password cell */}
                  <td>
                    <PasswordCell password={user.tempPassword} />
                  </td>

                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {user.isOnline ? (
                      <span className="badge badge-success" style={{ fontSize: 11 }}>
                        <span className="online-dot" /> Online
                      </span>
                    ) : (
                      <span className="offline-dot" style={{ marginLeft: 4 }} />
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : 'Never'}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-icon btn-sm" title={user.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggle(user)}>
                        {user.isActive ? <ToggleRight size={16} color="var(--success)" /> : <ToggleLeft size={16} />}
                      </button>
                      {user.isOnline && (
                        <button className="btn btn-ghost btn-icon btn-sm" title="Force Logout"
                          onClick={() => handleForceLogout(user)}
                          style={{ color: 'var(--warning)' }}>
                          <LogOut size={14} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-icon btn-sm" title="Reset Password"
                        onClick={() => handleResetPW(user)}
                        style={{ color: 'var(--info)' }}>
                        <KeyRound size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {total > 15 && (
          <div className="flex-between" style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn btn-secondary btn-sm" disabled={page * 15 >= total} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(creds) => { setCredentials(creds); fetchUsers(); }}
        />
      )}

      {credentials && (
        <CredentialsBox creds={credentials} onClose={() => setCredentials(null)} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
