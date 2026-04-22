import { useState, useEffect } from 'react';
import { Users, UserCheck, Wifi, UserX } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { baAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${color}20` }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default function BADashboard() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    baAPI.getOverview(slug)
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load overview.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const stats = data?.stats;
  const logins = data?.recentLogins || [];

  return (
    <div className="page-content">
      {/* Header */}
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>
            {data?.business?.name || 'Dashboard'}
          </h1>
          <p className="text-muted" style={{ marginTop: 4 }}>
            Welcome back, {user?.name}
          </p>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card" style={{ minHeight: 90, opacity: 0.3 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-4 mb-6">
          <StatCard icon={Users} label="Total Employees" value={stats?.totalEmployees} color="var(--primary)" />
          <StatCard icon={UserCheck} label="Active Employees" value={stats?.activeEmployees} color="var(--success)" />
          <StatCard icon={Wifi} label="Online Now" value={stats?.onlineNow} color="var(--warning)" />
          <StatCard icon={UserX} label="Inactive" value={stats?.inactiveEmployees} color="var(--danger)" />
        </div>
      )}

      {/* Coming Soon + Recent Logins */}
      <div className="grid grid-2">
        {/* Leads placeholder */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Lead Pipeline</div>
          </div>
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <h3>Leads Coming Soon</h3>
            <p>Lead management will be available in the next update.</p>
          </div>
        </div>

        {/* Recent employee logins */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Employee Logins</div>
            <div className="card-subtitle">{logins.length} sessions</div>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</div>
            ) : logins.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <p>No employee sessions yet.</p>
              </div>
            ) : (
              logins.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < logins.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13,
                    color: 'var(--success)', flexShrink: 0
                  }}>
                    {s.userName?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.userName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {s.browser} · {s.device}
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
