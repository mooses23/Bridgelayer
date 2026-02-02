// Protected by middleware (admin-only access)
// src/app/firmsync/admin/docplus/page.tsx
// Document-specific AI agent mappings and Paralegal+ configuration

'use client';

import { useState } from 'react';

interface DocumentType {
  id: string;
  name: string;
  category: string;
  description: string;
  assignedAgent: string;
  templates: string[];
}

interface ParalegalChatBox {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  enabled: boolean;
  configuration: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

export default function DocPlusPage() {
  const [selectedTenant, setSelectedTenant] = useState('demo-firm');
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([
    {
      id: 'nda',
      name: 'Non-Disclosure Agreement',
      category: 'Contracts',
      description: 'Standard NDA for client confidentiality',
      assignedAgent: 'contract-specialist',
      templates: ['Standard NDA', 'Mutual NDA', 'Employee NDA']
    },
    {
      id: 'settlement-letter',
      name: 'Settlement Letter',
      category: 'Litigation',
      description: 'Settlement demand and negotiation letters',
      assignedAgent: 'litigation-specialist',
      templates: ['Demand Letter', 'Counter-Offer', 'Final Settlement']
    },
    {
      id: 'client-intake',
      name: 'Client Intake Form',
      category: 'Administrative',
      description: 'New client onboarding documentation',
      assignedAgent: 'intake-specialist',
      templates: ['Personal Injury Intake', 'Corporate Client Intake', 'Family Law Intake']
    },
    {
      id: 'motion',
      name: 'Court Motion',
      category: 'Litigation',
      description: 'Various court motions and filings',
      assignedAgent: 'litigation-specialist',
      templates: ['Motion to Dismiss', 'Motion for Summary Judgment', 'Discovery Motion']
    }
  ]);

  const [paralegalChatBoxes, setParalegalChatBoxes] = useState<ParalegalChatBox[]>([
    {
      id: 'document-generator',
      name: 'Document Generator',
      description: 'AI-powered legal document creation and template filling',
      systemPrompt: 'You are an expert legal document generator. Help create professional legal documents based on provided templates and client information.',
      enabled: true,
      configuration: {
        model: 'gpt-4o',
        temperature: 0.1,
        maxTokens: 4096
      }
    },
    {
      id: 'legal-research',
      name: 'Legal Research',
      description: 'Comprehensive legal research and case law analysis',
      systemPrompt: 'You are a legal research expert. Provide thorough case law research, statute analysis, and legal precedent findings.',
      enabled: true,
      configuration: {
        model: 'gpt-4o',
        temperature: 0.2,
        maxTokens: 6144
      }
    },
    {
      id: 'case-analysis',
      name: 'Case Analysis',
      description: 'In-depth case analysis and strategy recommendations',
      systemPrompt: 'You are a case analysis expert. Analyze case facts, identify key issues, and provide strategic recommendations.',
      enabled: true,
      configuration: {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 8192
      }
    },
    {
      id: 'document-review',
      name: 'Document Review',
      description: 'Contract review, compliance checking, and risk assessment',
      systemPrompt: 'You are a document review specialist. Carefully review documents for legal compliance, risks, and improvement suggestions.',
      enabled: true,
      configuration: {
        model: 'gpt-4o',
        temperature: 0.1,
        maxTokens: 8192
      }
    }
  ]);

  const [showAddDocType, setShowAddDocType] = useState(false);
  const [newDocType, setNewDocType] = useState({
    name: '',
    category: '',
    description: '',
    assignedAgent: 'document-specialist'
  });

  const availableAgents = [
    { id: 'document-specialist', name: 'Document Specialist', description: 'General document creation and editing' },
    { id: 'contract-specialist', name: 'Contract Specialist', description: 'Contract drafting and review expert' },
    { id: 'litigation-specialist', name: 'Litigation Specialist', description: 'Court filings and litigation documents' },
    { id: 'intake-specialist', name: 'Intake Specialist', description: 'Client onboarding and intake forms' },
    { id: 'compliance-specialist', name: 'Compliance Specialist', description: 'Regulatory compliance and risk assessment' }
  ];

  const documentCategories = [
    'Contracts',
    'Litigation',
    'Administrative',
    'Compliance',
    'Real Estate',
    'Corporate',
    'Family Law',
    'Immigration',
    'Other'
  ];

  const addDocumentType = () => {
    if (newDocType.name && newDocType.category) {
      const docType: DocumentType = {
        id: newDocType.name.toLowerCase().replace(/\s+/g, '-'),
        name: newDocType.name,
        category: newDocType.category,
        description: newDocType.description,
        assignedAgent: newDocType.assignedAgent,
        templates: []
      };
      
      setDocumentTypes([...documentTypes, docType]);
      setNewDocType({
        name: '',
        category: '',
        description: '',
        assignedAgent: 'document-specialist'
      });
      setShowAddDocType(false);
    }
  };

  const updateDocumentAgent = (docId: string, agentId: string) => {
    setDocumentTypes(prev => 
      prev.map(doc => 
        doc.id === docId ? { ...doc, assignedAgent: agentId } : doc
      )
    );
  };

  const updateChatBoxConfig = (chatId: string, field: string, value: unknown) => {
    setParalegalChatBoxes(prev =>
      prev.map(chat =>
        chat.id === chatId 
          ? { ...chat, [field]: value }
          : chat
      )
    );
  };

  const saveConfiguration = async () => {
    // TODO: Save to Supabase as JSONB
    // const config = {
    //   documentTypes,
    //   paralegalChatBoxes
    // };
    // const { data, error } = await supabase
    //   .from('tenant_docplus_config')
    //   .upsert({ 
    //     tenant_id: selectedTenant, 
    //     config: config 
    //   });
    
    alert('Doc+ configuration saved! (Placeholder)');
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Doc+ Configuration</h2>
            <p className="text-gray-600 mt-1">Configure document AI agents and Paralegal+ features</p>
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

        {/* Document Type Mappings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Document Type → AI Agent Mappings</h3>
              <button
                onClick={() => setShowAddDocType(!showAddDocType)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                + Add Custom Document Type
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Add Document Type Form */}
            {showAddDocType && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-800 mb-3">Add Custom Document Type</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Name
                    </label>
                    <input
                      type="text"
                      value={newDocType.name}
                      onChange={(e) => setNewDocType({...newDocType, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Power of Attorney"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newDocType.category}
                      onChange={(e) => setNewDocType({...newDocType, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select category</option>
                      {documentCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newDocType.description}
                      onChange={(e) => setNewDocType({...newDocType, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Brief description of document type"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={addDocumentType}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Add Document Type
                  </button>
                  <button
                    onClick={() => setShowAddDocType(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Document Types Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned AI Agent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Templates
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documentTypes.map((docType) => (
                    <tr key={docType.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{docType.name}</div>
                          <div className="text-sm text-gray-500">{docType.description}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {docType.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={docType.assignedAgent}
                          onChange={(e) => updateDocumentAgent(docType.id, e.target.value)}
                          className="text-sm px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {availableAgents.map(agent => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {docType.templates.length > 0 ? (
                          <span>{docType.templates.length} templates</span>
                        ) : (
                          <span className="text-gray-400">No templates</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Paralegal+ Chat Boxes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Paralegal+ Chat Boxes</h3>
            <p className="text-sm text-gray-600 mt-1">Configure the four AI-powered chat assistants</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paralegalChatBoxes.map((chatBox) => (
                <div key={chatBox.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{chatBox.name}</h4>
                      <p className="text-sm text-gray-600">{chatBox.description}</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={chatBox.enabled}
                        onChange={(e) => updateChatBoxConfig(chatBox.id, 'enabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  {chatBox.enabled && (
                    <div className="space-y-3">
                      {/* System Prompt */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          System Prompt
                        </label>
                        <textarea
                          value={chatBox.systemPrompt}
                          onChange={(e) => updateChatBoxConfig(chatBox.id, 'systemPrompt', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      </div>

                      {/* Configuration */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Model
                          </label>
                          <select
                            value={chatBox.configuration.model}
                            onChange={(e) => updateChatBoxConfig(chatBox.id, 'configuration', {...chatBox.configuration, model: e.target.value})}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="gpt-4o-mini">GPT-4o Mini</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Temperature
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={chatBox.configuration.temperature}
                            onChange={(e) => updateChatBoxConfig(chatBox.id, 'configuration', {...chatBox.configuration, temperature: parseFloat(e.target.value)})}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Max Tokens
                          </label>
                          <input
                            type="number"
                            min="1024"
                            max="32768"
                            step="1024"
                            value={chatBox.configuration.maxTokens}
                            onChange={(e) => updateChatBoxConfig(chatBox.id, 'configuration', {...chatBox.configuration, maxTokens: parseInt(e.target.value)})}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
