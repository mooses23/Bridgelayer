import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLocation } from 'wouter';

// Import new sidebar-based admin dashboard
import AdminDashboardWithSidebar from '@/components/admin/AdminDashboardWithSidebar';

export default function ModernAdminLayout() {
  const [location] = useLocation();
  
  // Extract onboarding code from URL parameters if present
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code') || undefined;

  return (
    <ErrorBoundary>
      <AdminDashboardWithSidebar code={code} />
    </ErrorBoundary>
  );
}
