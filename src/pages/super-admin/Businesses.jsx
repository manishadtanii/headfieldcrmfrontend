import { useState, useEffect } from 'react';
import {
  Plus, Search, Building2, Users, Wifi, ToggleLeft, ToggleRight,
  Trash2, Edit2, X, Loader2, Eye, CheckCircle, XCircle,
  AlertTriangle, ShieldOff,
} from 'lucide-react';
import { adminBusinessAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ── Gradient per business name ────────────────────────────────────
const GRADIENTS = [
  ['#818cf8', '#a78bfa'],
  ['#34d399', '#6ee7b7'],
  ['#f472b6', '#fb7185'],
  ['#fbbf24', '#f59e0b'],
  ['#3b82f6', '#60a5fa'],
  ['#8b5cf6', '#c084fc'],
];
const bizGradient = (name = '') => GRADIENTS[name.charCodeAt(0) % GRADIENTS.length];

// ── Confirmation Modal ────────────────────────────────────────────
const ConfirmModal = ({ type, biz, onConfirm, onCancel, loading }) => {
  const isDelete = type === 'delete';

  const config = isDelete ? {
    icon:        <Trash2 size={28} color="#ef4444" />,
    iconBg:      '#ef444418',
    iconBorder:  '#ef444430',
    title:       'Delete Business',
    accentColor: '#ef4444',
    badge:       '⚠ Permanent Action',
    badgeBg:     '#ef444415',
    badgeColor:  '#ef4444',
    bodyLines: [
      `You are about to permanently delete <strong>${biz?.name}</strong>.`,
      `All associated users will be deactivated and this action <strong>cannot be undone</strong>.`,
    ],
    confirmText:  'Yes, Delete Permanently',
    confirmStyle: { background: '#ef4444', color: 'white', border: 'none' },
  } : {
    icon:        <ShieldOff size={28} color="#f59e0b" />,
    iconBg:      '#f59e0b18',
    iconBorder:  '#f59e0b30',
    title:       biz?.isActive ? 'Deactivate Business' : 'Activate Business',
    accentColor: biz?.isActive ? '#f59e0b' : '#34d399',
    badge:       biz?.isActive ? 'Reversible Action' : 'Restoring Access',
    badgeBg:     biz?.isActive ? '#f59e0b15' : '#34d39915',
    badgeColor:  biz?.isActive ? '#f59e0b' : '#34d399',
    bodyLines:   biz?.isActive
      ? [
          `You are about to <strong>deactivate</strong> <strong>${biz?.name}</strong>.`,
          `The Business Admin and all Employees will lose login access immediately. All data will remain safe.`,
        ]
      : [
          `You are about to <strong>reactivate</strong> <strong>${biz?.name}</strong>.`,
          `Business Admin and Employees will regain login access immediately.`,
        ],
    confirmText:  biz?.isActive ? 'Yes, Deactivate' : 'Yes, Activate',
    confirmStyle: biz?.isActive
      ? { background: '#f59e0b', color: 'white', border: 'none' }
      : { background: '#34d399', color: 'white', border: 'none' },
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: `1px solid var(--border)`,
          borderRadius: 20,
          width: '100%', maxWidth: 420,
          overflow: 'hidden',
          boxShadow: `0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px ${config.accentColor}20`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div style={{ height: 4, background: config.accentColor }} />

        <div style={{ padding: '28px 28px 24px' }}>
          {/* Icon + Badge row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: config.iconBg, border: `1px solid ${config.iconBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {config.icon}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
              background: config.badgeBg, color: config.badgeColor,
              border: `1px solid ${config.badgeColor}30`,
              letterSpacing: '0.03em',
            }}>
              {config.badge}
            </span>
          </div>

          {/* Title */}
          <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.3px' }}>
            {config.title}
          </div>

          {/* Body */}
          <div style={{
            background: 'var(--bg-elevated)', borderRadius: 10, padding: '14px 16px',
            border: '1px solid var(--border)', marginBottom: 20,
          }}>
            {config.bodyLines.map((line, i) => (
              <p key={i} style={{
                fontSize: 13, color: i === 0 ? 'var(--text)' : 'var(--text-muted)',
                lineHeight: 1.6, marginBottom: i < config.bodyLines.length - 1 ? 8 : 0,
              }}
                dangerouslySetInnerHTML={{ __html: line }}
              />
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text)', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                ...config.confirmStyle,
              }}
            >
              {loading
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                : config.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Create/Edit Modal ─────────────────────────────────────────────
const BusinessModal = ({ business, onClose, onSaved }) => {
  const isEdit = !!business;
  const [form, setForm] = useState({
    name:        business?.name        || '',
    slug:        business?.slug        || '',
    description: business?.description || '',
    logo:        business?.logo        || '',
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
          name: form.name, description: form.description, logo: form.logo,
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
            <input className="form-input" placeholder="Headfield Realty"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm(f => ({ ...f, name, slug: isEdit ? f.slug : handleSlug(name) }));
              }} />
          </div>
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">
                Slug * <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(cannot change later)</span>
              </label>
              <input className="form-input" placeholder="headfield"
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
              {loading
                ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                : isEdit ? 'Save Changes' : 'Create Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Business Card ─────────────────────────────────────────────────
const BizCard = ({ biz, onEdit, onToggle, onDelete, onView }) => {
  const [c1, c2] = bizGradient(biz.name);

  return (
    <div
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden',
        transition: 'transform 0.18s, box-shadow 0.18s',
        cursor: 'pointer', display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${c1}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      onClick={() => onView(biz)}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${c1}, ${c2})` }} />

      <div style={{ padding: '20px 20px 16px', flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: 'white',
              boxShadow: `0 4px 14px ${c1}50`,
            }}>
              {biz.logo
                ? <img src={biz.logo} alt="" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }} />
                : biz.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.2px' }}>{biz.name}</div>
              {biz.admin && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Admin: {biz.admin.name}
                </div>
              )}
            </div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, flexShrink: 0,
            background: biz.isActive ? '#34d39918' : '#ef444418',
            color: biz.isActive ? '#34d399' : '#ef4444',
            border: `1px solid ${biz.isActive ? '#34d39930' : '#ef444430'}`,
          }}>
            {biz.isActive ? '● Active' : '○ Inactive'}
          </span>
        </div>

        {biz.description && (
          <p style={{
            fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{biz.description}</p>
        )}

        {/* Stats */}
        <div style={{
          display: 'flex', background: 'var(--bg-elevated)',
          borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 16,
        }}>
          {[
            { icon: Users, label: 'Employees', value: biz.stats?.totalEmployees ?? 0 },
            { icon: Wifi,  label: 'Online',    value: biz.stats?.onlineNow ?? 0, color: biz.stats?.onlineNow > 0 ? '#34d399' : undefined },
          ].map(({ label, value, color }, i) => (
            <div key={label} style={{
              flex: 1, padding: '10px 14px', textAlign: 'center',
              borderRight: i === 0 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: color || 'var(--text)' }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Created {new Date(biz.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Footer actions */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderTop: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
            color: c1, background: `${c1}15`, border: `1px solid ${c1}30`,
            borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
          }}
          onClick={() => onView(biz)}
        >
          <Eye size={12} /> View Details
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => onEdit(biz)}>
            <Edit2 size={13} />
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            title={biz.isActive ? 'Deactivate' : 'Activate'}
            onClick={() => onToggle(biz)}
          >
            {biz.isActive ? <ToggleRight size={16} color="#34d399" /> : <ToggleLeft size={16} />}
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm" title="Delete"
            onClick={() => onDelete(biz)}
            style={{ color: 'var(--danger)' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
export default function SABusinesses() {
  const navigate = useNavigate();
  const [businesses, setBusinesses]     = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  const [modal, setModal]               = useState(null);       // null | 'create' | biz obj (edit)
  const [confirm, setConfirm]           = useState(null);       // { type: 'delete'|'toggle', biz }
  const [confirmLoading, setConfirmLoading] = useState(false);

  const LIMIT = 12;

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      const res = await adminBusinessAPI.getAll(params);
      setBusinesses(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load businesses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBusinesses(); }, [page, search]);

  // ── Confirmed actions ──────────────────────────────────────────
  const handleConfirm = async () => {
    if (!confirm) return;
    setConfirmLoading(true);
    try {
      if (confirm.type === 'toggle') {
        const res = await adminBusinessAPI.toggle(confirm.biz.id);
        toast.success(res.data.message);
      } else {
        await adminBusinessAPI.delete(confirm.biz.id);
        toast.success('Business deleted.');
      }
      fetchBusinesses();
      setConfirm(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const activeCount   = businesses.filter(b => b.isActive).length;
  const inactiveCount = businesses.filter(b => !b.isActive).length;
  const onlineCount   = businesses.reduce((s, b) => s + (b.stats?.onlineNow || 0), 0);

  return (
    <div className="page-content">

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Businesses</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>
            {total} total businesses
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> New Business
        </button>
      </div>

      {/* ── Quick Stats ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: CheckCircle, label: 'Active',       value: activeCount,   color: '#34d399', grad: 'linear-gradient(90deg,#34d399,#6ee7b7)' },
          { icon: XCircle,     label: 'Inactive',     value: inactiveCount, color: '#ef4444', grad: 'linear-gradient(90deg,#ef4444,#f87171)' },
          { icon: Wifi,        label: 'Users Online', value: onlineCount,   color: '#fbbf24', grad: 'linear-gradient(90deg,#fbbf24,#f59e0b)' },
        ].map(({ icon: Icon, label, value, color, grad }) => (
          <div key={label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: grad }} />
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={16} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search Bar ──────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '12px 16px',
      }}>
        <Search size={14} color="var(--text-muted)" />
        <input
          style={{
            background: 'none', border: 'none', outline: 'none',
            fontSize: 14, color: 'var(--text)', flex: 1,
          }}
          placeholder="Search businesses by name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        {search && (
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            onClick={() => { setSearch(''); setPage(1); }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Cards Grid ──────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              height: 220, background: 'var(--bg-card)', borderRadius: 16,
              border: '1px solid var(--border)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 0',
          background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
        }}>
          <Building2 size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: 16 }} />
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No businesses found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
            {search ? `No results for "${search}"` : 'Create your first business to get started.'}
          </p>
          {!search && (
            <button className="btn btn-primary" onClick={() => setModal('create')}>
              <Plus size={14} /> Create Business
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {businesses.map((biz) => (
            <BizCard
              key={biz.id}
              biz={biz}
              onView={(b) => navigate(`/admin/businesses/${b.id}`)}
              onEdit={(b) => setModal(b)}
              onToggle={(b) => setConfirm({ type: 'toggle', biz: b })}
              onDelete={(b) => setConfirm({ type: 'delete', biz: b })}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────── */}
      {total > LIMIT && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 24, padding: '14px 18px',
          background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1}
              onClick={() => setPage(p => p - 1)}>Previous</button>
            <button className="btn btn-secondary btn-sm" disabled={page * LIMIT >= total}
              onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* ── Create/Edit Modal ────────────────────────────────── */}
      {modal && (
        <BusinessModal
          business={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchBusinesses}
        />
      )}

      {/* ── Confirm Modal (Delete / Toggle) ─────────────────── */}
      {confirm && (
        <ConfirmModal
          type={confirm.type}
          biz={confirm.biz}
          loading={confirmLoading}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:0.4 } 50% { opacity:0.15 } }
      `}</style>
    </div>
  );
}
