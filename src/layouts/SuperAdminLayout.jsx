import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Activity, LogOut, Zap, UserCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import PageWrapper from '../components/PageWrapper';
import { useLogo } from '../hooks/useLogo';

const navItems = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard'        },
  { to: '/admin/businesses', icon: Building2,       label: 'Businesses'       },
  { to: '/admin/users',      icon: Users,           label: 'Users'            },
  { to: '/admin/sessions',   icon: Activity,        label: 'Activity Monitor' },
  { to: '/admin/automation', icon: Zap,             label: 'Automation Tools' },
  { to: '/admin/profile',    icon: UserCircle,      label: 'My Profile'       },
];

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const logo = useLogo();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="app-layout" data-sidebar-collapsed={collapsed ? 'true' : 'false'}>
      <aside className={`sidebar${collapsed ? ' is-collapsed' : ''}`}>

        {/* Logo only — no text */}
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" className="sidebar-logo-img" />
          {!collapsed && <div style={{ flex: 1 }} />}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {!collapsed && <div className="nav-section-label">Main Menu</div>}
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            {!collapsed && (
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">Super Admin</div>
              </div>
            )}
            <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
          {!collapsed && <ThemeToggle />}
        </div>
      </aside>

      <main className="main-content">
        <PageWrapper><Outlet /></PageWrapper>
      </main>
    </div>
  );
}
