import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { Spinner } from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Optional custom loading component
   */
  loadingComponent?: React.ReactNode;
  /**
   * Optional custom unauthorized component
   */
  unauthorizedComponent?: React.ReactNode;
  /**
   * Optional path to redirect to when unauthorized
   */
  redirectTo?: string;
}

/**
 * Base protected route component that handles common auth logic
 */
export function ProtectedRoute({ 
  children,
  loadingComponent,
  unauthorizedComponent,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isLoading, error } = useSession();
  const location = useLocation();

  if (isLoading) {
    return loadingComponent || (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold text-red-600">Authentication Error</h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return unauthorizedComponent || (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }}
        replace 
      />
    );
  }

  return <>{children}</>;
}
