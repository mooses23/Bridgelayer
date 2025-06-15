
import { Navigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

// Layout imports
import PublicLayout from "@/layouts/PublicLayout";
import OnboardingLayout from "@/layouts/OnboardingLayout";
import FirmDashboardLayout from "@/layouts/FirmDashboardLayout";
import ClientLayout from "@/layouts/ClientLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Page imports
import LoginPage from "@/pages/Public/LoginPage";
import LogoutPage from "@/pages/Public/LogoutPage";
import OnboardingWizard from "@/pages/Onboarding/OnboardingWizard";
import DashboardPage from "@/pages/Firm/DashboardPage";
import CasesPage from "@/pages/Firm/CasesPage";
import IntakePage from "@/pages/Firm/IntakePage";
import DocumentsPage from "@/pages/Firm/DocumentsPage";
import BillingPage from "@/pages/Firm/BillingPage";
import ClientLoginPage from "@/pages/Client/ClientLoginPage";
import ClientDashboard from "@/pages/Client/ClientDashboard";
import ClientInvoicesPage from "@/pages/Client/ClientInvoicesPage";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import TenantsPage from "@/pages/Admin/TenantsPage";
import GhostModePage from "@/pages/Admin/GhostModePage";

export default function RoleRouter() {
  const { user, firm, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <PublicLayout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </PublicLayout>
    );
  }

  // Platform admin routes
  if (user.role === 'platform_admin') {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/tenants" element={<TenantsPage />} />
          <Route path="/admin/ghost" element={<GhostModePage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    );
  }

  // Check if firm needs onboarding
  if (!firm?.onboarded) {
    return (
      <OnboardingLayout>
        <Routes>
          <Route path="/onboarding/*" element={<OnboardingWizard />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </OnboardingLayout>
    );
  }

  // Client portal routes
  if (user.role === 'client') {
    return (
      <ClientLayout>
        <Routes>
          <Route path="/client/login" element={<ClientLoginPage />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/client/invoices" element={<ClientInvoicesPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
        </Routes>
      </ClientLayout>
    );
  }

  // Firm user routes (default)
  return (
    <FirmDashboardLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </FirmDashboardLayout>
  );
}
