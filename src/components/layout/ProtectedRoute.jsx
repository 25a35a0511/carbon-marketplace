import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps a route and redirects unauthenticated users to /login.
 * Optionally restricts to specific roles.
 *
 * Usage:
 *   <ProtectedRoute roles={['admin']}>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🌿</div>
          <p style={{ fontFamily: 'sans-serif', color: '#6b7280' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to their home dashboard
    const dashMap = { buyer: '/dashboard', seller: '/seller', admin: '/admin' };
    return <Navigate to={dashMap[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
