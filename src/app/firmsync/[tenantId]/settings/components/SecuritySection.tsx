// Security Section Component
'use client'

import { useState, useEffect } from 'react'
import { SecuritySettings } from '@/types/settings'

interface SecuritySectionProps {
  security: SecuritySettings
  onSave: (security: SecuritySettings) => Promise<void>
  isSaving: boolean
}

export default function SecuritySection({
  security,
  onSave,
  isSaving,
}: SecuritySectionProps) {
  const [formData, setFormData] = useState<SecuritySettings>(security)
  const [showIpWhitelistInput, setShowIpWhitelistInput] = useState(false)
  const [newIpAddress, setNewIpAddress] = useState('')

  // Constants
  const DEFAULT_SESSION_TIMEOUT = 30

  useEffect(() => {
    setFormData(security)
  }, [security])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  const handleAddIpAddress = () => {
    if (newIpAddress && !formData.ipWhitelist?.includes(newIpAddress)) {
      setFormData({
        ...formData,
        ipWhitelist: [...(formData.ipWhitelist || []), newIpAddress],
      })
      setNewIpAddress('')
      setShowIpWhitelistInput(false)
    }
  }

  const handleRemoveIpAddress = (ip: string) => {
    setFormData({
      ...formData,
      ipWhitelist: formData.ipWhitelist?.filter((item) => item !== ip),
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure security and access control settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two-Factor Authentication */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium text-gray-900">
                🔐 Two-Factor Authentication
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.twoFactorAuth}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    twoFactorAuth: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {formData.twoFactorAuth && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✓ Two-factor authentication is enabled. Users will be required to
                enter a verification code when logging in.
              </p>
            </div>
          )}
        </div>

        {/* Session Timeout */}
        <div className="border rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            ⏱️ Session Timeout
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Automatically log out users after a period of inactivity
          </p>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="5"
              max="1440"
              value={formData.sessionTimeout}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sessionTimeout: parseInt(e.target.value) || DEFAULT_SESSION_TIMEOUT,
                })
              }
              className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">minutes</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Recommended: 30-60 minutes for optimal security
          </p>
        </div>

        {/* IP Whitelist */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-md font-medium text-gray-900">
                🌐 IP Whitelist
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Restrict access to specific IP addresses (optional)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIpWhitelistInput(true)}
              className="px-4 py-2 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 text-sm"
            >
              ➕ Add IP
            </button>
          </div>

          {showIpWhitelistInput && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP Address
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newIpAddress}
                  onChange={(e) => setNewIpAddress(e.target.value)}
                  placeholder="192.168.1.1"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddIpAddress}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowIpWhitelistInput(false)
                    setNewIpAddress('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {formData.ipWhitelist && formData.ipWhitelist.length > 0 ? (
            <div className="space-y-2">
              {formData.ipWhitelist.map((ip) => (
                <div
                  key={ip}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span className="text-sm text-gray-900 font-mono">{ip}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIpAddress(ip)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    🗑️ Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 py-3">
              No IP restrictions configured. All IPs are allowed.
            </p>
          )}
          <p className="text-xs text-gray-500 mt-3">
            ⚠️ Be careful: Adding IP restrictions may lock out users if not
            configured correctly.
          </p>
        </div>

        {/* Password Policy */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            🔑 Password Policy
          </h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Minimum 8 characters
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              At least one uppercase letter
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              At least one number
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              At least one special character
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Password policy is enforced system-wide and cannot be customized per
            tenant.
          </p>
        </div>

        {/* Audit Log */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h4 className="text-md font-medium text-gray-900 mb-2">
            📋 Security Audit Log
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Track all security-related events and user activities
          </p>
          <button
            type="button"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
          >
            View Audit Log
          </button>
        </div>

        <div className="pt-6 border-t">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isSaving ? 'Saving Changes...' : 'Save Security Settings'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">
          ⚠️ Security Best Practices
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Enable two-factor authentication for all admin users</li>
          <li>• Review user access regularly and remove inactive users</li>
          <li>• Use strong, unique passwords for all accounts</li>
          <li>• Keep session timeout between 30-60 minutes</li>
          <li>• Monitor the audit log for suspicious activity</li>
        </ul>
      </div>
    </div>
  )
}
