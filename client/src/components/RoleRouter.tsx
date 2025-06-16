import React from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useTenant } from '@/contexts/TenantContext';

// Public Pages
import LoginPage from '@/pages/Public/LoginPage';
import NotFoundPage from '@/pages/Public/NotFoundPage';

// Admin Pages
import AdminLayout from '@/layouts/AdminLayout';

// Firm Pages
import FirmDashboardLayout from '@/layouts/FirmDashboardLayout';

// Client Pages
import ClientLayout from '@/layouts/ClientLayout';

// Loading Component
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RoleRouter() {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Admin users - redirect to admin panel
  if (['platform_admin', 'admin', 'super_admin'].includes(user.role)) {
    return <AdminLayout />;
  }

  // Client users - redirect to client portal  
  if (user.role === 'client') {
    return <ClientLayout />;
  }

  // Firm users - show templated dashboard
  if (user.role === 'firm_admin' || user.role === 'paralegal') {
    return <FirmDashboardLayout />;
  }

  // Fallback
  return <NotFoundPage />;
}