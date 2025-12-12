// User Management Section Component
'use client'

import { useState } from 'react'
import { User, UserManagementSettings } from '@/types/settings'

interface UserManagementSectionProps {
  users: User[]
  settings: UserManagementSettings
  tenantId: string
  onRefresh: () => void
  onSave: (settings: UserManagementSettings) => Promise<void>
  isSaving: boolean
}

export default function UserManagementSection({
  users,
  settings,
  tenantId,
  onRefresh,
  onSave,
  isSaving,
}: UserManagementSectionProps) {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'tenant_admin' | 'tenant_user'>('tenant_user')
  const [isInviting, setIsInviting] = useState(false)
  const [formSettings, setFormSettings] = useState(settings)

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInviting(true)
    try {
      const response = await fetch(`/api/firmsync/${tenantId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to invite user')
      }

      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('tenant_user')
      onRefresh()
    } catch (error) {
      console.error('Failed to invite user:', error)
      alert('Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/firmsync/${tenantId}/users?userId=${userId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to remove user')
      }

      onRefresh()
    } catch (error) {
      console.error('Failed to remove user:', error)
      alert('Failed to remove user')
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formSettings)
    setShowSettingsModal(false)
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      tenant_admin: 'bg-green-100 text-green-800',
      tenant_user: 'bg-gray-100 text-gray-800',
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {role.replace('_', ' ')}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage team members and their access permissions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ➕ Invite User
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No users found. Invite your first team member!</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      {user.displayName}
                    </h4>
                    {getRoleBadge(user.role)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Email: {user.email}</p>
                    <p>Joined: {formatDate(user.createdAt)}</p>
                    {user.lastLogin && (
                      <p>Last login: {formatDate(user.lastLogin)}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="px-3 py-1 text-red-600 border border-red-200 rounded-md hover:bg-red-50 text-sm"
                  disabled={user.role === 'super_admin'}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Invite User</h3>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as 'tenant_admin' | 'tenant_user')
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tenant_user">User</option>
                  <option value="tenant_admin">Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Admins can manage settings and users
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={isInviting}
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-md hover:bg-gray-50"
                  disabled={isInviting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">User Management Settings</h3>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formSettings.allowUserInvites}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        allowUserInvites: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Allow users to invite others
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formSettings.requireEmailVerification}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        requireEmailVerification: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Require email verification
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Role for New Users
                </label>
                <select
                  value={formSettings.defaultRole}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      defaultRole: e.target.value as 'tenant_admin' | 'tenant_user',
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tenant_user">User</option>
                  <option value="tenant_admin">Admin</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-md hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
