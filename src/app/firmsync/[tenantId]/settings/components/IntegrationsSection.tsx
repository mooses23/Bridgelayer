// Integrations Section Component
'use client'

import { useState, useEffect } from 'react'
import { IntegrationSettings } from '@/types/settings'

interface IntegrationsSectionProps {
  integrations: IntegrationSettings
  onSave: (integrations: IntegrationSettings) => Promise<void>
  isSaving: boolean
}

export default function IntegrationsSection({
  integrations,
  onSave,
  isSaving,
}: IntegrationsSectionProps) {
  const [formData, setFormData] = useState<IntegrationSettings>(integrations)

  useEffect(() => {
    setFormData(integrations)
  }, [integrations])

  const handleToggleIntegration = (
    module: keyof IntegrationSettings,
    enabled: boolean
  ) => {
    setFormData({
      ...formData,
      [module]: {
        ...formData[module],
        enabled,
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  const integrationModules = [
    {
      key: 'clients' as const,
      name: 'Client Management',
      description: 'Sync client data with external CRM systems',
      icon: '👥',
      providers: ['Clio', 'MyCase', 'PracticePanther', 'Native'],
    },
    {
      key: 'calendar' as const,
      name: 'Calendar & Scheduling',
      description: 'Integrate with calendar services for events and appointments',
      icon: '📅',
      providers: ['Google Calendar', 'Outlook', 'Apple Calendar', 'Native'],
    },
    {
      key: 'billing' as const,
      name: 'Billing & Invoicing',
      description: 'Connect to accounting and billing platforms',
      icon: '💰',
      providers: ['QuickBooks', 'Xero', 'FreshBooks', 'Native'],
    },
    {
      key: 'docsign' as const,
      name: 'Document Signing',
      description: 'Enable electronic signature workflows',
      icon: '✍️',
      providers: ['DocuSign', 'HelloSign', 'Adobe Sign', 'Native'],
    },
  ]

  const getStatusBadge = (enabled: boolean, lastSync?: string) => {
    if (!enabled) {
      return <span className="text-gray-500">Disabled</span>
    }
    if (lastSync) {
      const syncDate = new Date(lastSync)
      const now = new Date()
      const diffMinutes = (now.getTime() - syncDate.getTime()) / (1000 * 60)
      
      if (diffMinutes < 5) {
        return (
          <span className="flex items-center text-green-600">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
            Synced
          </span>
        )
      }
    }
    return (
      <span className="flex items-center text-blue-600">
        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
        Active
      </span>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
        <p className="text-sm text-gray-600 mt-1">
          Connect third-party services to extend FirmSync capabilities
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {integrationModules.map((module) => {
            const integration = formData[module.key]
            return (
              <div
                key={module.key}
                className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{module.icon}</div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {module.name}
                      </h4>
                      <p className="text-sm text-gray-600">{module.description}</p>
                      {integration && (
                        <div className="mt-2">
                          {getStatusBadge(integration.enabled, integration.lastSync)}
                        </div>
                      )}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integration?.enabled || false}
                      onChange={(e) =>
                        handleToggleIntegration(module.key, e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {integration?.enabled && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provider
                      </label>
                      <select
                        value={integration.provider || 'Native'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [module.key]: {
                              ...integration,
                              provider: e.target.value,
                            },
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {module.providers.map((provider) => (
                          <option key={provider} value={provider}>
                            {provider}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mode
                      </label>
                      <select
                        value={integration.mode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [module.key]: {
                              ...integration,
                              mode: e.target.value as
                                | 'native'
                                | 'integration'
                                | 'hybrid',
                            },
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="native">Native (FirmSync only)</option>
                        <option value="integration">
                          Integration (External provider only)
                        </option>
                        <option value="hybrid">
                          Hybrid (Sync between both)
                        </option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {integration.mode === 'native' &&
                          'Data stored only in FirmSync'}
                        {integration.mode === 'integration' &&
                          'Data managed by external provider'}
                        {integration.mode === 'hybrid' &&
                          'Data synced between FirmSync and external provider'}
                      </p>
                    </div>

                    {integration.provider && integration.provider !== 'Native' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Configuration Required:</strong> Complete the OAuth
                          flow or API key setup for {integration.provider} to enable
                          sync.
                        </p>
                        <button
                          type="button"
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                          Configure {integration.provider}
                        </button>
                      </div>
                    )}

                    {integration.lastSync && (
                      <div className="text-sm text-gray-600">
                        Last synced:{' '}
                        {new Date(integration.lastSync).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isSaving ? 'Saving Changes...' : 'Save Integration Settings'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Need a custom integration?
        </h4>
        <p className="text-sm text-gray-600">
          Contact our support team to discuss custom integration options for your
          firm's specific needs.
        </p>
      </div>
    </div>
  )
}
