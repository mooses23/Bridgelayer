// Protected by middleware (admin-only access)
// src/app/firmsync/admin/firms/page.tsx
// Firm onboarding form and management with Neon database provisioning

'use client';

import { useState, useEffect } from 'react';

interface Firm {
  id: string;
  name: string;
  slug: string;
  plan_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  connectionStatus?: 'connected' | 'disconnected' | 'error';
}

export default function FirmsPage() {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newFirm, setNewFirm] = useState({
    firmName: '',
    planType: 'basic'
  });
  const [firms, setFirms] = useState<Firm[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load firms on component mount
  useEffect(() => {
    loadFirms();
  }, []);

  const loadFirms = async () => {
    try {
      const response = await fetch('/api/admin/firms');
      const data = await response.json();
      
      if (response.ok) {
        setFirms(data.firms || []);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load firms' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load firms' });
      console.error('Error loading firms:', error);
    }
  };

  const createFirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/firms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFirm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Firm "${newFirm.firmName}" created successfully with dedicated Neon database!` 
        });
        setNewFirm({ firmName: '', planType: 'basic' });
        setShowForm(false);
        loadFirms(); // Reload the list
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create firm' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create firm' });
      console.error('Error creating firm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      provisioning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getConnectionBadge = (connectionStatus?: string) => {
    const styles = {
      connected: 'bg-green-100 text-green-800',
      disconnected: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800'
    };
    
    if (!connectionStatus) return null;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[connectionStatus as keyof typeof styles]}`}>
        DB: {connectionStatus}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Firm Management</h1>
            <p className="text-gray-600 mt-2">
              Manage law firms with dedicated Neon databases. Each firm gets isolated data for AI agents.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add New Firm'}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Create New Firm Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Firm</h2>
            <form onSubmit={createFirm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firm Name
                </label>
                <input
                  type="text"
                  value={newFirm.firmName}
                  onChange={(e) => setNewFirm({ ...newFirm, firmName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Smith & Associates Legal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Type
                </label>
                <select
                  value={newFirm.planType}
                  onChange={(e) => setNewFirm({ ...newFirm, planType: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Creating Firm & Database...' : 'Create Firm'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Firms List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Firms ({firms.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Each firm has its own dedicated Neon database with identical schema
          </p>
        </div>

        {firms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No firms created yet. Click "Add New Firm" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Firm Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Database
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {firms.map((firm) => (
                  <tr key={firm.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{firm.name}</div>
                        <div className="text-sm text-gray-500">ID: {firm.id}</div>
                        <div className="text-sm text-gray-500">Slug: {firm.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-900">{firm.plan_type}</div>
                        {getStatusBadge(firm.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {getConnectionBadge(firm.connectionStatus)}
                        <div className="text-xs text-gray-500">
                          {firm.connectionStatus === 'connected' ? 'Neon DB Active' : 'Check Connection'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(firm.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Test DB
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Architecture Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          🏗️ Multi-Tenant Architecture
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• Each firm gets a dedicated Neon database with identical schema</p>
          <p>• Central Supabase handles authentication and routing</p>
          <p>• LLMs and AI agents only see firm-specific data (complete isolation)</p>
          <p>• Encrypted connection strings with 5-minute connection caching</p>
          <p>• Automatic schema provisioning and management</p>
        </div>
      </div>
    </div>
  );
}
