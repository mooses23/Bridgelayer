import { useState } from "react";
import { Switch, Route } from "wouter";
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
  try {
    const currentPath = window.location.pathname || '/';
    
    return (
      <Switch>
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/admin" component={Admin} />
        <Route path="/client-portal" component={ClientPortal} />
        <Route path="/" nest>
          <Layout>
            <Switch>
              <Route path="/" component={DashboardTab} />
              <Route path="/clients" component={ClientsTab} />
              <Route path="/intake" component={IntakeTab} />
              <Route path="/documents" component={DocumentsTab} />
              <Route path="/billing" component={BillingTab} />
              <Route path="/settings" component={SettingsTab} />
              <Route path="/calendar" component={CalendarTab} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </Route>
      </Switch>
    );
  } catch (error) {
    console.error('Router error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">Navigation Error</h1>
          <p className="text-gray-600 mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }
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
