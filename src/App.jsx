import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';

// Auth Pages
import AdminLogin from './pages/auth/AdminLogin';
import BusinessLogin from './pages/auth/BusinessLogin';
import ChangePassword from './pages/auth/ChangePassword';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Super Admin
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SADashboard from './pages/super-admin/Dashboard';
import SABusinesses from './pages/super-admin/Businesses';
import SABusinessDetail from './pages/super-admin/BusinessDetail';
import SAUsers from './pages/super-admin/Users';
import SASessions from './pages/super-admin/Sessions';
import SAAutomation from './pages/super-admin/AutomationTools';
import SAProfile from './pages/super-admin/Profile';
// Business Admin
import BusinessLayout from './layouts/BusinessLayout';
import BADashboard from './pages/business-admin/Dashboard';
import BAEmployees from './pages/business-admin/Employees';
import BALeads from './pages/business-admin/Leads';
import BALeadOverview from './pages/business-admin/LeadOverview';
import BASettings from './pages/business-admin/Settings';
import BARecycleBin from './pages/business-admin/RecycleBin';
import BAReminders from './pages/business-admin/Reminders';
import BAAutomation from './pages/business-admin/AutomationTools';

// Employee

import EmployeeLayout from './layouts/EmployeeLayout';
import EmpDashboard from './pages/employee/Dashboard';
import EmpMyLeads from './pages/employee/MyLeads';
import EmpProfile from './pages/employee/Profile';
import LeadDetail from './pages/employee/LeadDetail';
import EmpReminders from './pages/employee/Reminders';

// ── Protected Route ─────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles, slugParam }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const [minDone, setMinDone] = useState(false);

  // Always show loader for at least 1.2s — prevents flash + lets user see the animation
  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (loading || !minDone) return <LoadingScreen />;

  if (!isAuthenticated) {
    if (slugParam) return <Navigate to={`/${slugParam}/login`} replace />;
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'superAdmin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'businessAdmin') return <Navigate to={`/${user?.business?.slug}/dashboard`} replace />;
    if (user?.role === 'employee') return <Navigate to={`/${user?.business?.slug}/emp/dashboard`} replace />;
  }

  return children;
};

// ── First Login Guard ────────────────────────────
const FirstLoginGuard = ({ children }) => {
  const { user } = useAuth();
  if (user?.isFirstLogin) return <Navigate to="/change-password" replace />;
  return children;
};

// ── App Routes ────────────────────────────────────
const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Auth ── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/:slug/login" element={<BusinessLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/change-password"
        element={<ProtectedRoute><ChangePassword /></ProtectedRoute>}
      />

      {/* ── Super Admin ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['superAdmin']}>
            <FirstLoginGuard><SuperAdminLayout /></FirstLoginGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<SADashboard />} />
        <Route path="businesses" element={<SABusinesses />} />
        <Route path="businesses/:id" element={<SABusinessDetail />} />
        <Route path="users" element={<SAUsers />} />
        <Route path="sessions" element={<SASessions />} />
        <Route path="automation" element={<SAAutomation />} />
        <Route path="profile"    element={<SAProfile />} />
      </Route>

      {/* ── Business Admin ── */}
      <Route
        path="/:slug"
        element={
          <ProtectedRoute
            allowedRoles={['businessAdmin']}
            slugParam={window.location.pathname.split('/')[1]}
          >
            <FirstLoginGuard><BusinessLayout /></FirstLoginGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BADashboard />} />
        <Route path="employees" element={<BAEmployees />} />
        <Route path="leads" element={<BALeads />} />
        <Route path="lead-overview" element={<BALeadOverview />} />
        <Route path="reminders" element={<BAReminders />} />
        <Route path="automation" element={<BAAutomation />} />
        <Route path="recycle-bin" element={<BARecycleBin />} />
        <Route path="settings" element={<BASettings />} />
      </Route>

      {/* ── Employee ── */}
      <Route
        path="/:slug/emp"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <FirstLoginGuard><EmployeeLayout /></FirstLoginGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EmpDashboard />} />
        <Route path="my-leads" element={<EmpMyLeads />} />
        <Route path="my-leads/:id" element={<LeadDetail />} />
        <Route path="reminders" element={<EmpReminders />} />
        <Route path="profile" element={<EmpProfile />} />
      </Route>

      {/* ── Default ── */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

// ── Root App ──────────────────────────────────────────────
const AuroraOrb = () => (
  <div className="aurora-orb" aria-hidden="true" />
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Aurora orb 3 — violet/pink center blob, GPU only */}
        <AuroraOrb />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 14,
              borderRadius: 10,
              boxShadow: 'var(--shadow)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: 'var(--bg-elevated)' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'var(--bg-elevated)' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
