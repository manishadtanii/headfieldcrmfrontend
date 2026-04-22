import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, ClipboardList, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { baAPI } from '../../api';

const STATUS_COLOR = {
  new: 'var(--primary)', contacted: 'var(--warning)', interested: '#06b6d4',
  negotiation: '#a855f7', closed_won: 'var(--success)', closed_lost: 'var(--danger)', on_hold: 'var(--text-muted)',
};

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${color}20` }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

export default function LeadOverview() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    baAPI.getLeadOverview(slug)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load overview'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [slug]);

  const d = data || {};
  const statusMap = d.byStatus || {};
  const employees = d.employees || [];

  return (
    <div className="page-content">
      {/* Header */}
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Lead Overview</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Performance breakdown by employee</p>
        </div>
        <button className="btn btn-ghost" onClick={fetchData} disabled={loading}>
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-4 mb-6">
        <StatCard icon={ClipboardList} label="Total Leads"    value={d.total}      color="var(--primary)" />
        <StatCard icon={Users}         label="Assigned"        value={d.assigned}   color="var(--success)" sub={d.total ? `${Math.round((d.assigned/d.total)*100)}% coverage` : ''} />
        <StatCard icon={AlertCircle}   label="Unassigned"      value={d.unassigned} color="var(--warning)" />
        <StatCard icon={TrendingUp}    label="Won"             value={statusMap.closed_won || 0} color="var(--success)" />
      </div>

      {/* Status breakdown */}
      <div className="card mb-6">
        <div className="card-header"><div className="card-title">Leads by Status</div></div>
        <div style={{ padding: '10px 20px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries(STATUS_COLOR).map(([key, color]) => {
            const count = statusMap[key] || 0;
            const pct   = d.total ? Math.round((count / d.total) * 100) : 0;
            return (
              <div key={key} style={{ flex: '1 1 130px', background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 16px', borderLeft: `3px solid ${color}` }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 2 }}>
                  {key.replace('_', ' ')}
                </div>
                <div style={{ fontSize: 11, color, marginTop: 4 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Employee breakdown table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Employee Performance</div>
          <div className="card-subtitle">{employees.length} employees</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
          ) : employees.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <p>No assigned leads yet. Import and assign leads first.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'right' }}>New</th>
                  <th style={{ textAlign: 'right' }}>Contacted</th>
                  <th style={{ textAlign: 'right' }}>Interested</th>
                  <th style={{ textAlign: 'right' }}>Negotiation</th>
                  <th style={{ textAlign: 'right' }}>Won ✓</th>
                  <th style={{ textAlign: 'right' }}>Lost ✗</th>
                  <th style={{ textAlign: 'right' }}>On Hold</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const wonPct = emp.total ? Math.round((emp.won / emp.total) * 100) : 0;
                  return (
                    <tr key={emp.employeeId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                            {emp.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{emp.total}</td>
                      <td style={{ textAlign: 'right', color: STATUS_COLOR.new }}>{emp.new}</td>
                      <td style={{ textAlign: 'right', color: STATUS_COLOR.contacted }}>{emp.contacted}</td>
                      <td style={{ textAlign: 'right', color: STATUS_COLOR.interested }}>{emp.interested}</td>
                      <td style={{ textAlign: 'right', color: STATUS_COLOR.negotiation }}>{emp.negotiation}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{emp.won}</td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{emp.lost}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{emp.on_hold}</td>
                      <td style={{ width: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--bg-elevated)', borderRadius: 9 }}>
                            <div style={{ width: `${wonPct}%`, height: '100%', background: 'var(--success)', borderRadius: 9, transition: 'width .4s' }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--success)', minWidth: 28 }}>{wonPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
