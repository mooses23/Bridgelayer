// Protected by middleware (admin-only access)
// src/app/firmsync/admin/integrations/page.tsx
// Integration marketplace selections per tenant tab

'use client';

import { useState } from 'react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tabs: string[];
  pricing: string;
  connected: boolean;
}

interface IntegrationConfig {
  [tenantTab: string]: {
    [integrationId: string]: boolean;
  };
}

export default function IntegrationsPage() {
  const [selectedTenant, setSelectedTenant] = useState('demo-firm');
  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig>({
    clients: {
      'salesforce': true,
      'hubspot': false,
      'zoho': false,
    },
    cases: {
      'clio': true,
      'mycase': false,
      'practicesuite': false,
    },
    billing: {
      'quickbooks': true,
      'xero': false,
      'freshbooks': false,
    },
    calendar: {
      'outlook': true,
      'google-calendar': false,
      'calendly': false,
    },
    documents: {
      'docusign': true,
      'adobesign': false,
      'hellosign': false,
    }
  });

  // Available integrations grouped by category
  const integrations: Integration[] = [
    // CRM & Client Management
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Enterprise CRM and client relationship management',
      category: 'CRM',
      icon: '☁️',
      tabs: ['clients'],
      pricing: 'Premium',
      connected: false
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'All-in-one marketing, sales, and service platform',
      category: 'CRM',
      icon: '🎯',
      tabs: ['clients'],
      pricing: 'Free/Premium',
      connected: false
    },
    {
      id: 'zoho',
      name: 'Zoho CRM',
      description: 'Customer relationship management solution',
      category: 'CRM',
      icon: '🏢',
      tabs: ['clients'],
      pricing: 'Premium',
      connected: false
    },

    // Legal Practice Management
    {
      id: 'clio',
      name: 'Clio',
      description: 'Comprehensive legal practice management software',
      category: 'Legal',
      icon: '⚖️',
      tabs: ['cases', 'clients', 'billing'],
      pricing: 'Premium',
      connected: false
    },
    {
      id: 'mycase',
      name: 'MyCase',
      description: 'Legal case management and client portal',
      category: 'Legal',
      icon: '📋',
      tabs: ['cases', 'clients'],
      pricing: 'Premium',
      connected: false
    },
    {
      id: 'practicesuite',
      name: 'PracticeSuite',
      description: 'Legal practice management with time tracking',
      category: 'Legal',
      icon: '⏱️',
      tabs: ['cases', 'billing'],
      pricing: 'Premium',
      connected: false
    },

    // Accounting & Billing
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Industry-leading accounting and bookkeeping software',
      category: 'Accounting',
      icon: '💰',
      tabs: ['billing'],
      pricing: 'Premium',
      connected: false
    },
    {
      id: 'xero',
      name: 'Xero',
      description: 'Cloud-based accounting software for small businesses',
      category: 'Accounting',
      icon: '📊',
      tabs: ['billing'],
      pricing: 'Premium',
      connected: false
    },
    {
      id: 'freshbooks',
      name: 'FreshBooks',
      description: 'Simple invoicing and time tracking for small businesses',
      category: 'Accounting',
      icon: '🧾',
      tabs: ['billing'],
      pricing: 'Premium',
      connected: false
    },

    // Calendar & Scheduling
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      description: 'Email and calendar management from Microsoft',
      category: 'Calendar',
      icon: '📅',
      tabs: ['calendar'],
      pricing: 'Free/Premium',
      connected: false
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Free calendar service from Google',
      category: 'Calendar',
      icon: '🗓️',
      tabs: ['calendar'],
      pricing: 'Free',
      connected: false
    },
    {
      id: 'calendly',
      name: 'Calendly',
      description: 'Online appointment scheduling made easy',
      category: 'Calendar',
      icon: '⏰',
      tabs: ['calendar'],
      pricing: 'Free/Premium',
      connected: false
    },

    // Document Management
    {
      id: 'docusign',
      name: 'DocuSign',
      description: 'Electronic signature and document management',
      category: 'Documents',
      icon: '✍️',
      tabs: ['documents'],
      pricing: 'Premium',
      connected: false
    },
    {
      id: 'adobesign',
      name: 'Adobe Sign',
      description: 'Adobe\'s electronic signature solution',
      category: 'Documents',
      icon: '📝',
      tabs: ['documents'],
      pricing: 'Premium',
      connected: false
    }
  ];

  const tenantTabs = [
    { id: 'clients', name: 'Clients', icon: '👥' },
    { id: 'cases', name: 'Cases', icon: '📁' },
    { id: 'calendar', name: 'Calendar', icon: '📅' },
    { id: 'billing', name: 'Billing', icon: '💰' },
    { id: 'documents', name: 'Documents', icon: '📄' }
  ];

  const handleToggleIntegration = (tabId: string, integrationId: string) => {
    setIntegrationConfig(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        [integrationId]: !prev[tabId]?.[integrationId]
      }
    }));
  };

  const saveConfiguration = async () => {
    // TODO: Save to Supabase
    // const { data, error } = await supabase
    //   .from('tenant_integrations')
    //   .upsert({ tenant_id: selectedTenant, config: integrationConfig });
    
    alert('Integration configuration saved! (Placeholder)');
  };

  const getIntegrationsForTab = (tabId: string) => {
    return integrations.filter(integration => 
      integration.tabs.includes(tabId)
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Integration Marketplace</h2>
            <p className="text-gray-600 mt-1">Configure external SaaS tool integrations per tenant tab</p>
          </div>
          <button
            onClick={saveConfiguration}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Configuration
          </button>
        </div>

        {/* Tenant Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tenant
          </label>
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="demo-firm">Demo Law Firm</option>
            <option value="smith-associates">Smith & Associates</option>
            <option value="jones-legal">Jones Legal Group</option>
          </select>
        </div>

        {/* Integration Configuration by Tab */}
        <div className="space-y-8">
          {tenantTabs.map(tab => {
            const tabIntegrations = getIntegrationsForTab(tab.id);
            
            return (
              <div key={tab.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Tab Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{tab.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{tab.name}</h3>
                    <span className="ml-auto text-sm text-gray-500">
                      {tabIntegrations.filter(i => integrationConfig[tab.id]?.[i.id]).length} of {tabIntegrations.length} enabled
                    </span>
                  </div>
                </div>

                {/* Integrations Grid */}
                <div className="p-6">
                  {tabIntegrations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tabIntegrations.map(integration => {
                        const isEnabled = integrationConfig[tab.id]?.[integration.id] || false;
                        
                        return (
                          <div
                            key={integration.id}
                            className={`border rounded-lg p-4 transition-all ${
                              isEnabled 
                                ? 'border-blue-200 bg-blue-50' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">{integration.icon}</span>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                                  <p className="text-sm text-gray-600">{integration.pricing}</p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={() => handleToggleIntegration(tab.id, integration.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {integration.category}
                              </span>
                              {isEnabled && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  Enabled
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mb-2 block">🔌</span>
                      <p>No integrations available for this tab yet</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Fallback Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <span className="text-blue-500 text-xl mr-3">🤖</span>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">AI-Powered Fallbacks</h3>
              <p className="text-blue-700">
                When external integrations are not available or enabled, FirmSync automatically provides 
                AI-powered native alternatives to ensure your law firm always has the tools they need.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
