import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import Messaging from "@/pages/Messaging";
import Analytics from "@/pages/Analytics";
import Billing from "@/pages/billing";
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
      <Route path="/">
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/documents" component={Documents} />
            <Route path="/messages" component={Messaging} />
            <Route path="/billing" component={Billing} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/team" component={Team} />
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
