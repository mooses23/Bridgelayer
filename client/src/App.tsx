import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import Clients from "@/pages/clients";
import Intake from "@/pages/intake";
import Billing from "@/pages/billing";
import Settings from "@/pages/settings";
import Onboarding from "@/pages/Onboarding";
import Admin from "@/pages/Admin";
import ClientPortal from "@/pages/client-portal";
import NotFound from "@/pages/not-found";

// Tab Components
function DashboardTab() {
  console.log("DashboardTab rendered");
  return <Dashboard />;
}

function DocumentsTab() {
  console.log("DocumentsTab rendered");
  return <Documents />;
}

function ClientsTab() {
  console.log("ClientsTab rendered");
  return <Clients />;
}

function IntakeTab() {
  console.log("IntakeTab rendered");
  return <Intake />;
}

function BillingTab() {
  console.log("BillingTab rendered");
  return <Billing />;
}

function SettingsTab() {
  console.log("SettingsTab rendered");
  return <Settings />;
}

function CalendarTab() {
  console.log("CalendarTab rendered");
  return <div>This is the Calendar tab.</div>;
}

function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  // Listen for navigation changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route matching function
  const renderRoute = () => {
    // Special routes (outside Layout)
    if (currentPath === '/onboarding') return <Onboarding />;
    if (currentPath === '/admin') return <Admin />;
    if (currentPath === '/client-portal') return <ClientPortal />;
    
    // Main application routes (inside Layout)
    return (
      <Layout>
        {currentPath === '/' && <DashboardTab />}
        {currentPath === '/clients' && <ClientsTab />}
        {currentPath === '/intake' && <IntakeTab />}
        {currentPath === '/documents' && <DocumentsTab />}
        {currentPath === '/billing' && <BillingTab />}
        {currentPath === '/settings' && <SettingsTab />}
        {currentPath === '/calendar' && <CalendarTab />}
        {!['/clients', '/intake', '/documents', '/billing', '/settings', '/calendar'].includes(currentPath) && currentPath !== '/' && <NotFound />}
      </Layout>
    );
  };

  return renderRoute();
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
