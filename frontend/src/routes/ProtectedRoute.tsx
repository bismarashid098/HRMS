import { Navigate } from 'react-router';
import { useAuth } from 'context/AuthContext';
import PageLoader from 'components/loading/PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('Admin' | 'Manager')[];
  requiredPermission?: string;
}

const ProtectedRoute = ({ children, allowedRoles, requiredPermission }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  if (requiredPermission && user.role !== 'Admin' && !user.permissions.includes(requiredPermission))
    return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
