import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Activity, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/businesses', icon: Building2, label: 'Businesses' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/sessions', icon: Activity, label: 'Activity Monitor' },
];

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Shield size={18} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">CRM Platform</div>
            <div className="sidebar-logo-sub">Super Admin</div>
          </div>
        </div>

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

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">Super Admin</div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
