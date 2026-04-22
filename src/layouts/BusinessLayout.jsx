import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, BarChart2, Settings, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { baAPI } from '../api';
import NotificationBell from '../components/NotificationBell';

export default function BusinessLayout() {
  const { user, logout } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();

  const navItems = [
    { to: `/${slug}/dashboard`,     icon: LayoutDashboard, label: 'Dashboard'     },
    { to: `/${slug}/employees`,     icon: Users,           label: 'Employees'     },
    { to: `/${slug}/leads`,         icon: ClipboardList,   label: 'Leads'         },
    { to: `/${slug}/lead-overview`, icon: BarChart2,       label: 'Lead Overview' },
    { to: `/${slug}/settings`,      icon: Settings,        label: 'Settings'      },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(`/${slug}/login`);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo / Business Name */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'var(--success)' }}>
            <Building2 size={18} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">{user?.business?.name || slug}</div>
            <div className="sidebar-logo-sub">Business Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar" style={{ background: 'var(--success)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">/{slug}</div>
            </div>
            <button
              className="btn btn-ghost btn-icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Top bar with bell */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          padding: '12px 24px 0',
        }}>
          <NotificationBell apiObj={baAPI} />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
