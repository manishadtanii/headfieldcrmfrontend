import { useState, useEffect } from 'react';
import { Plus, Search, Building2, Users, Wifi, ToggleLeft, ToggleRight, Trash2, Edit2, X, Loader2, Check, Copy, Eye } from 'lucide-react';
import { adminBusinessAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ── Create/Edit Modal ──────────────────────
const BusinessModal = ({ business, onClose, onSaved }) => {
  const isEdit = !!business;
  const [form, setForm] = useState({
    name: business?.name || '',
    slug: business?.slug || '',
    description: business?.description || '',
    logo: business?.logo || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSlug = (val) =>
    val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || (!isEdit && !form.slug))
      return toast.error('Name and slug are required.');
    setLoading(true);
    try {
      if (isEdit) {
        await adminBusinessAPI.update(business.id, {
          name: form.name, description: form.description, logo: form.logo
        });
        toast.success('Business updated!');
      } else {
        await adminBusinessAPI.create(form);
        toast.success('Business created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{isEdit ? 'Edit Business' : 'Create Business'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Business Name *</label>
            <input className="form-input" placeholder="Realter Inc"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm(f => ({
                  ...f, name,
                  slug: isEdit ? f.slug : handleSlug(name)
                }));
              }} />
          </div>

          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Slug * <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(URL — cannot change later)</span></label>
              <input className="form-input" placeholder="realter"
                value={form.slug}
                onChange={(e) => setForm(f => ({ ...f, slug: handleSlug(e.target.value) }))} />
              <div className="form-hint">Login URL: /{form.slug || 'your-slug'}/login</div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Brief description..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">Logo URL <span className="text-muted">(optional)</span></label>
            <input className="form-input" placeholder="https://..."
              value={form.logo}
              onChange={(e) => setForm(f => ({ ...f, logo: e.target.value }))} />
          </div>

          <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : isEdit ? 'Save Changes' : 'Create Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────
export default function SABusinesses() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'create' | business obj

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (filterActive !== '') params.isActive = filterActive;
      const res = await adminBusinessAPI.getAll(params);
      setBusinesses(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load businesses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBusinesses(); }, [page, search, filterActive]);

  const handleToggle = async (biz) => {
    try {
      const res = await adminBusinessAPI.toggle(biz.id);
      toast.success(res.data.message);
      fetchBusinesses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed.');
    }
  };

  const handleDelete = async (biz) => {
    if (!confirm(`Delete "${biz.name}"? This will deactivate all users.`)) return;
    try {
      await adminBusinessAPI.delete(biz.id);
      toast.success('Business deleted.');
      fetchBusinesses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed.');
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Businesses</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>{total} total businesses</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <Plus size={16} /> New Business
        </button>
      </div>

      {/* Table Card */}
      <div className="table-wrapper">
        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input className="form-input" placeholder="Search businesses..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-select" style={{ width: 150 }}
            value={filterActive} onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <table className="table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Slug / Login URL</th>
              <th>Employees</th>
              <th>Online</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
            ) : businesses.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <Building2 size={36} />
                    <h3>No businesses found</h3>
                    <p>Create your first business to get started.</p>
                  </div>
                </td>
              </tr>
            ) : businesses.map((biz) => (
              <tr key={biz.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: 'var(--primary-glow)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: 'var(--primary-light)', fontSize: 14, flexShrink: 0
                    }}>
                      {biz.name[0]}
                    </div>
                    <div>
                      <div
                        style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--primary-light)' }}
                        onClick={() => navigate(`/admin/businesses/${biz.id}`)}
                      >
                        {biz.name}
                      </div>
                      {biz.admin && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin: {biz.admin.name}</div>}
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code style={{ fontSize: 12, color: 'var(--primary-light)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4 }}>
                      /{biz.slug}/login
                    </code>
                    <button className="btn btn-ghost btn-icon" style={{ padding: 4 }}
                      onClick={() => { navigator.clipboard.writeText(`/${biz.slug}/login`); toast.success('Copied!'); }}>
                      <Copy size={12} />
                    </button>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={14} color="var(--text-muted)" />
                    {biz.stats?.totalEmployees || 0}
                  </div>
                </td>
                <td>
                  {biz.stats?.onlineNow > 0 ? (
                    <span className="badge badge-success">
                      <span className="online-dot" />{biz.stats.onlineNow} online
                    </span>
                  ) : (
                    <span className="badge badge-muted">0 online</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${biz.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {biz.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  {new Date(biz.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-icon btn-sm" title="View Details"
                      onClick={() => navigate(`/admin/businesses/${biz.id}`)}
                      style={{ color: '#818cf8' }}>
                      <Eye size={14} />
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" title="Edit"
                      onClick={() => setModal(biz)}>
                      <Edit2 size={14} />
                    </button>
                    <button
                      className={`btn btn-ghost btn-icon btn-sm`}
                      title={biz.isActive ? 'Deactivate' : 'Activate'}
                      onClick={() => handleToggle(biz)}
                    >
                      {biz.isActive ? <ToggleRight size={16} color="var(--success)" /> : <ToggleLeft size={16} />}
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" title="Delete"
                      onClick={() => handleDelete(biz)}
                      style={{ color: 'var(--danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {total > 10 && (
          <div className="flex-between" style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn btn-secondary btn-sm" disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <BusinessModal
          business={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchBusinesses}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
