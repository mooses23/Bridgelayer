import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { useTenant } from '@/context/TenantContext';

// Public Pages
import LoginPage from '@/pages/Public/LoginPage';
import LogoutPage from '@/pages/Public/LogoutPage';
import NotFoundPage from '@/pages/Public/NotFoundPage';

// Admin Pages
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import AdminSettings from '@/pages/Admin/AdminSettings';
import SystemHealthPage from '@/pages/Admin/SystemHealthPage';

// Firm Pages
import FirmDashboardLayout from '@/layouts/FirmDashboardLayout';
import DashboardPage from '@/pages/Firm/DashboardPage';
import CasesPage from '@/pages/Firm/CasesPage';
import IntakePage from '@/pages/Firm/IntakePage';
import DocumentsPage from '@/pages/Firm/DocumentsPage';
import BillingPage from '@/pages/Firm/BillingPage';
import SettingsPage from '@/pages/Firm/SettingsPage';

// Onboarding
import OnboardingPage from '@/pages/Onboarding';

// Client Pages
import ClientLayout from '@/layouts/ClientLayout';
import ClientDashboard from '@/pages/Client/ClientDashboard';
import ClientInvoices from '@/pages/Client/ClientInvoices';
import ClientDocuments from '@/pages/Client/ClientDocuments';

// Loading Component
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RoleRouter() {
  const { user, isLoading } = useSession();
  const { tenant, loading: tenantLoading } = useTenant();

  if (isLoading || tenantLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes - Always accessible */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      {user ? (
        <>
          {/* GHGH 20.2 - Admin Routes */}
          {['platform_admin', 'admin', 'super_admin'].includes(user.role) && (
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="system-health" element={<SystemHealthPage />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="logout" element={<LogoutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          )}

          {/* GHGH 20.1 - Firm Routes with Nested Structure */}
          {(user.role === 'firm_admin' || user.role === 'paralegal') && (
            <>
              {/* Always include onboarding route for firm users */}
              <Route path="/onboarding" element={<OnboardingPage />} />
              
              {/* Main firm routes */}
              <Route path="/" element={<FirmDashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="cases" element={<CasesPage />} />
                <Route path="intake" element={<IntakePage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="logout" element={<LogoutPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
              <Route path="/dashboard" element={<FirmDashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="cases" element={<CasesPage />} />
                <Route path="intake" element={<IntakePage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="logout" element={<LogoutPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </>
          )}

          {/* Client Routes */}
          {user.role === 'client' && (
            <Route path="/client" element={<ClientLayout />}>
              <Route index element={<ClientDashboard />} />
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="invoices" element={<ClientInvoices />} />
              <Route path="documents" element={<ClientDocuments />} />
              <Route path="logout" element={<LogoutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          )}

          {/* GHGH 20.2 - Role-based Redirects */}
          <Route path="/" element={
            ['platform_admin', 'admin', 'super_admin'].includes(user.role) ? (
              <Navigate to="/admin" replace />
            ) : user.role === 'client' ? (
              <Navigate to="/client" replace />
            ) : tenant && !tenant.onboarded ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } />
        </>
      ) : (
        /* Unauthenticated - Redirect to Login */
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}

      {/* Catch-all routes for each layout and general 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}