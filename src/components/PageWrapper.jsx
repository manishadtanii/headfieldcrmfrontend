import { useLocation } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// PageWrapper — subtle fade+slide transition on every route change
// Usage: wrap <Outlet /> with <PageWrapper><Outlet /></PageWrapper>
// CSS: .page-transition in index.css
// ─────────────────────────────────────────────────────────────────────────────

export default function PageWrapper({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
