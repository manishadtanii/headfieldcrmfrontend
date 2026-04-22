import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { baAPI } from '../../api';

const SOURCES = ['Manual', 'IndiaMart', 'Site Visit', 'Reference', 'Facebook', 'Google', 'Walk-In', 'Other'];

export default function AddLeadModal({ open, onClose, onSuccess, slug }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', alternatePhone: '',
    source: 'Manual', budget: '', requirement: '', location: '',
    priority: 'medium', note: '',
  });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error('Name and phone are required'); return; }
    setLoading(true);
    try {
      await baAPI.createLead(slug, form);
      toast.success('Lead added!');
      setForm({ name: '', phone: '', email: '', alternatePhone: '', source: 'Manual', budget: '', requirement: '', location: '', priority: 'medium', note: '' });
      onSuccess(); onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Lead Manually</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="Rahul Sharma" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="rahul@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Alt Phone</label>
                <input className="form-input" placeholder="Alternate number" value={form.alternatePhone} onChange={e => set('alternatePhone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Source</label>
                <select className="form-input" value={form.source} onChange={e => set('source', e.target.value)}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Budget</label>
                <input className="form-input" placeholder="e.g. 45L, 1.2Cr" value={form.budget} onChange={e => set('budget', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Requirement</label>
                <input className="form-input" placeholder="e.g. 2BHK, Office Space" value={form.requirement} onChange={e => set('requirement', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Location</label>
                <input className="form-input" placeholder="City / Area" value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Initial Note</label>
                <textarea className="form-input" rows={2} placeholder="Any initial notes…" value={form.note} onChange={e => set('note', e.target.value)} style={{ resize: 'none' }} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Plus size={15} /> {loading ? 'Adding…' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
