// Notifications Section Component
'use client'

import { useState, useEffect } from 'react'
import { NotificationSettings } from '@/types/settings'

interface NotificationsSectionProps {
  notifications: NotificationSettings
  onSave: (notifications: NotificationSettings) => Promise<void>
  isSaving: boolean
}

export default function NotificationsSection({
  notifications,
  onSave,
  isSaving,
}: NotificationsSectionProps) {
  const [formData, setFormData] = useState<NotificationSettings>(notifications)

  useEffect(() => {
    setFormData(notifications)
  }, [notifications])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  const notificationTypes = [
    { id: 'case_update', label: 'Case Updates', description: 'Status changes and milestones' },
    { id: 'new_client', label: 'New Clients', description: 'When a new client is added' },
    { id: 'deadline_reminder', label: 'Deadline Reminders', description: 'Upcoming case deadlines' },
    { id: 'document_signed', label: 'Document Signed', description: 'When documents are signed' },
    { id: 'payment_received', label: 'Payments', description: 'Payment confirmations' },
    { id: 'team_mention', label: 'Team Mentions', description: 'When someone mentions you' },
  ]

  const handleToggleEmailType = (typeId: string) => {
    const currentTypes = formData.email.types || []
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter((t) => t !== typeId)
      : [...currentTypes, typeId]

    setFormData({
      ...formData,
      email: {
        ...formData.email,
        types: newTypes,
      },
    })
  }

  const handleToggleInAppType = (typeId: string) => {
    const currentTypes = formData.inApp.types || []
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter((t) => t !== typeId)
      : [...currentTypes, typeId]

    setFormData({
      ...formData,
      inApp: {
        ...formData.inApp,
        types: newTypes,
      },
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage how and when you receive notifications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Email Notifications */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-md font-medium text-gray-900">📧 Email Notifications</h4>
              <p className="text-sm text-gray-600 mt-1">
                Receive notifications via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.email.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: {
                      ...formData.email,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {formData.email.enabled && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={formData.email.frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: {
                        ...formData.email,
                        frequency: e.target.value as 'realtime' | 'daily' | 'weekly',
                      },
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="realtime">Real-time (as they happen)</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Summary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Notification Types
                </label>
                <div className="space-y-2">
                  {notificationTypes.map((type) => (
                    <label key={type.id} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.email.types?.includes(type.id) || false}
                        onChange={() => handleToggleEmailType(type.id)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          {type.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {type.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* In-App Notifications */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-md font-medium text-gray-900">🔔 In-App Notifications</h4>
              <p className="text-sm text-gray-600 mt-1">
                Show notifications within the application
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inApp.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inApp: {
                      ...formData.inApp,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {formData.inApp.enabled && (
            <div className="space-y-2 border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Notification Types
              </label>
              {notificationTypes.map((type) => (
                <label key={type.id} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.inApp.types?.includes(type.id) || false}
                    onChange={() => handleToggleInAppType(type.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* SMS Notifications (Optional/Future) */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-md font-medium text-gray-900">📱 SMS Notifications</h4>
              <p className="text-sm text-gray-600 mt-1">
                Receive important notifications via text message
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-gray-600">
            SMS notifications will be available in a future update. Stay tuned!
          </p>
        </div>

        <div className="pt-6 border-t">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isSaving ? 'Saving Changes...' : 'Save Notification Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
