import React from 'react';
import { Building2, Puzzle, Brain, Eye, Settings, BarChart3, Bot } from "lucide-react";
import { useLocation } from "wouter";
import { useSession } from '@/contexts/SessionContext';
import DashboardTab from '@/pages/Admin/tabs/DashboardTab';
import FirmsTab from '@/pages/Admin/tabs/FirmsTab';
import LLMWorkflowTab from '@/pages/Admin/tabs/LLMWorkflowTab';
import IntegrationsTab from '@/pages/Admin/tabs/IntegrationsTab';
import AgentsTab from '@/pages/Admin/tabs/AgentsTab';
import EnhancedPreviewTab from '@/pages/Admin/tabs/EnhancedPreviewTab';
import SettingsTab from '@/pages/Admin/tabs/SettingsTab';

export default function AdminDashboard({ code: propCode }: { code?: string }) {
  const { isLoading: sessionLoading, isAuthenticated } = useSession();
  const [, setLocation] = useLocation();
  
  // Redirect unauthenticated users
  React.useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [sessionLoading, isAuthenticated]);

  if (sessionLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const [activeTab, setActiveTab] = React.useState<string>('Dashboard');
  
  // Use prop code or extract from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlCode = urlParams.get('code');
  const code = propCode || urlCode || '';
  const tabs = [
    { key: 'Dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'Firms', label: 'Firms', icon: Building2 },
    { key: 'Integrations', label: 'Integrations', icon: Puzzle },
    { key: 'Agents', label: 'Agents', icon: Bot },
    { key: 'LLM Workflow', label: 'LLM Workflow', icon: Brain },
    { key: 'Preview', label: 'Preview', icon: Eye },
    { key: 'Settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <section className="flex-1 overflow-auto">
        {activeTab === 'Dashboard' && <DashboardTab />}
        {activeTab === 'Firms' && <FirmsTab />}
        {activeTab === 'Integrations' && <IntegrationsTab code={code} />}
        {activeTab === 'Agents' && <AgentsTab />}
        {activeTab === 'LLM Workflow' && <LLMWorkflowTab code={code} />}
        {activeTab === 'Preview' && (
          <EnhancedPreviewTab code={code} />
        )}
        {activeTab === 'Settings' && <SettingsTab />}
      </section>
    </div>
  );
}