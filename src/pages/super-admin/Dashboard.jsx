import { useState, useEffect } from 'react';
import { Building2, Users, Activity, Wifi, TrendingUp, LogIn } from 'lucide-react';
import { adminAnalyticsAPI } from '../../api';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${color}20` }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-change">{sub}</div>}
    </div>
  </div>
);

export default function SADashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminAnalyticsAPI.getStats();
      setStats(res.data.data);
    } catch {
      toast.error('Failed to load stats.');
    } finally {
      setLoading(false);
    }
  };

  const ov = stats?.overview;

  return (
    <div className="page-content">
      {/* Header */}
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Platform Overview</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Welcome back, Super Admin</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchStats}>
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stat-card" style={{ minHeight: 90, opacity: 0.4 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-4 mb-6">
          <StatCard icon={Building2} label="Total Businesses" value={ov?.totalBusinesses}
            color="var(--primary)" sub={`${ov?.activeBusinesses} active`} />
          <StatCard icon={Users} label="Total Users" value={ov?.totalUsers}
            color="var(--success)" sub={`${ov?.activeUsers} active`} />
          <StatCard icon={Wifi} label="Online Now" value={ov?.onlineNow}
            color="var(--warning)" sub="Live sessions" />
          <StatCard icon={Activity} label="Active Businesses" value={ov?.activeBusinesses}
            color="var(--info)" />
        </div>
      )}

      {/* Business Breakdown + Recent Logins */}
      <div className="grid grid-2">
        {/* Business Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Business Breakdown</div>
              <div className="card-subtitle">Users per business</div>
            </div>
          </div>
          <div>
            {loading ? (
              <div style={{ padding: '20px 0', color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</div>
            ) : stats?.businessBreakdown?.length === 0 ? (
              <div className="empty-state">
                <Building2 size={32} />
                <p>No businesses yet</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Total Users</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.businessBreakdown?.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.businessName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>/{b.businessSlug}</div>
                      </td>
                      <td>{b.total}</td>
                      <td>
                        <span className="badge badge-success">{b.active} active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Logins */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Logins</div>
              <div className="card-subtitle">Last 20 sessions</div>
            </div>
          </div>
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '20px 0', color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</div>
            ) : stats?.recentLogins?.length === 0 ? (
              <div className="empty-state"><p>No sessions yet</p></div>
            ) : (
              stats?.recentLogins?.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: '1px solid var(--border)'
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                    color: 'var(--primary-light)'
                  }}>
                    {s.userName?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.userName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {s.businessName || 'Super Admin'} · {s.browser} · {s.device}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {s.isOnline ? (
                      <span className="badge badge-success" style={{ fontSize: 11 }}>
                        <span className="online-dot" />Online
                      </span>
                    ) : (
                      <span className="badge badge-muted" style={{ fontSize: 11 }}>Offline</span>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      {new Date(s.loginAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
