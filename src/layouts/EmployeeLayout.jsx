import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, User, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();

  const navItems = [
    { to: `/${slug}/emp/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
    { to: `/${slug}/emp/my-leads`, icon: ClipboardList, label: 'My Leads' },
    { to: `/${slug}/emp/profile`, icon: User, label: 'My Profile', disabled: true },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(`/${slug}/login`);
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'var(--warning)' }}>
            <Briefcase size={18} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">{user?.business?.name || slug}</div>
            <div className="sidebar-logo-sub">Employee Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">My Workspace</div>
          {navItems.map(({ to, icon: Icon, label, disabled }) =>
            disabled ? (
              <div
                key={to}
                className="nav-item"
                style={{ opacity: 0.4, cursor: 'not-allowed' }}
                title="Coming soon"
              >
                <Icon size={18} />
                {label}
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>Soon</span>
              </div>
            ) : (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar" style={{ background: 'var(--warning)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">Employee</div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
