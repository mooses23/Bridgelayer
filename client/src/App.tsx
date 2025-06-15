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
import Messaging from "@/pages/Messaging";
import Analytics from "@/pages/Analytics";
import Billing from "@/pages/billing";
import BillingAnalytics from "@/pages/billing-analytics";
import ClientPortal from "@/pages/client-portal";
import Team from "@/pages/team";
import Settings from "@/pages/settings";
import Onboarding from "@/pages/Onboarding";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/admin" component={Admin} />
      <Route path="/client-portal" component={ClientPortal} />
      <Route path="/">
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/clients" component={Clients} />
            <Route path="/intake" component={Intake} />
            <Route path="/documents" component={Documents} />
            <Route path="/billing" component={Billing} />
            <Route path="/settings" component={Settings} />
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
