// src/app/firmsync/tenant/[tenantId]/clients/page.tsx
// Dynamic client hub with conditional rendering based on feature toggles

'use client';

import { useState, useEffect } from 'react';
import { useClientFeatures } from '../hooks/useClientFeatures';
import { useClients } from '../hooks/useClients';
import { ContactsInfoCard } from './components/ContactsInfoCard';
import { IntakeForm } from './components/IntakeForm';
import { LinkedCasesList } from './components/LinkedCasesList';
import { NotesSection } from './components/NotesSection';
import { DocumentUploadsGrid } from './components/DocumentUploadsGrid';

interface ClientsPageProps {
  params: {
    tenantId: string;
  };
}

export default function ClientsPage({ params }: ClientsPageProps) {
  const { tenantId } = params;
  const { features, loading: featuresLoading, error: featuresError } = useClientFeatures(tenantId);
  const { clients, loading: clientsLoading, error: clientsError, addClient, updateClient, deleteClient } = useClients(tenantId);

  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data for subcomponents (in real app, these would come from additional hooks)
  const [mockCases] = useState([
    {
      id: '1',
      case_number: '2024-001',
      title: 'Personal Injury - Auto Accident',
      case_type: 'Personal Injury',
      status: 'open' as const,
      created_at: '2024-01-15T00:00:00Z',
      last_activity: '2024-01-20T00:00:00Z',
      attorney_assigned: 'Sarah Johnson',
      next_deadline: '2024-02-01T00:00:00Z',
      ai_risk_score: 75,
      priority: 'high' as const
    },
    {
      id: '2',
      case_number: '2024-002',
      title: 'Contract Review - Business Agreement',
      case_type: 'Business Law',
      status: 'pending' as const,
      created_at: '2024-01-18T00:00:00Z',
      last_activity: '2024-01-19T00:00:00Z',
      attorney_assigned: 'Michael Chen',
      priority: 'medium' as const
    }
  ]);

  const [mockNotes] = useState([
    {
      id: '1',
      content: 'Initial consultation completed. Client provided detailed account of the accident. Medical records requested.',
      created_at: '2024-01-20T10:30:00Z',
      created_by: 'Sarah Johnson',
      note_type: 'meeting' as const,
      tags: ['consultation', 'medical-records', 'follow-up'],
      ai_summary: 'Client meeting regarding auto accident case. Action items: medical records collection.',
      is_pinned: true
    },
    {
      id: '2',
      content: 'Follow-up call scheduled for next week to review medical documentation and discuss strategy.',
      created_at: '2024-01-19T14:15:00Z',
      created_by: 'Sarah Johnson',
      note_type: 'call' as const,
      tags: ['follow-up', 'strategy'],
      is_pinned: false
    }
  ]);

  const [mockDocuments] = useState([
    {
      id: '1',
      name: 'Medical_Records_Jan_2024.pdf',
      file_type: 'application/pdf',
      file_size: 2048576,
      uploaded_at: '2024-01-20T09:00:00Z',
      uploaded_by: 'Sarah Johnson',
      category: 'medical' as const,
      ai_category: 'Medical Documentation',
      ai_confidence: 95,
      tags: ['medical', 'january-2024'],
      is_confidential: true,
      download_url: '#',
      ai_summary: 'Comprehensive medical records from treating physician regarding injuries sustained in auto accident.'
    },
    {
      id: '2',
      name: 'Insurance_Correspondence.docx',
      file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      file_size: 524288,
      uploaded_at: '2024-01-18T16:30:00Z',
      uploaded_by: 'Michael Chen',
      category: 'correspondence' as const,
      ai_category: 'Insurance Communication',
      ai_confidence: 88,
      tags: ['insurance', 'correspondence'],
      is_confidential: false,
      download_url: '#'
    }
  ]);

  const currentClient = selectedClient ? clients.find(c => c.id === selectedClient) : null;

  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchQuery || 
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleNewClient = () => {
    setShowNewClientForm(true);
    setSelectedClient(null);
  };

  const handleClientSubmit = async (clientData: any) => {
    try {
      await addClient(clientData);
      setShowNewClientForm(false);
      
      // AI-powered welcome sequence (stub)
      if (features?.aiSummarization) {
        console.log('🤖 Triggering AI welcome sequence for new client...');
        // TODO: Implement AI-powered welcome email, onboarding checklist, etc.
      }
      
      // Webhook notifications (stub)
      if (features?.webhookTriggers) {
        console.log('🔗 Triggering new client webhook notifications...');
        // TODO: Implement webhook system for new client notifications
      }
    } catch (error) {
      console.error('Failed to add client:', error);
    }
  };

  const handleContactUpdate = async (updates: any) => {
    if (!currentClient) return;
    
    try {
      await updateClient(currentClient.id, updates);
      setIsEditingContact(false);
      
      // AI change detection (stub)
      if (features?.autoTagging) {
        console.log('🤖 AI analyzing contact changes for auto-tagging...');
        // TODO: Implement AI-powered change detection and auto-tagging
      }
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  };

  if (featuresLoading || clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client workspace...</p>
        </div>
      </div>
    );
  }

  if (featuresError || clientsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Client Data</h2>
          <p className="text-gray-600 mb-4">
            {featuresError || clientsError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-600 mt-1">
                Manage client relationships and case workflows
                {features && (
                  <span className="ml-2 text-sm text-blue-600">
                    • {Object.values(features).filter(Boolean).length} AI features enabled
                  </span>
                )}
              </p>
            </div>
            
            <button
              onClick={handleNewClient}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              + New Client
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Client List Sidebar */}
          <div className="col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Clients</h3>
                
                {/* Search */}
                <div className="relative mb-4">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="prospective">Prospective</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Client List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-600 mb-2">No clients found</p>
                    <button
                      onClick={handleNewClient}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Add your first client
                    </button>
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client.id);
                        setShowNewClientForm(false);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedClient === client.id
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {client.first_name} {client.last_name}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">{client.email}</p>
                          {client.company && (
                            <p className="text-xs text-gray-500 truncate">{client.company}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            client.status === 'active' ? 'bg-green-100 text-green-800' :
                            client.status === 'prospective' ? 'bg-blue-100 text-blue-800' :
                            client.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status}
                          </span>
                          {(client.cases_count || 0) > 0 && (
                            <span className="text-xs text-gray-500">
                              {client.cases_count} cases
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-8">
            {showNewClientForm ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New Client</h3>
                
                {/* Simple new client form */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleClientSubmit({
                    first_name: formData.get('first_name') as string,
                    last_name: formData.get('last_name') as string,
                    email: formData.get('email') as string,
                    phone: formData.get('phone') as string,
                    company: formData.get('company') as string,
                    status: formData.get('status') as string,
                  });
                }}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        name="company"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        defaultValue="prospective"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="prospective">Prospective</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowNewClientForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Client
                    </button>
                  </div>
                </form>
              </div>
            ) : currentClient ? (
              <div className="space-y-6">
                {/* Contact Info Card - Conditionally Rendered */}
                {features?.contactsInfo && (
                  <ContactsInfoCard
                    client={currentClient}
                    onUpdate={handleContactUpdate}
                    isEditing={isEditingContact}
                    onToggleEdit={() => setIsEditingContact(!isEditingContact)}
                  />
                )}

                {/* Intake Form - Conditionally Rendered */}
                {features?.intakeForm && (
                  <IntakeForm
                    clientId={currentClient.id}
                    onSubmit={(data) => {
                      console.log('Intake form submitted:', data);
                      // TODO: Handle intake form submission
                      if (features?.smartReminders) {
                        console.log('🤖 Smart intake analysis triggered...');
                      }
                    }}
                    aiAnalysisEnabled={features?.aiSummarization}
                  />
                )}

                {/* Linked Cases - Conditionally Rendered */}
                {features?.linkedCases && (
                  <LinkedCasesList
                    clientId={currentClient.id}
                    cases={mockCases}
                    onCaseClick={(caseId) => {
                      console.log('Navigate to case:', caseId);
                      // TODO: Navigate to case details
                    }}
                    aiRecommendationsEnabled={features?.aiSummarization}
                  />
                )}

                {/* Notes Section - Conditionally Rendered */}
                {features?.notesSection && (
                  <NotesSection
                    clientId={currentClient.id}
                    notes={mockNotes}
                    onAddNote={(note) => {
                      console.log('Note added:', note);
                      // TODO: Handle note addition
                      if (features?.webhookTriggers) {
                        console.log('🔗 Note webhook triggered...');
                      }
                    }}
                    onUpdateNote={(id, updates) => {
                      console.log('Note updated:', id, updates);
                      // TODO: Handle note update
                    }}
                    onDeleteNote={(id) => {
                      console.log('Note deleted:', id);
                      // TODO: Handle note deletion
                    }}
                    aiSummarizationEnabled={features?.aiSummarization}
                    autoTaggingEnabled={features?.autoTagging}
                  />
                )}

                {/* Document Uploads - Conditionally Rendered */}
                {features?.documentUploads && (
                  <DocumentUploadsGrid
                    clientId={currentClient.id}
                    documents={mockDocuments}
                    onUpload={(files) => {
                      console.log('Files uploaded:', files);
                      // TODO: Handle file uploads
                      if (features?.conflictChecking) {
                        console.log('🤖 Conflict checking triggered for uploaded documents...');
                      }
                    }}
                    onDelete={(docId) => {
                      console.log('Document deleted:', docId);
                      // TODO: Handle document deletion
                    }}
                    onUpdateCategory={(docId, category) => {
                      console.log('Document category updated:', docId, category);
                      // TODO: Handle category update
                    }}
                    aiCategorizationEnabled={features?.autoTagging}
                    webhookTriggersEnabled={features?.webhookTriggers}
                  />
                )}

                {/* Feature-based micro-interactions TODOs */}
                {/* TODO: Implement AI-powered conflict checking when documents are uploaded */}
                {/* TODO: Implement smart reminders based on case deadlines and client activity */}
                {/* TODO: Implement webhook system for real-time integrations */}
                {/* TODO: Implement AI summarization for long notes and documents */}
                {/* TODO: Implement auto-tagging based on content analysis */}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Client</h3>
                  <p className="text-gray-600 mb-4">
                    Choose a client from the sidebar to view their information and manage their case workflow.
                  </p>
                  <button
                    onClick={handleNewClient}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add New Client
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
