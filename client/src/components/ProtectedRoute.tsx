
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { useSession } from '@/contexts/SessionContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireOnboarding = false 
}: ProtectedRouteProps) {
  const { tenantId, config, isLoading: tenantLoading, error } = useTenant();
  const { user, isLoading: sessionLoading } = useSession();

  // Show loading while checking tenant and session
  if (tenantLoading || sessionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle tenant errors
  if (error || (!config && tenantId)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load firm configuration</p>
          <p className="text-gray-600">Please check your URL and try again</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if required but not complete
  if (requireOnboarding && config && !config.onboardingComplete) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}
