import React from 'react';
import { useAuth, useRole } from '../hooks/useAuth';
import { Redirect } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string | string[];
  requireAuth?: boolean;
  fallback?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRole,
  requireAuth = true,
  fallback = '/login'
}) => {
  const { user, isLoading } = useAuth();
  const { hasRole, hasAnyRole } = useRole();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return <Navigate to={fallback} replace />;
  }

  // Check role requirements
  if (requireRole && user) {
    const hasRequiredRole = Array.isArray(requireRole) 
      ? hasAnyRole(requireRole)
      : hasRole(requireRole);

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Specific role-based route components
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireRole={['platform_admin', 'admin', 'super_admin']}>
    {children}
  </ProtectedRoute>
);

export const FirmUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireRole={['firm_admin', 'paralegal']}>
    {children}
  </ProtectedRoute>
);

export const FirmAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireRole="firm_admin">
    {children}
  </ProtectedRoute>
);

// Tenant-aware route component
interface TenantRouteProps {
  children: React.ReactNode;
  firmId?: number;
}

export const TenantRoute: React.FC<TenantRouteProps> = ({ children, firmId }) => {
  const { user } = useAuth();
  const { isAdmin } = useRole();

  // Admin users can access any tenant
  if (isAdmin) {
    return <>{children}</>;
  }

  // Regular users can only access their own firm
  if (firmId && user?.firmId !== firmId) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};