import { Switch, Route } from 'wouter';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import AdminHome from '@/pages/Admin/Home';
import AgentAssignment from '@/pages/Admin/AgentAssignment';
import { VRManager } from '@/components/admin/vr';

// Placeholder components for other routes
const FirmsPage = () => <div>Firms Management</div>;
const IntegrationsPage = () => <div>Integrations</div>;
const LLMPage = () => <div>LLM Agent Workflow Designer</div>;
const SettingsPage = () => <div>System Settings</div>;

export default function AdminRoutes() {
  return (
    <AdminDashboardLayout>
      <Switch>
        <Route path="/admin" component={AdminHome} />
        <Route path="/admin/firms" component={FirmsPage} />
        <Route path="/admin/integrations" component={IntegrationsPage} />
        <Route path="/admin/agents" component={AgentAssignment} />
        <Route path="/admin/llm" component={LLMPage} />
        <Route path="/admin/vr" component={VRManager} />
        <Route path="/admin/settings" component={SettingsPage} />
      </Switch>
    </AdminDashboardLayout>
  );
}
