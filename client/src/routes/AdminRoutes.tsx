import { Switch, Route } from 'wouter';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import AdminHome from '@/pages/Admin/Home';
import AgentAssignment from '@/pages/Admin/AgentAssignment';

// Placeholder components for other routes
const FirmsPage = () => <div>Firms Management</div>;
const IntegrationsPage = () => <div>Integrations</div>;
const LLMPage = () => <div>LLM Agent Workflow Designer</div>;
const PreviewPage = () => <div>Firm Workspace Preview</div>;
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
        <Route path="/admin/preview" component={PreviewPage} />
        <Route path="/admin/settings" component={SettingsPage} />
      </Switch>
    </AdminDashboardLayout>
  );
}
