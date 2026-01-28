// Protected by middleware (admin-only access)
// src/app/firmsync/admin/settings/page.tsx
// FirmSync platform-wide admin settings

'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'FirmSync',
    defaultTheme: 'professional',
    allowCustomBranding: true,
    enableMultiTenant: true,
    defaultAIProvider: 'openai',
    maxTenantsPerAdmin: 50,
    enableAnalytics: true,
    maintenanceMode: false
  });

  const [onboardingSettings, setOnboardingSettings] = useState({
    enableAutoSetup: true,
    requireAPIKeyUpfront: false,
    defaultWelcomeEmail: true,
    skipTrialPeriod: false,
    autoGenerateCredentials: true,
    enableGuestPreview: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    enforceSSO: false,
    requireMFA: false,
    sessionTimeout: 480, // minutes
    passwordComplexity: 'medium',
    enableIPWhitelist: false,
    auditLogging: true
  });

  const updatePlatformSetting = (key: string, value: unknown) => {
    setPlatformSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateOnboardingSetting = (key: string, value: unknown) => {
    setOnboardingSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateSecuritySetting = (key: string, value: unknown) => {
  const updateSecuritySetting = (key: string, value: string | boolean | number) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveAllSettings = async () => {
    // TODO: Save to Supabase
    // const { data, error } = await supabase
    //   .from('platform_settings')
    //   .upsert({
    //     platform_config: platformSettings,
    //     onboarding_config: onboardingSettings,
    //     security_config: securitySettings
    //   });
    
    alert('Platform settings saved! (Placeholder)');
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
            <p className="text-gray-600 mt-1">Configure FirmSync platform-wide preferences and system settings</p>
          </div>
          <button
            onClick={saveAllSettings}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save All Settings
          </button>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <span className="text-yellow-500 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-1">
                Enhanced Settings Coming Soon
              </h3>
              <p className="text-yellow-700">
                Advanced platform configuration, white-labeling options, and enterprise features will be available in the next release.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Platform Configuration</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Platform Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={platformSettings.platformName}
                  onChange={(e) => updatePlatformSetting('platformName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Default Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Theme
                </label>
                <select
                  value={platformSettings.defaultTheme}
                  onChange={(e) => updatePlatformSetting('defaultTheme', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="professional">Professional</option>
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              {/* Max Tenants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tenants per Admin
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={platformSettings.maxTenantsPerAdmin}
                  onChange={(e) => updatePlatformSetting('maxTenantsPerAdmin', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* AI Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default AI Provider
                </label>
                <select
                  value={platformSettings.defaultAIProvider}
                  onChange={(e) => updatePlatformSetting('defaultAIProvider', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="azure">Azure OpenAI</option>
                  <option value="custom">Custom Endpoint</option>
                </select>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Feature Toggles</h4>
              <div className="space-y-3">
                {[
                  { key: 'allowCustomBranding', label: 'Allow Custom Branding', description: 'Let tenants customize their portal branding' },
                  { key: 'enableMultiTenant', label: 'Enable Multi-Tenant Mode', description: 'Support multiple tenants per vertical' },
                  { key: 'enableAnalytics', label: 'Enable Analytics', description: 'Track usage and performance metrics' },
                  { key: 'maintenanceMode', label: 'Maintenance Mode', description: 'Put platform in maintenance mode' }
                ].map(setting => (
                  <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.description}</div>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={platformSettings[setting.key as keyof typeof platformSettings] as boolean}
                        onChange={(e) => updatePlatformSetting(setting.key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Onboarding Configuration</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {[
                { key: 'enableAutoSetup', label: 'Enable Auto Setup', description: 'Automatically set up tenant portals upon creation' },
                { key: 'requireAPIKeyUpfront', label: 'Require API Key Upfront', description: 'Require OpenAI API key during firm registration' },
                { key: 'defaultWelcomeEmail', label: 'Send Welcome Email', description: 'Automatically send welcome email to new tenants' },
                { key: 'skipTrialPeriod', label: 'Skip Trial Period', description: 'Skip trial period for new tenants' },
                { key: 'autoGenerateCredentials', label: 'Auto-Generate Credentials', description: 'Automatically create login credentials for new firms' },
                { key: 'enableGuestPreview', label: 'Enable Guest Preview', description: 'Allow preview of portals without authentication' }
              ].map(setting => (
                <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{setting.label}</div>
                    <div className="text-sm text-gray-600">{setting.description}</div>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={onboardingSettings[setting.key as keyof typeof onboardingSettings] as boolean}
                      onChange={(e) => updateOnboardingSetting(setting.key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Security Configuration</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Session Timeout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="30"
                  max="1440"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Password Complexity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Complexity
                </label>
                <select
                  value={securitySettings.passwordComplexity}
                  onChange={(e) => updateSecuritySetting('passwordComplexity', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            {/* Security Toggles */}
            <div className="space-y-3">
              {[
                { key: 'enforceSSO', label: 'Enforce SSO', description: 'Require single sign-on for all users' },
                { key: 'requireMFA', label: 'Require MFA', description: 'Require multi-factor authentication' },
                { key: 'enableIPWhitelist', label: 'Enable IP Whitelist', description: 'Restrict access to whitelisted IP addresses' },
                { key: 'auditLogging', label: 'Audit Logging', description: 'Log all admin actions for compliance' }
              ].map(setting => (
                <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{setting.label}</div>
                    <div className="text-sm text-gray-600">{setting.description}</div>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={securitySettings[setting.key as keyof typeof securitySettings] as boolean}
                      onChange={(e) => updateSecuritySetting(setting.key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Platform Version</div>
              <div className="text-gray-600">FirmSync v1.0.0</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Database</div>
              <div className="text-gray-600">Supabase PostgreSQL</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Environment</div>
              <div className="text-gray-600">Development</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
