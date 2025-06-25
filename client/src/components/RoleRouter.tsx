import React from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useTenantSafe } from '@/hooks/useTenantSafe';
import { useQuery } from '@tanstack/react-query';

// Protected Route Components
import { AdminRoute, FirmUserRoute, ClientRoute, PublicRoute } from '@/components/ProtectedRoute';

// Public Pages
import LoginPage from '@/pages/Login/Login';
import NotFoundPage from '@/pages/Public/NotFoundPage';

// Admin Pages
import ModernAdminLayout from '@/layouts/ModernAdminLayout';

// Firm Pages
import FirmLayout from '@/layouts/FirmLayout';

// Client Pages
import ClientLayout from '@/layouts/ClientLayout';

// Loading Component
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

export default function RoleRouter() {
  const { user, isLoading } = useSession();
  const { config: tenantConfig, isLoading: tenantLoading, error: tenantError } = useTenantSafe();

  // Check if user's firm is onboarded
  const { data: firmData, isLoading: firmLoading } = useQuery({
    queryKey: ['firm', user?.firmId],
    queryFn: () => 
      fetch('/api/firm', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null),
    enabled: !!user?.firmId && (user?.role === 'firm_admin' || user?.role === 'paralegal'),
    retry: false
  });

  console.log('🎯 RoleRouter state:', { 
    userRole: user?.role, 
    isLoading, 
    tenantLoading, 
    firmLoading,
    tenantError,
    firmData: !!firmData
  });

  if (isLoading || tenantLoading) {
    return <LoadingSpinner />;
  }

  // Show tenant error if tenant detection failed
  if (tenantError) {
    console.error('❌ Tenant error in RoleRouter:', tenantError);
    // Don't block - continue with authentication flow
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Owner users - redirect to owner dashboard
  if (user.role === 'owner') {
    return (
      <ErrorBoundary>
        <AdminRoute>
          <ModernAdminLayout />
        </AdminRoute>
      </ErrorBoundary>
    );
  }

  // Admin users - redirect to admin panel
  if (['platform_admin', 'admin', 'super_admin'].includes(user.role)) {
    return (
      <ErrorBoundary>
        <AdminRoute>
          <ModernAdminLayout />
        </AdminRoute>
      </ErrorBoundary>
    );
  }

  // Client users - redirect to client portal  
  if (user.role === 'client') {
    return (
      <ErrorBoundary>
        <ClientRoute>
          <ClientLayout />
        </ClientRoute>
      </ErrorBoundary>
    );
  }

  // Firm users - check onboarding status with fallbacks
  if (user.role === 'firm_admin' || user.role === 'paralegal' || user.role === 'firm_user') {
    // Show loading while checking firm status
    if (firmLoading) {
      return <LoadingSpinner />;
    }

    // Multiple conditions requiring onboarding:
    // 1. No firm data found (API error/no firm)
    // 2. Firm exists but not onboarded
    // 3. Tenant config shows incomplete onboarding
    const needsOnboarding = !firmData || 
                          !firmData.onboarded || 
                          tenantConfig?.onboardingComplete === false;

    if (needsOnboarding) {
      console.log('🎯 Firm needs onboarding - redirecting to unified admin onboarding');
      // CONSOLIDATED: All onboarding now goes through admin's unified system
      return (
        <ErrorBoundary>
          <FirmUserRoute>
            <ModernAdminLayout />
          </FirmUserRoute>
        </ErrorBoundary>
      );
    }

    // Firm is properly onboarded, show dashboard
    return (
      <ErrorBoundary>
        <FirmUserRoute>
          <FirmLayout />
        </FirmUserRoute>
      </ErrorBoundary>
    );
  }

  // Fallback
  return <NotFoundPage />;
}