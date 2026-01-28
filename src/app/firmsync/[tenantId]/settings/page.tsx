// src/app/firmsync/[tenantId]/settings/page.tsx
// Tenant configuration and preferences - User management, firm settings, and system configuration

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { TenantSettings, FirmProfile, User } from '@/types/settings'
import FirmProfileSection from './components/FirmProfileSection'
import UserManagementSection from './components/UserManagementSection'
import IntegrationsSection from './components/IntegrationsSection'
import NotificationsSection from './components/NotificationsSection'
import SecuritySection from './components/SecuritySection'

interface SettingsData {
  tenant: {
    id: number
    name: string
    subdomain: string
  }
  settings: TenantSettings
}

export default function SettingsPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'integrations' | 'notifications' | 'security'>('profile')
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Constants
  const MESSAGE_DISMISS_TIMEOUT = 3000

  // Load settings on mount
  useEffect(() => {
    loadSettings()
    if (activeTab === 'users') {
      loadUsers()
    }
  }, [tenantId, activeTab])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/firmsync/${tenantId}/settings`)
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      const data = await response.json()
      if (data.success) {
        setSettingsData(data)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch(`/api/firmsync/${tenantId}/users`)
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      setMessage({ type: 'error', text: 'Failed to load users' })
    }
  }

  const handleSaveSettings = async (updatedSettings: Partial<TenantSettings>) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/firmsync/${tenantId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: updatedSettings }),
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' })
        await loadSettings()
        setTimeout(() => setMessage(null), MESSAGE_DISMISS_TIMEOUT)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Firm Profile', icon: '🏢' },
    { id: 'users', name: 'User Management', icon: '👥' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'security', name: 'Security', icon: '🔒' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your firm&apos;s preferences and system settings</p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="ml-4 underline text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Settings tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        ) : settingsData ? (
          <div className="bg-white rounded-lg shadow">
            {activeTab === 'profile' && (
              <FirmProfileSection
                firmProfile={settingsData.settings.firmProfile}
                tenantName={settingsData.tenant.name}
                onSave={(profile) => handleSaveSettings({ firmProfile: profile })}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'users' && (
              <UserManagementSection
                users={users}
                settings={settingsData.settings.userManagement}
                tenantId={tenantId}
                onRefresh={loadUsers}
                onSave={(settings) => handleSaveSettings({ userManagement: settings })}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'integrations' && (
              <IntegrationsSection
                integrations={settingsData.settings.integrations}
                onSave={(integrations) => handleSaveSettings({ integrations })}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'notifications' && (
              <NotificationsSection
                notifications={settingsData.settings.notifications}
                onSave={(notifications) => handleSaveSettings({ notifications })}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'security' && (
              <SecuritySection
                security={settingsData.settings.security}
                onSave={(security) => handleSaveSettings({ security })}
                isSaving={isSaving}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Failed to load settings</p>
          </div>
        )}
      </div>
    </div>
  )
}
