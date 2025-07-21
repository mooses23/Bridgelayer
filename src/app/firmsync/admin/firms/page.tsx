// Protected by middleware (admin-only access)
// src/app/firmsync/admin/firms/page.tsx
// Firm onboarding form, tenant credentials management

'use client';

import { useState } from 'react';

interface Firm {
  id: number;
  name: string;
  lawType: string;
  city: string;
  state: string;
  primaryContact: string;
  email: string;
  createdAt: string;
  tenantId: string;
  credentials: {
    username: string;
    tempPassword: string;
  };
}

export default function FirmsPage() {
  const [showForm, setShowForm] = useState(false);
  const [newFirm, setNewFirm] = useState({
    name: '',
    lawType: '',
    subTypes: [],
    city: '',
    state: '',
    primaryContact: '',
    email: '',
    phone: '',
    openaiApiKey: '',
    logo: null
  });
  const [firms, setFirms] = useState<Firm[]>([
    // Sample data - would come from Supabase
    {
      id: 1,
      name: 'Smith & Associates Legal',
      lawType: 'Corporate Law',
      city: 'San Francisco',
      state: 'CA',
      primaryContact: 'John Smith',
      email: 'john@smithlegal.com',
      createdAt: '2025-01-15',
      tenantId: 'FS-2025-abc123',
      credentials: {
        username: 'admin@smithlegal',
        tempPassword: 'TempPass123!'
      }
    }
  ]);
  const [recentlyCreated, setRecentlyCreated] = useState<Firm | null>(null);

  const lawTypes = [
    'Corporate Law',
    'Personal Injury',
    'Family Law',
    'Criminal Defense',
    'Real Estate Law',
    'Employment Law',
    'Immigration Law',
    'Intellectual Property',
    'Tax Law',
    'Estate Planning',
    'Other'
  ];

  const subTypesByLawType = {
    'Corporate Law': ['Mergers & Acquisitions', 'Securities', 'Corporate Governance', 'Commercial Contracts'],
    'Personal Injury': ['Auto Accidents', 'Medical Malpractice', 'Slip & Fall', 'Product Liability'],
    'Family Law': ['Divorce', 'Child Custody', 'Adoption', 'Prenuptials'],
    'Criminal Defense': ['DUI/DWI', 'White Collar', 'Drug Offenses', 'Violent Crimes'],
    // Add more as needed
  };

  const generateTenantId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return `FS-${timestamp}-${random}`;
  };

  const generateCredentials = (firmName: string) => {
    const cleanName = firmName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = `admin@${cleanName}`;
    const tempPassword = `Temp${Math.random().toString(36).substr(2, 8)}!`;
    return { username, tempPassword };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate tenant ID and credentials
    const tenantId = generateTenantId();
    const credentials = generateCredentials(newFirm.name);
    
    const firmData: Firm = {
      id: Date.now(), // In real app, this would come from DB
      name: newFirm.name,
      lawType: newFirm.lawType,
      city: newFirm.city,
      state: newFirm.state,
      primaryContact: newFirm.primaryContact,
      email: newFirm.email,
      createdAt: new Date().toISOString().split('T')[0],
      tenantId,
      credentials
    };

    // TODO: Save to Supabase
    // const { data, error } = await supabase.from('tenants').insert([firmData]);
    
    setFirms([firmData, ...firms]);
    setRecentlyCreated(firmData);
    setShowForm(false);
    setNewFirm({
      name: '',
      lawType: '',
      subTypes: [],
      city: '',
      state: '',
      primaryContact: '',
      email: '',
      phone: '',
      openaiApiKey: '',
      logo: null
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Firm Management</h2>
            <p className="text-gray-600 mt-1">Create and manage law firm tenant portals</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <span className="mr-2">+</span>
            Add Firm
          </button>
        </div>

        {/* Recently Created Firm Alert */}
        {recentlyCreated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <span className="text-green-500 text-xl mr-3">✅</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Firm Created Successfully!
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-700"><strong>Firm:</strong> {recentlyCreated.name}</p>
                    <p className="text-green-700"><strong>Tenant ID:</strong> {recentlyCreated.tenantId}</p>
                  </div>
                  <div>
                    <p className="text-green-700"><strong>Username:</strong> {recentlyCreated.credentials.username}</p>
                    <p className="text-green-700"><strong>Temp Password:</strong> {recentlyCreated.credentials.tempPassword}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRecentlyCreated(null)}
                  className="mt-3 text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Firm Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Law Firm</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Firm Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firm Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirm.name}
                    onChange={(e) => setNewFirm({...newFirm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Smith & Associates Legal"
                  />
                </div>

                {/* Type of Law */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Practice Area *
                  </label>
                  <select
                    required
                    value={newFirm.lawType}
                    onChange={(e) => setNewFirm({...newFirm, lawType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select practice area</option>
                    {lawTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirm.city}
                    onChange={(e) => setNewFirm({...newFirm, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., San Francisco"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirm.state}
                    onChange={(e) => setNewFirm({...newFirm, state: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., CA"
                  />
                </div>

                {/* Primary Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Contact *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirm.primaryContact}
                    onChange={(e) => setNewFirm({...newFirm, primaryContact: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., John Smith"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newFirm.email}
                    onChange={(e) => setNewFirm({...newFirm, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., contact@firm.com"
                  />
                </div>
              </div>

              {/* OpenAI API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firm's OpenAI API Key
                </label>
                <input
                  type="password"
                  value={newFirm.openaiApiKey}
                  onChange={(e) => setNewFirm({...newFirm, openaiApiKey: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="sk-..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Provide the firm's OpenAI API key for AI features, or they can add it later
                </p>
              </div>

              {/* Logo Upload Placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firm Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <span className="text-2xl mb-2 block">📁</span>
                  <p className="text-gray-600">Logo upload coming soon</p>
                  <button type="button" className="mt-2 text-blue-600 hover:text-blue-800 font-medium">
                    Choose File (Placeholder)
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Firm
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Firms Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Firms</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Firm Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Practice Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant ID
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
                        <div className="text-sm text-gray-500">{firm.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {firm.lawType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {firm.city}, {firm.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {firm.tenantId}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {firm.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a 
                        href={`/firmsync/${firm.tenantId}/dashboard`}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                      >
                        View Portal
                      </a>
                      <button className="text-gray-600 hover:text-gray-800">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
