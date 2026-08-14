import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  redirectPath?: string;
  requiredRole?: string | string[];
  children?: React.ReactNode;
}

const ProtectedRoute = ({ 
  redirectPath = '/login',
  requiredRole,
  children 
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  // Always show loader while auth check is in progress — never fall through
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with the return URL
  if (!isAuthenticated) {
    return <Navigate 
      to={redirectPath} 
      state={{ from: location.pathname }} 
      replace 
    />;
  }

  // If a role is required, check it (supports single role or array of roles)
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated (and role matches), render the protected content
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;