import React from 'react';
import { useSession } from '@/contexts/SessionContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAuth = true,
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useSession();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Redirect will be handled by RoleRouter
    return null;
  }

  // If specific role is required, check user role
  if (requiredRole && user) {
    const userRole = user.role;
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

/**
 * Admin-only route protection
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={['admin', 'platform_admin', 'super_admin']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Firm user route protection (admin, paralegal, and firm_user)
 */
export function FirmUserRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={['firm_admin', 'firm_owner', 'paralegal', 'firm_user']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Firm admin only route protection
 */
export function FirmAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={['firm_admin', 'firm_owner']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Client route protection
 */
export function ClientRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="client">
      {children}
    </ProtectedRoute>
  );
}

/**
 * Multi-tenant route protection with firm validation
 */
export function TenantRoute({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  
  return (
    <ProtectedRoute 
      requiredRole={['firm_admin', 'firm_owner', 'paralegal', 'client']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Firm Access Required</h1>
            <p className="text-gray-600">You must be associated with a firm to access this page.</p>
          </div>
        </div>
      }
    >
      {user?.firmId ? children : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Firm Association</h1>
            <p className="text-gray-600">Your account is not associated with any firm.</p>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

/**
 * Public route that doesn't require authentication
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  );
}