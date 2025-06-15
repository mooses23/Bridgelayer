import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
