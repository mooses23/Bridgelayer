import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { ProtectedRoute } from './ProtectedRoute';

interface OnboardingGuardProps {
  children: React.ReactNode;
  /**
   * Optional path to redirect completed users to
   */
  completedRedirectTo?: string;
}

/**
 * Guards onboarding routes to ensure proper flow
 * - Redirects completed users to dashboard
 * - Ensures proper onboarding state
 */
export function OnboardingGuard({ 
  children, 
  completedRedirectTo = '/dashboard' 
}: OnboardingGuardProps) {
  const { user } = useSession();
  const location = useLocation();

  // If user has completed onboarding, redirect to dashboard
  if (user?.firm?.onboarded) {
    return (
      <Navigate 
        to={completedRedirectTo}
        state={{ from: location }}
        replace 
      />
    );
  }

  // Check if user is in proper onboarding state
  const onboardingStep = location.pathname.split('/').pop();
  const currentStep = user?.firm?.onboardingStep || 1;
  const requestedStep = parseInt(onboardingStep || '1');

  // Prevent skipping steps
  if (requestedStep > currentStep) {
    return (
      <Navigate 
        to={`/onboarding/${currentStep}`}
        state={{ 
          error: 'Please complete previous steps first',
          from: location
        }}
        replace 
      />
    );
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
