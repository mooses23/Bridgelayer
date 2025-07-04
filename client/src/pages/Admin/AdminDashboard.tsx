import React from 'react';
import { Building2, Puzzle, Brain, Eye, Settings, BarChart3, Bot } from "lucide-react";
import { useLocation } from "wouter";
import { useSession } from '@/contexts/SessionContext';
import DashboardTab from '@/pages/Admin/tabs/DashboardTab';
import FirmsTab from '@/pages/Admin/tabs/FirmsTab';
import LLMWorkflowTab from '@/pages/Admin/tabs/LLMWorkflowTab';
import IntegrationsTab from '@/pages/Admin/tabs/IntegrationsTab';
import AgentsTab from '@/pages/Admin/tabs/AgentsTab';
import PreviewTab from '@/pages/Admin/tabs/PreviewTab';
import VRTab from '@/pages/Admin/tabs/VRTab';
import SettingsTab from '@/pages/Admin/tabs/SettingsTab';

export default function AdminDashboard() {
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
  const [code, setCode] = React.useState<string>('');
  const tabs = [
    { key: 'Dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'Firms', label: 'Firms', icon: Building2 },
    { key: 'Integrations', label: 'Integrations', icon: Puzzle },
    { key: 'Agents', label: 'Agents', icon: Bot },
    { key: 'LLM Workflow', label: 'LLM Workflow', icon: Brain },
    { key: 'VR', label: 'VR', icon: Eye },
    { key: 'Preview', label: 'Preview', icon: Eye },
    { key: 'Settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-full">
      {/* Side Navigation */}
      <aside className="w-64 bg-gray-50 border-r">
        <ul>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const classes = isActive ? 'bg-white text-blue-600' : 'text-gray-700';
            return (
              <li key={tab.key} className={`flex items-center p-4 cursor-pointer ${classes}`} onClick={() => setActiveTab(tab.key)}>
                <Icon className="w-5 h-5 mr-2" />
                <span>{tab.label}</span>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 overflow-auto">
        {activeTab === 'Dashboard' && <DashboardTab />}
        {activeTab === 'Firms' && <FirmsTab />}
        {activeTab === 'Integrations' && <IntegrationsTab code={code} />}
        {activeTab === 'Agents' && <AgentsTab />}
        {activeTab === 'LLM Workflow' && <LLMWorkflowTab code={code} />}
        {activeTab === 'VR' && <VRTab />}
        {activeTab === 'Preview' && (
          <PreviewTab code={code} />
        )}
        {activeTab === 'Settings' && <SettingsTab />}
      </section>
    </div>
  );
}