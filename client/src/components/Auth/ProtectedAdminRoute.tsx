import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { ProtectedRoute } from './ProtectedRoute';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  /**
   * Optional path to redirect unauthorized users to
   */
  redirectTo?: string;
}

/**
 * Route guard specifically for admin-only routes
 * Ensures the user has admin privileges before rendering children
 */
export function ProtectedAdminRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedAdminRouteProps) {
  const { isAdmin } = useSession();
  const location = useLocation();

  return (
    <ProtectedRoute
      redirectTo={redirectTo}
      unauthorizedComponent={
        isAdmin === false ? (
          <Navigate 
            to="/dashboard" 
            state={{ 
              error: 'Admin access required',
              from: location
            }}
            replace 
          />
        ) : undefined
      }
    >
      {children}
    </ProtectedRoute>
  );
}
