// Protected by middleware (admin-only access)
// src/app/firmsync/admin/llm/page.tsx
// AI Agent configuration mapping to tabs

'use client';

import { useState } from 'react';

interface AIAgent {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'legal' | 'document' | 'research';
  capabilities: string[];
  configuration: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
  };
}

interface TabAgentConfig {
  [tabId: string]: {
    primaryAgent: string;
    fallbackAgent: string;
    customSettings: Record<string, unknown>;
  };
}

export default function LLMPage() {
  const [selectedTenant, setSelectedTenant] = useState('demo-firm');
  const [tabAgentConfig, setTabAgentConfig] = useState<TabAgentConfig>({
    clients: {
      primaryAgent: 'client-specialist',
      fallbackAgent: 'general-assistant',
      customSettings: {
        welcomeMessage: 'How can I help you with client management today?',
        suggestedActions: ['Add new client', 'Search clients', 'Update contact info']
      }
    },
    cases: {
      primaryAgent: 'case-manager',
      fallbackAgent: 'legal-assistant',
      customSettings: {
        welcomeMessage: 'Ready to help with case management and tracking.',
        suggestedActions: ['Create new case', 'Update case status', 'Generate case summary']
      }
    },
    billing: {
      primaryAgent: 'billing-specialist',
      fallbackAgent: 'general-assistant',
      customSettings: {
        welcomeMessage: 'I can assist with billing, invoices, and time tracking.',
        suggestedActions: ['Create invoice', 'Track time', 'Generate billing report']
      }
    },
    calendar: {
      primaryAgent: 'scheduling-assistant',
      fallbackAgent: 'general-assistant',
      customSettings: {
        welcomeMessage: 'Let me help you manage schedules and appointments.',
        suggestedActions: ['Schedule appointment', 'Check availability', 'Set reminder']
      }
    },
    paralegal: {
      primaryAgent: 'paralegal-pro',
      fallbackAgent: 'legal-assistant',
      customSettings: {
        welcomeMessage: 'Your AI paralegal ready to assist with legal research and documents.',
        suggestedActions: ['Research case law', 'Draft document', 'Review contract']
      }
    }
  });

  // Available AI Agents
  const availableAgents: AIAgent[] = [
    {
      id: 'general-assistant',
      name: 'General Assistant',
      description: 'Versatile AI assistant for general business tasks',
      category: 'general',
      capabilities: ['Basic Q&A', 'Task management', 'General support'],
      configuration: {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 2048,
        systemPrompt: 'You are a helpful business assistant.'
      }
    },
    {
      id: 'legal-assistant',
      name: 'Legal Assistant',
      description: 'AI assistant trained on legal procedures and terminology',
      category: 'legal',
      capabilities: ['Legal terminology', 'Procedure guidance', 'Form assistance'],
      configuration: {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 4096,
        systemPrompt: 'You are a knowledgeable legal assistant with expertise in law firm operations.'
      }
    },
    {
      id: 'client-specialist',
      name: 'Client Relations Specialist',
      description: 'Specialized in client communication and relationship management',
      category: 'general',
      capabilities: ['Client communication', 'CRM guidance', 'Relationship building'],
      configuration: {
        model: 'gpt-4o',
        temperature: 0.5,
        maxTokens: 2048,
        systemPrompt: 'You are a client relations specialist focused on maintaining excellent client relationships.'
      }
    },
    {
      id: 'case-manager',
      name: 'Case Management Expert',
      description: 'Expert in legal case management and workflow optimization',
      category: 'legal',
      capabilities: ['Case tracking', 'Workflow optimization', 'Status updates'],
      configuration: {
        model: 'gpt-4o',
        temperature: 0.4,
        maxTokens: 3072,
        systemPrompt: 'You are a case management expert helping law firms organize and track their cases efficiently.'
      }
    },
    {
      id: 'billing-specialist',
      name: 'Billing & Finance Specialist',
      description: 'Expert in legal billing, time tracking, and financial management',
      category: 'general',
      capabilities: ['Billing guidance', 'Time tracking', 'Financial reporting'],
      configuration: {
        model: 'gpt-4o',
        temperature: 0.2,
        maxTokens: 2048,
        systemPrompt: 'You are a billing specialist helping law firms manage their finances and billing efficiently.'
      }
    },
    {
      id: 'scheduling-assistant',
      name: 'Scheduling Assistant',
      description: 'AI assistant for calendar management and appointment scheduling',
      category: 'general',
      capabilities: ['Calendar management', 'Appointment scheduling', 'Time optimization'],
      configuration: {
        model: 'gpt-4o',
        temperature: 0.6,
        maxTokens: 1512,
        systemPrompt: 'You are a scheduling assistant helping manage calendars and appointments efficiently.'
      }
    },
    {
      id: 'paralegal-pro',
      name: 'Paralegal Pro',
      description: 'Advanced AI paralegal for research, document review, and legal analysis',
      category: 'legal',
      capabilities: ['Legal research', 'Document analysis', 'Case preparation', 'Contract review'],
      configuration: {
        model: 'gpt-4o',
        temperature: 0.1,
        maxTokens: 8192,
        systemPrompt: 'You are an expert AI paralegal with deep knowledge of legal research, document analysis, and case preparation.'
      }
    }
  ];

  const tenantTabs = [
    { id: 'clients', name: 'Clients', icon: '👥' },
    { id: 'cases', name: 'Cases', icon: '📁' },
    { id: 'calendar', name: 'Calendar', icon: '📅' },
    { id: 'billing', name: 'Billing', icon: '💰' },
    { id: 'paralegal', name: 'Paralegal+', icon: '🤖' }
  ];

  const updateTabAgent = (tabId: string, agentType: 'primaryAgent' | 'fallbackAgent', agentId: string) => {
    setTabAgentConfig(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        [agentType]: agentId
      }
    }));
  };

  const updateCustomSetting = (tabId: string, setting: string, value: unknown) => {
    setTabAgentConfig(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        customSettings: {
          ...prev[tabId].customSettings,
          [setting]: value
        }
      }
    }));
  };

  const saveConfiguration = async () => {
    // TODO: Save to Supabase as JSONB
    // const { data, error } = await supabase
    //   .from('tenant_ai_config')
    //   .upsert({ 
    //     tenant_id: selectedTenant, 
    //     agent_config: tabAgentConfig 
    //   });
    
    alert('AI Agent configuration saved! (Placeholder)');
  };

  const getAgentById = (agentId: string) => {
    return availableAgents.find(agent => agent.id === agentId);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Agent Configuration</h2>
            <p className="text-gray-600 mt-1">Configure AI agents for each tenant portal tab</p>
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

        {/* Agent Configuration by Tab */}
        <div className="space-y-6">
          {tenantTabs.map(tab => {
            const config = tabAgentConfig[tab.id];
            const primaryAgent = getAgentById(config.primaryAgent);
            const fallbackAgent = getAgentById(config.fallbackAgent);

            return (
              <div key={tab.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Tab Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{tab.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{tab.name} Tab</h3>
                  </div>
                </div>

                {/* Agent Configuration */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Primary Agent */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary AI Agent
                      </label>
                      <select
                        value={config.primaryAgent}
                        onChange={(e) => updateTabAgent(tab.id, 'primaryAgent', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                      >
                        {availableAgents.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} - {agent.description}
                          </option>
                        ))}
                      </select>
                      
                      {primaryAgent && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-sm">
                            <p className="font-medium text-blue-900 mb-1">Capabilities:</p>
                            <ul className="text-blue-800 space-y-1">
                              {primaryAgent.capabilities.map((cap, index) => (
                                <li key={index}>• {cap}</li>
                              ))}
                            </ul>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-blue-700">
                              <span>Model: {primaryAgent.configuration.model}</span>
                              <span>Temp: {primaryAgent.configuration.temperature}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fallback Agent */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fallback AI Agent
                      </label>
                      <select
                        value={config.fallbackAgent}
                        onChange={(e) => updateTabAgent(tab.id, 'fallbackAgent', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                      >
                        {availableAgents.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} - {agent.description}
                          </option>
                        ))}
                      </select>

                      {fallbackAgent && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 mb-1">Capabilities:</p>
                            <ul className="text-gray-700 space-y-1">
                              {fallbackAgent.capabilities.map((cap, index) => (
                                <li key={index}>• {cap}</li>
                              ))}
                            </ul>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                              <span>Model: {fallbackAgent.configuration.model}</span>
                              <span>Temp: {fallbackAgent.configuration.temperature}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Settings */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Custom Settings</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Welcome Message */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Welcome Message
                        </label>
                        <textarea
                          value={(config.customSettings.welcomeMessage as string) || ''}
                          onChange={(e) => updateCustomSetting(tab.id, 'welcomeMessage', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="Enter welcome message for users..."
                        />
                      </div>

                      {/* Suggested Actions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Suggested Actions (comma-separated)
                        </label>
                        <textarea
                          value={(config.customSettings.suggestedActions as string[] | undefined)?.join(', ') || ''}
                          onChange={(e) => updateCustomSetting(tab.id, 'suggestedActions', e.target.value.split(', ').filter(Boolean))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="Add client, Search cases, Generate report..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Configuration Summary */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenantTabs.map(tab => {
              const config = tabAgentConfig[tab.id];
              const primaryAgent = getAgentById(config.primaryAgent);
              
              return (
                <div key={tab.id} className="bg-white rounded border p-3">
                  <div className="flex items-center mb-2">
                    <span className="mr-2">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Primary: {primaryAgent?.name}</p>
                    <p className="text-xs mt-1 text-gray-500">
                      {primaryAgent?.category} agent
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
