import React from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery } from '@tanstack/react-query';

// Protected Route Components
import { AdminRoute, FirmUserRoute, ClientRoute, PublicRoute } from '@/components/ProtectedRoute';

// Public Pages
import LoginPage from '@/pages/Public/LoginPage';
import NotFoundPage from '@/pages/Public/NotFoundPage';

// Admin Pages
import AdminLayout from '@/layouts/AdminLayout';

// Firm Pages
import FirmDashboardLayout from '@/layouts/FirmDashboardLayout';
import OnboardingPage from '@/pages/Onboarding';

// Client Pages
import ClientLayout from '@/layouts/ClientLayout';

// Loading Component
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RoleRouter() {
  const { user, isLoading } = useSession();
  const { config: tenantConfig, isLoading: tenantLoading } = useTenant();

  // Check if user's firm is onboarded
  const { data: firmData, isLoading: firmLoading } = useQuery({
    queryKey: ['firm', user?.firmId],
    queryFn: () => 
      fetch('/api/firm', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null),
    enabled: !!user?.firmId && (user?.role === 'firm_admin' || user?.role === 'paralegal'),
    retry: false
  });

  if (isLoading || tenantLoading) {
    return <LoadingSpinner />;
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Admin users - redirect to admin panel
  if (['platform_admin', 'admin', 'super_admin'].includes(user.role)) {
    return (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    );
  }

  // Client users - redirect to client portal  
  if (user.role === 'client') {
    return (
      <ClientRoute>
        <ClientLayout />
      </ClientRoute>
    );
  }

  // Firm users - check onboarding status with fallbacks
  if (user.role === 'firm_admin' || user.role === 'paralegal') {
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
      console.log('🎯 Firm needs onboarding - showing onboarding flow');
      return (
        <FirmUserRoute>
          <OnboardingPage />
        </FirmUserRoute>
      );
    }

    // Firm is properly onboarded, show dashboard
    return (
      <FirmUserRoute>
        <FirmDashboardLayout />
      </FirmUserRoute>
    );
  }

  // Fallback
  return <NotFoundPage />;
}