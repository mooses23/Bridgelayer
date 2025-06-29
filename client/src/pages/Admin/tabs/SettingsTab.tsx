import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Globe,
  Key,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Lock,
  Server,
  Cloud
} from 'lucide-react';

interface SystemSetting {
  key: string;
  name: string;
  description: string;
  value: string | boolean;
  type: 'text' | 'boolean' | 'number' | 'select';
  options?: string[];
  category: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([
    // Platform Settings
    {
      key: 'platform_name',
      name: 'Platform Name',
      description: 'Display name for the platform',
      value: 'BridgeLayer',
      type: 'text',
      category: 'platform'
    },
    {
      key: 'maintenance_mode',
      name: 'Maintenance Mode',
      description: 'Enable maintenance mode to prevent user access',
      value: false,
      type: 'boolean',
      category: 'platform'
    },
    {
      key: 'registration_enabled',
      name: 'New Registrations',
      description: 'Allow new firm registrations',
      value: true,
      type: 'boolean',
      category: 'platform'
    },
    
    // Security Settings
    {
      key: 'session_timeout',
      name: 'Session Timeout',
      description: 'Session timeout in minutes',
      value: '240',
      type: 'number',
      category: 'security'
    },
    {
      key: 'password_min_length',
      name: 'Minimum Password Length',
      description: 'Minimum required password length',
      value: '8',
      type: 'number',
      category: 'security'
    },
    {
      key: 'two_factor_required',
      name: 'Require 2FA',
      description: 'Require two-factor authentication for admin accounts',
      value: true,
      type: 'boolean',
      category: 'security'
    },
    
    // Email Settings
    {
      key: 'smtp_host',
      name: 'SMTP Host',
      description: 'Email server hostname',
      value: 'smtp.gmail.com',
      type: 'text',
      category: 'email'
    },
    {
      key: 'smtp_port',
      name: 'SMTP Port',
      description: 'Email server port',
      value: '587',
      type: 'number',
      category: 'email'
    },
    {
      key: 'email_notifications',
      name: 'Email Notifications',
      description: 'Send system notifications via email',
      value: true,
      type: 'boolean',
      category: 'email'
    },
    
    // Database Settings
    {
      key: 'backup_frequency',
      name: 'Backup Frequency',
      description: 'Automatic database backup schedule',
      value: 'daily',
      type: 'select',
      options: ['hourly', 'daily', 'weekly'],
      category: 'database'
    },
    {
      key: 'data_retention',
      name: 'Data Retention',
      description: 'How long to keep deleted records (days)',
      value: '90',
      type: 'number',
      category: 'database'
    }
  ]);

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ));
    setUnsavedChanges(true);
  };

  const saveSettings = () => {
    // Here you would save to your backend
    console.log('Saving settings:', settings);
    setUnsavedChanges(false);
  };

  const resetSettings = () => {
    // Reset to default values
    setUnsavedChanges(false);
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(setting => setting.category === category);
  };

  const renderSettingControl = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value as boolean}
            onCheckedChange={(checked) => updateSetting(setting.key, checked)}
          />
        );
      case 'select':
        return (
          <select
            value={setting.value as string}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <Input
            type={setting.type}
            value={setting.value as string}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="max-w-xs"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure platform-wide settings and system behavior.
          </p>
        </div>
        
        <div className="flex space-x-2">
          {unsavedChanges && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={resetSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={!unsavedChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="platform" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Platform</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Database</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>Monitoring</span>
          </TabsTrigger>
        </TabsList>

        {/* Platform Settings */}
        <TabsContent value="platform" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Platform Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory('platform').map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">{setting.name}</Label>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      {renderSettingControl(setting)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">Platform Status</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Server className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Server Health</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Cloud className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Cloud Services</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory('security').map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">{setting.name}</Label>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      {renderSettingControl(setting)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        SSL Certificate Expiring
                      </p>
                      <p className="text-sm text-yellow-700">
                        Certificate expires in 30 days
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 border border-green-200 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Security Scan Complete
                      </p>
                      <p className="text-sm text-green-700">
                        No vulnerabilities detected
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Email Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory('email').map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">{setting.name}</Label>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      {renderSettingControl(setting)}
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <Button variant="outline" className="w-full">
                    Test Email Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Welcome Email',
                    'Password Reset',
                    'Firm Onboarding',
                    'System Notifications',
                    'Billing Reminders'
                  ].map((template) => (
                    <div key={template} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">{template}</span>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Database Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory('database').map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">{setting.name}</Label>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      {renderSettingControl(setting)}
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-2">
                  <Button variant="outline" className="w-full">
                    Create Manual Backup
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Backup History
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Database Size</span>
                    <span className="text-sm text-gray-600">2.4 GB</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Records</span>
                    <span className="text-sm text-gray-600">1,247,853</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Last Backup</span>
                    <span className="text-sm text-gray-600">2 hours ago</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Connection Pool</span>
                    <span className="text-sm text-gray-600">8/20 active</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <Badge className="bg-green-100 text-green-800">
                      Database Healthy
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitoring Settings */}
        <TabsContent value="monitoring" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5" />
                  <span>Monitoring & Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Error Rate Alerts</Label>
                    <p className="text-sm text-gray-600">Alert when error rate exceeds threshold</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Performance Monitoring</Label>
                    <p className="text-sm text-gray-600">Monitor response times and throughput</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Resource Usage Alerts</Label>
                    <p className="text-sm text-gray-600">Alert on high CPU/memory usage</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Log Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Log Level</span>
                    <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                      <option>INFO</option>
                      <option>WARN</option>
                      <option>ERROR</option>
                      <option>DEBUG</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Retention Period</span>
                    <span className="text-sm text-gray-600">30 days</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Log Size</span>
                    <span className="text-sm text-gray-600">1.2 GB</span>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <Button variant="outline" className="w-full" size="sm">
                      Download Logs
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      Clear Old Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
