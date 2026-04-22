import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

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
import SAUsers from './pages/super-admin/Users';
import SASessions from './pages/super-admin/Sessions';

// Business Admin
import BusinessLayout from './layouts/BusinessLayout';
import BADashboard from './pages/business-admin/Dashboard';
import BAEmployees from './pages/business-admin/Employees';
import BALeads from './pages/business-admin/Leads';
import BALeadOverview from './pages/business-admin/LeadOverview';

// Employee
import EmployeeLayout from './layouts/EmployeeLayout';
import EmpDashboard from './pages/employee/Dashboard';
import EmpMyLeads from './pages/employee/MyLeads';

// ── Protected Route ─────────────────────────────
const ProtectedRoute = ({ children, allowedRoles, slugParam }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

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
        <Route path="users" element={<SAUsers />} />
        <Route path="sessions" element={<SASessions />} />
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
      </Route>

      {/* ── Default ── */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

// ── Root App ──────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
