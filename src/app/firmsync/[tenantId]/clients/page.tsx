// IHO Framework Clients Page - Simple interface: Add, View/Edit, Contact
// Implements ITTT (If This Then That) with native vs integration modes

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Client, FeatureMode } from '@/types/ittt'

export default function ClientsPage() {
  const params = useParams()
  const tenantId = params.tenantId as string
  
  // IHO State Management
  const [featureMode, setFeatureMode] = useState<FeatureMode>({
    clients: 'native',
    integrationProvider: null,
    fallbackToNative: true
  })
  
  // Client Management State
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<Client>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    clientType: 'individual',
    status: 'active',
    notes: '',
    tags: []
  })

  // Initialize on mount
  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/firmsync/${tenantId}/clients`)
        if (!response.ok) {
          throw new Error('Failed to fetch clients')
        }
        const clientList = await response.json()
        setClients(clientList)
      } catch (error) {
        console.error('Failed to load clients:', error)
        setMessage({ type: 'error', text: 'Failed to load clients' })
      } finally {
        setIsLoading(false)
      }
    }

    const initAndLoad = async () => {
      try {
        // Initialize feature mode - for now just set to native
        setFeatureMode({
          clients: 'native',
          integrationProvider: null,
          fallbackToNative: true
        })
        await loadClients()
      } catch (error) {
        console.error('Failed to initialize IHO:', error)
        setMessage({ type: 'error', text: 'Failed to initialize client management' })
      }
    }
    
    initAndLoad()
  }, [tenantId])


  // IHO Operation 2: ADD CLIENT (In: Form Data, Host: Database)
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/firmsync/${tenantId}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to add client')
      }
      
      const newClient = await response.json()
      setClients([newClient, ...clients])
      setShowAddForm(false)
      setFormData({
        firstName: '', lastName: '', email: '', phone: '', company: '',
        clientType: 'individual', status: 'active', notes: '', tags: []
      })
      setMessage({ type: 'success', text: `Client "${newClient.firstName} ${newClient.lastName}" added successfully!` })
      
      // ITTT will automatically trigger any configured automations
    } catch (error) {
      console.error('Failed to add client:', error)
      setMessage({ type: 'error', text: 'Failed to add client' })
    } finally {
      setIsLoading(false)
    }
  }

  // IHO Operation 3: EDIT CLIENT (In: Updated Data, Host: Database)
  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/firmsync/${tenantId}/clients`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: selectedClient.id
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update client')
      }
      
      const updatedClient = await response.json()
      setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c))
      setShowEditForm(false)
      setSelectedClient(null)
      setMessage({ type: 'success', text: 'Client updated successfully!' })
    } catch (error) {
      console.error('Failed to update client:', error)
      setMessage({ type: 'error', text: 'Failed to update client' })
    } finally {
      setIsLoading(false)
    }
  }

  // IHO Operation 4: CONTACT CLIENT (In: Contact Method, Host: Communication)
  const handleContactClient = async (client: Client) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/firmsync/${tenantId}/clients`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'contact',
          id: client.id,
          email: client.email
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to contact client')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setMessage({ type: 'success', text: `Contact initiated with ${client.firstName} ${client.lastName} via ${result.method}` })
        // Update last contact in UI
        setClients(clients.map(c => 
          c.id === client.id 
            ? { ...c, lastContact: new Date().toISOString() }
            : c
        ))
      }
    } catch (error) {
      console.error('Failed to contact client:', error)
      setMessage({ type: 'error', text: 'Failed to initiate contact' })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions
  const openEditForm = (client: Client) => {
    setSelectedClient(client)
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      company: client.company,
      notes: client.notes,
      clientType: client.clientType,
      status: client.status
    })
    setShowEditForm(true)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      lead: 'bg-blue-100 text-blue-800',
      archived: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header with Mode Indicator */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <div className="flex items-center mt-2 space-x-3">
              <p className="text-gray-600">Manage your client relationships</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                featureMode.clients === 'native' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {featureMode.clients === 'native' ? '🏠 Native Mode' : `🔗 ${featureMode.integrationProvider} Integration`}
              </span>
            </div>
          </div>
          
          {/* IHO Action: ADD CLIENT */}
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            disabled={isLoading}
          >
            ➕ Add New Client
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
            <button 
              onClick={() => setMessage(null)}
              className="ml-4 underline text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Clients List - IHO Operation: VIEW */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Client Directory</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading clients...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No clients found. Add your first client to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {client.firstName} {client.lastName}
                          </h4>
                          {getStatusBadge(client.status)}
                          {client.clientType === 'business' && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                              Business
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Email:</span> {client.email}
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span> {client.phone || 'Not provided'}
                          </div>
                          <div>
                            <span className="font-medium">Added:</span> {formatDate(client.createdAt)}
                          </div>
                        </div>
                        
                        {client.company && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Company:</span> {client.company}
                          </div>
                        )}
                        
                        {client.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {client.notes}
                          </div>
                        )}
                      </div>
                      
                      {/* IHO Actions: EDIT and CONTACT */}
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => openEditForm(client)}
                          className="px-3 py-1 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 text-sm"
                          disabled={isLoading}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleContactClient(client)}
                          className="px-3 py-1 text-green-600 border border-green-200 rounded-md hover:bg-green-50 text-sm"
                          disabled={isLoading}
                        >
                          📧 Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Client Form Modal - IHO Operation: ADD */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add New Client</h3>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="border rounded-md px-3 py-2 w-full"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="border rounded-md px-3 py-2 w-full"
                    required
                  />
                </div>
                
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="border rounded-md px-3 py-2 w-full"
                  required
                />
                
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="border rounded-md px-3 py-2 w-full"
                />
                
                <input
                  type="text"
                  placeholder="Company (optional)"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="border rounded-md px-3 py-2 w-full"
                />
                
                <select
                  value={formData.clientType}
                  onChange={(e) => setFormData({...formData, clientType: e.target.value as 'individual' | 'business'})}
                  className="border rounded-md px-3 py-2 w-full"
                  aria-label="Client Type"
                >
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                </select>
                
                <textarea
                  placeholder="Notes (optional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="border rounded-md px-3 py-2 w-full h-20 resize-none"
                />
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Client'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 border border-gray-300 py-2 rounded-md hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Client Form Modal - IHO Operation: EDIT */}
        {showEditForm && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit Client</h3>
              <form onSubmit={handleEditClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="border rounded-md px-3 py-2 w-full"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="border rounded-md px-3 py-2 w-full"
                    required
                  />
                </div>
                
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="border rounded-md px-3 py-2 w-full"
                  required
                />
                
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="border rounded-md px-3 py-2 w-full"
                />
                
                <input
                  type="text"
                  placeholder="Company (optional)"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="border rounded-md px-3 py-2 w-full"
                />
                
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive' | 'lead' | 'archived'})}
                  className="border rounded-md px-3 py-2 w-full"
                  aria-label="Client Status"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="lead">Lead</option>
                  <option value="archived">Archived</option>
                </select>
                
                <textarea
                  placeholder="Notes (optional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="border rounded-md px-3 py-2 w-full h-20 resize-none"
                />
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Client'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false)
                      setSelectedClient(null)
                    }}
                    className="flex-1 border border-gray-300 py-2 rounded-md hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
