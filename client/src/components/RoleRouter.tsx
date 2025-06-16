import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';

// Public Pages
import LoginPage from '@/pages/Public/LoginPage';
import LogoutPage from '@/pages/Public/LogoutPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Admin Pages
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboard from '@/pages/Admin/AdminDashboard';

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

// Loading Component
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RoleRouter() {
  const { user, loading } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();

  if (loading || tenantLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes - Always accessible */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      
      {/* Protected Routes */}
      {user ? (
        <>
          {/* GHGH 20.2 - Admin Routes */}
          {user.role === 'admin' && (
            <Route path="/admin/*" element={
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </AdminLayout>
            } />
          )}

          {/* GHGH 20.1 - Firm Routes with Nested Structure */}
          {(user.role === 'firm_admin' || user.role === 'paralegal') && (
            <>
              {/* Check if firm needs onboarding */}
              {tenant && !tenant.onboarded ? (
                <Route path="/onboarding" element={<OnboardingPage />} />
              ) : (
                <Route path="/*" element={
                  <FirmDashboardLayout>
                    <Routes>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/cases" element={<CasesPage />} />
                      <Route path="/intake" element={<IntakePage />} />
                      <Route path="/documents" element={<DocumentsPage />} />
                      <Route path="/billing" element={<BillingPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </FirmDashboardLayout>
                } />
              )}
            </>
          )}

          {/* Client Routes */}
          {user.role === 'client' && (
            <Route path="/client/*" element={
              <ClientLayout>
                <Routes>
                  <Route index element={<ClientDashboard />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </ClientLayout>
            } />
          )}

          {/* GHGH 20.2 - Role-based Redirects */}
          <Route path="/" element={
            user.role === 'admin' ? (
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

      {/* GHGH 20.6 - Catch-all 404 for unknown routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}