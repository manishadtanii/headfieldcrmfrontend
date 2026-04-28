import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, User, LogOut, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { empAPI } from '../api';
import NotificationBell from '../components/NotificationBell';
import AlarmPopup from '../components/reminders/AlarmPopup';
import ThemeToggle from '../components/ThemeToggle';
import PageWrapper from '../components/PageWrapper';
import { useLogo } from '../hooks/useLogo';

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const { slug }         = useParams();
  const navigate         = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const logo = useLogo();

  const navItems = [
    { to: `/${slug}/emp/dashboard`, icon: LayoutDashboard, label: 'Dashboard'  },
    { to: `/${slug}/emp/my-leads`,  icon: ClipboardList,   label: 'My Leads'   },
    { to: `/${slug}/emp/reminders`, icon: Bell,            label: 'Reminders'  },
    { to: `/${slug}/emp/profile`,   icon: User,            label: 'My Profile' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(`/${slug}/login`);
  };

  return (
    <div className="app-layout" data-sidebar-collapsed={collapsed ? 'true' : 'false'}>
      <aside className={`sidebar${collapsed ? ' is-collapsed' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" className="sidebar-logo-img" />
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-logo-text">{user?.business?.name || slug}</div>
              <div className="sidebar-logo-sub">Employee Portal</div>
            </div>
          )}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {!collapsed && <div className="nav-section-label">My Workspace</div>}
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
            <div className="user-avatar" style={{ background: 'var(--warning)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {!collapsed && (
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">Employee</div>
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
        <AlarmPopup slug={slug} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 24px 0' }}>
          <NotificationBell apiObj={empAPI} />
        </div>
        <PageWrapper><Outlet /></PageWrapper>
      </main>
    </div>
  );
}
