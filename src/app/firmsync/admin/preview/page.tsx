// Protected by middleware (admin-only access)
// src/app/firmsync/admin/preview/page.tsx
// Real-time visual preview of tenant portal and final onboarding step

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPreviewPage() {
  const [selectedTenant, setSelectedTenant] = useState('demo-firm');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showConfigPanel, setShowConfigPanel] = useState(true);

  // Sample tenant data - would come from Supabase JSONB
  const tenantConfig = {
    firmName: 'Demo Law Firm',
    tenantId: 'demo-firm',
    theme: 'professional',
    branding: {
      primaryColor: '#2563eb',
      logo: null
    },
    integrations: {
      clients: ['salesforce'],
      cases: ['clio'],
      billing: ['quickbooks'],
      calendar: ['outlook']
    },
    aiAgents: {
      clients: 'client-specialist',
      cases: 'case-manager',
      billing: 'billing-specialist'
    },
    isComplete: true
  };

  const launchPortal = async () => {
    // TODO: Submit entire onboarding config payload to Supabase
    // const { data, error } = await supabase
    //   .from('tenant_portals')
    //   .upsert({
    //     tenant_id: selectedTenant,
    //     config: tenantConfig,
    //     status: 'live'
    //   });
    
    alert(`Portal launched for ${tenantConfig.firmName}! (Placeholder)`);
  };

  const previewUrl = `/firmsync/${selectedTenant}/dashboard`;

  return (
    <div className="p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Portal Preview</h2>
            <p className="text-gray-600 mt-1">Real-time preview of tenant portal configuration</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              {showConfigPanel ? 'Hide Config' : 'Show Config'}
            </button>
            {tenantConfig.isComplete && (
              <button
                onClick={launchPortal}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
              >
                <span className="mr-2">🚀</span>
                Launch Portal
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Configuration Panel */}
          {showConfigPanel && (
            <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Configuration</h3>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Tenant Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Tenant
                  </label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="demo-firm">Demo Law Firm</option>
                    <option value="smith-associates">Smith & Associates</option>
                    <option value="jones-legal">Jones Legal Group</option>
                  </select>
                </div>

                {/* Current Configuration Summary */}
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Firm Details</div>
                    <div className="text-sm text-gray-600">
                      {tenantConfig.firmName} ({tenantConfig.tenantId})
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700">Theme</div>
                    <div className="text-sm text-gray-600 capitalize">{tenantConfig.theme}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700">Integrations</div>
                    <div className="text-sm text-gray-600">
                      {Object.values(tenantConfig.integrations).flat().length} configured
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700">AI Agents</div>
                    <div className="text-sm text-gray-600">
                      {Object.keys(tenantConfig.aiAgents).length} tabs configured
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions</div>
                  <div className="space-y-2">
                    <Link
                      href="/firmsync/admin/firms"
                      className="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      ← Edit Firm Details
                    </Link>
                    <Link
                      href="/firmsync/admin/integrations"
                      className="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      ← Configure Integrations
                    </Link>
                    <Link
                      href="/firmsync/admin/llm"
                      className="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      ← Setup AI Agents
                    </Link>
                  </div>
                </div>

                {/* Configuration Status */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${
                      tenantConfig.isComplete ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></span>
                    <span className="text-sm font-medium text-gray-700">
                      {tenantConfig.isComplete ? 'Ready to Launch' : 'Configuration Incomplete'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Area */}
          <div className="flex-1">
            {/* Preview Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Preview Size:</span>
                  <div className="flex items-center space-x-2">
                    {[
                      { mode: 'desktop', icon: '🖥️', label: 'Desktop' },
                      { mode: 'tablet', icon: '📱', label: 'Tablet' },
                      { mode: 'mobile', icon: '📲', label: 'Mobile' }
                    ].map((option) => (
                      <button
                        key={option.mode}
                        onClick={() => setPreviewMode(option.mode as 'desktop' | 'tablet' | 'mobile')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          previewMode === option.mode
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option.icon} {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Preview URL: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{previewUrl}</code>
                  </span>
                  <Link
                    href={previewUrl}
                    target="_blank"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Open in New Tab
                  </Link>
                </div>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className={`mx-auto bg-gray-100 rounded-lg overflow-hidden ${
                previewMode === 'desktop' ? 'w-full h-[800px]' :
                previewMode === 'tablet' ? 'w-3/4 h-[600px]' :
                'w-1/3 h-[700px]'
              }`}>
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title={`Preview of ${tenantConfig.firmName} Portal`}
                />
              </div>
            </div>

            {/* Launch Instructions */}
            {tenantConfig.isComplete && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <span className="text-green-500 text-xl mr-3">✅</span>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Portal Ready for Launch!
                    </h3>
                    <p className="text-green-700 mb-4">
                      All configuration steps are complete. The portal is ready to go live for {tenantConfig.firmName}.
                    </p>
                    <div className="text-sm text-green-700">
                      <p><strong>What happens when you launch:</strong></p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Portal becomes accessible to firm users</li>
                        <li>All integrations and AI agents are activated</li>
                        <li>Welcome email is sent to firm administrators</li>
                        <li>Analytics and monitoring begin</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
