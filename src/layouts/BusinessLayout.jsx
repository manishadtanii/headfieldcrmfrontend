import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, BarChart2, Code2, LogOut, Trash2, Bell, Zap, PanelLeftClose, PanelLeftOpen, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { baAPI } from '../api';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle from '../components/ThemeToggle';
import PageWrapper from '../components/PageWrapper';
import { useLogo } from '../hooks/useLogo';

export default function BusinessLayout() {
  const { user, logout } = useAuth();
  const { slug }         = useParams();
  const navigate         = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const logo = useLogo();

  const navItems = [
    { to: `/${slug}/dashboard`,     icon: LayoutDashboard, label: 'Dashboard'        },
    { to: `/${slug}/employees`,     icon: Users,           label: 'Employees'        },
    { to: `/${slug}/leads`,         icon: ClipboardList,   label: 'Leads'            },
    { to: `/${slug}/lead-overview`, icon: BarChart2,       label: 'Lead Overview'    },
    { to: `/${slug}/reminders`,     icon: Bell,            label: 'Reminders'        },
    { to: `/${slug}/meetings`,      icon: CalendarDays,    label: 'Meetings'         },
    { to: `/${slug}/automation`,    icon: Zap,             label: 'Automation Tools' },
    { to: `/${slug}/recycle-bin`,   icon: Trash2,          label: 'Recycle Bin'      },
    { to: `/${slug}/settings`,      icon: Code2,           label: 'Dev Zone'         },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(`/${slug}/login`);
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
            <div className="user-avatar" style={{ background: 'var(--success)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {!collapsed && (
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">/{slug}</div>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 24px 0' }}>
          <NotificationBell apiObj={baAPI} />
        </div>
        <PageWrapper><Outlet /></PageWrapper>
      </main>
    </div>
  );
}
