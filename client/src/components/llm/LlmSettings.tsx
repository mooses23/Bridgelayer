import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Key, Save, Eye, EyeOff, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import llmApi from '@/lib/llmApi';

interface LlmSettingsProps {
  firmId: number;
  userId: number;
}

const LlmSettings: React.FC<LlmSettingsProps> = ({ firmId, userId }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadUsageStats();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await llmApi.getFirmSettings();
      setSettings(data);
      if (data.hasApiKey) {
        setApiKey('••••••••••••••••'); // Masked API key
      }
    } catch (err) {
      setError('Failed to load settings');
    }
  };

  const loadUsageStats = async () => {
    try {
      const data = await llmApi.getFirmUsageStats();
      setUsageStats(data);
    } catch (err) {
      console.error('Failed to load usage stats:', err);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey.startsWith('••')) {
      setError('Please enter a valid API key');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await llmApi.setFirmApiKey(apiKey);
      setSuccess('API key saved successfully');
      setApiKey('••••••••••••••••'); // Mask the key after saving
      setShowApiKey(false);
      await loadSettings(); // Reload settings
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const renderApiKeySection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          OpenAI API Key
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure your firm's OpenAI API key for LLM services. If not provided, 
          the system will use the admin's default key.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showApiKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={handleSaveApiKey} disabled={saving}>
              {saving ? (
                <>
                  <Settings className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {settings?.hasApiKey && (
          <div className="p-3 bg-green-50 rounded">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Active</Badge>
              <span className="text-sm text-green-700">
                Your firm has a configured API key
              </span>
            </div>
          </div>
        )}

        {!settings?.hasApiKey && (
          <div className="p-3 bg-yellow-50 rounded">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-700 font-medium">
                  Using Default Admin Key
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Configure your own API key for better control and billing tracking
                </p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderLlmSettings = () => {
    if (!settings) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            LLM Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Model</label>
              <Input
                value={settings.defaultModel || 'gpt-4'}
                onChange={(e) => handleSettingChange('defaultModel', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Tokens</label>
              <Input
                type="number"
                value={settings.maxTokens || 4000}
                onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Temperature</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={settings.temperature || 0.7}
              onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower values (0.1-0.3) for more focused responses, higher values (0.7-1.0) for more creative responses
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="llm-active"
              checked={settings.isActive !== false}
              onCheckedChange={(checked) => handleSettingChange('isActive', checked)}
            />
            <label htmlFor="llm-active" className="text-sm font-medium">
              Enable LLM Services
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="cache-enabled"
              checked={settings.cacheEnabled !== false}
              onCheckedChange={(checked) => handleSettingChange('cacheEnabled', checked)}
            />
            <label htmlFor="cache-enabled" className="text-sm font-medium">
              Enable Response Caching
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="usage-logging"
              checked={settings.usageLogging !== false}
              onCheckedChange={(checked) => handleSettingChange('usageLogging', checked)}
            />
            <label htmlFor="usage-logging" className="text-sm font-medium">
              Enable Usage Logging
            </label>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderUsageStats = () => {
    if (!usageStats) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {usageStats.totalRequests || 0}
              </div>
              <div className="text-sm text-blue-700">Total Requests</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {usageStats.totalTokens || 0}
              </div>
              <div className="text-sm text-green-700">Total Tokens</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">
                ${(usageStats.totalCost || 0).toFixed(2)}
              </div>
              <div className="text-sm text-yellow-700">Total Cost</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {usageStats.averageResponseTime || 0}s
              </div>
              <div className="text-sm text-purple-700">Avg Response Time</div>
            </div>
          </div>

          {usageStats.monthlyUsage && (
            <div>
              <h4 className="font-semibold mb-3">This Month</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded">
                  <div className="text-lg font-bold">
                    {usageStats.monthlyUsage.requests || 0}
                  </div>
                  <div className="text-sm text-gray-600">Requests</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-lg font-bold">
                    {usageStats.monthlyUsage.tokens || 0}
                  </div>
                  <div className="text-sm text-gray-600">Tokens</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-lg font-bold text-green-600">
                    ${(usageStats.monthlyUsage.cost || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Cost</div>
                </div>
              </div>
            </div>
          )}

          {usageStats.topFunctions && usageStats.topFunctions.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Most Used Functions</h4>
              <div className="space-y-2">
                {usageStats.topFunctions.map((func: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">{func.function_name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{func.usage_count} uses</Badge>
                      <span className="text-sm text-gray-500">
                        ${(func.total_cost || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderBillingInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Billing Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded">
            <h5 className="font-medium mb-2">How Billing Works</h5>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• If you provide your own API key, you'll be billed directly by OpenAI</li>
              <li>• Without an API key, usage is covered by the admin's default key</li>
              <li>• Costs vary by model: GPT-4 (~$0.03/1K tokens), GPT-3.5 (~$0.002/1K tokens)</li>
              <li>• Usage is logged and tracked for your reference</li>
            </ul>
          </div>

          {usageStats?.billingProjection && (
            <div className="p-3 bg-yellow-50 rounded">
              <h5 className="font-medium mb-2">Monthly Projection</h5>
              <p className="text-sm">
                Based on current usage: <strong>${usageStats.billingProjection.toFixed(2)}</strong> per month
              </p>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p>
              <strong>Cost Optimization Tips:</strong>
            </p>
            <ul className="mt-1 space-y-1">
              <li>• Use caching to avoid repeat API calls</li>
              <li>• Choose appropriate models (GPT-3.5 for simpler tasks)</li>
              <li>• Set reasonable token limits</li>
              <li>• Monitor usage regularly</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* API Key Configuration */}
      {renderApiKeySection()}

      {/* LLM Settings */}
      {renderLlmSettings()}

      {/* Usage Statistics */}
      {renderUsageStats()}

      {/* Billing Information */}
      {renderBillingInfo()}
    </div>
  );
};

export default LlmSettings;
