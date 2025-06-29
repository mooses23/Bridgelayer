import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';

interface PublicRouteProps {
  children: React.ReactNode;
  /**
   * Optional path to redirect authenticated users to
   */
  authenticatedRedirectTo?: string;
}

/**
 * Route wrapper for public pages (login, signup, etc.)
 * Redirects authenticated users to dashboard
 */
export function PublicRoute({ 
  children, 
  authenticatedRedirectTo = '/dashboard' 
}: PublicRouteProps) {
  const { user, isAdmin } = useSession();
  const location = useLocation();
  const from = location.state?.from?.pathname || authenticatedRedirectTo;

  // If user is authenticated, redirect to appropriate dashboard
  if (user) {
    const redirectTo = isAdmin ? '/admin' : from;
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
