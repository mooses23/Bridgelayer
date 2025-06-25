import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Database,
  Users,
  Key,
  Mail
} from "lucide-react";
import { setFirmApiKey, getFirmUsageStats, getFirmSettings, LlmSettings } from '@/lib/llmApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    documentReview: true,
    billingReminders: true,
    systemUpdates: false
  });

  const [firmSettings, setFirmSettings] = useState({
    firmName: "Smith & Associates Law Firm",
    address: "123 Legal Street, Los Angeles, CA 90210",
    phone: "(555) 123-4567",
    email: "contact@smithlaw.com",
    website: "www.smithlaw.com"
  });

  const [apiKey, setApiKey] = useState('');
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<LlmSettings | null>({
    queryKey: ['llmSettings'],
    queryFn: () => getFirmSettings(),
  });

  const { data: usage } = useQuery<{ currentMonthUsage: number; monthlyTokenLimit: number } | null>({
    queryKey: ['firmUsageStats'],
    queryFn: () => getFirmUsageStats(),
  });

  const { mutate: saveApiKey } = useMutation({
    mutationFn: (newKey: string) => setFirmApiKey(newKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llmSettings'] });
      queryClient.invalidateQueries({ queryKey: ['firmUsageStats'] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your firm settings and preferences</p>
        </div>
        <SettingsIcon className="w-8 h-8 text-blue-600" />
      </div>

      <Tabs defaultValue="firm" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="firm">Firm Profile</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="llm">AI & LLM</TabsTrigger>
        </TabsList>

        <TabsContent value="firm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Firm Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firmName">Firm Name</Label>
                  <Input
                    id="firmName"
                    value={firmSettings.firmName}
                    onChange={(e) => setFirmSettings(prev => ({ ...prev, firmName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={firmSettings.email}
                    onChange={(e) => setFirmSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={firmSettings.phone}
                    onChange={(e) => setFirmSettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={firmSettings.website}
                    onChange={(e) => setFirmSettings(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={firmSettings.address}
                  onChange={(e) => setFirmSettings(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button>Save Firm Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">John Smith</h4>
                      <p className="text-sm text-gray-600">Managing Partner</p>
                      <p className="text-xs text-gray-500">john@smithlaw.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Admin</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Sarah Johnson</h4>
                      <p className="text-sm text-gray-600">Senior Associate</p>
                      <p className="text-xs text-gray-500">sarah@smithlaw.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Attorney</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Michael Brown</h4>
                      <p className="text-sm text-gray-600">Paralegal</p>
                      <p className="text-xs text-gray-500">michael@smithlaw.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">Staff</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4">
                <Users className="w-4 h-4 mr-2" />
                Invite Team Member
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Alerts</h4>
                  <p className="text-sm text-gray-600">Receive important updates via email</p>
                </div>
                <Switch
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, emailAlerts: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">SMS Alerts</h4>
                  <p className="text-sm text-gray-600">Get urgent notifications via text message</p>
                </div>
                <Switch
                  checked={notifications.smsAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, smsAlerts: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Document Review Notifications</h4>
                  <p className="text-sm text-gray-600">Alerts when documents are ready for review</p>
                </div>
                <Switch
                  checked={notifications.documentReview}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, documentReview: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Billing Reminders</h4>
                  <p className="text-sm text-gray-600">Reminders for outstanding invoices</p>
                </div>
                <Switch
                  checked={notifications.billingReminders}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, billingReminders: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">System Updates</h4>
                  <p className="text-sm text-gray-600">Notifications about system maintenance and updates</p>
                </div>
                <Switch
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, systemUpdates: checked }))
                  }
                />
              </div>

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Password Requirements</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Minimum 8 characters</p>
                  <p>✓ At least one uppercase letter</p>
                  <p>✓ At least one number</p>
                  <p>✓ At least one special character</p>
                </div>
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Enable 2FA
                </Button>
              </div>

              <Button>Update Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Email Provider</h4>
                    <p className="text-sm text-gray-600">Connect your email for automated notifications</p>
                  </div>
                </div>
                <Button variant="outline">Configure</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Document Storage</h4>
                    <p className="text-sm text-gray-600">Integrate with cloud storage providers</p>
                  </div>
                </div>
                <Button variant="outline">Setup</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">API Access</h4>
                    <p className="text-sm text-gray-600">Manage API keys and external integrations</p>
                  </div>
                </div>
                <Button variant="outline">Manage</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI & LLM Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Key Input */}
              <div>
                <Label htmlFor="llmApiKey">OpenAI API Key</Label>
                <Input id="llmApiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter OpenAI API key" />
              </div>
              {/* Model & Temperature */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultModel">Default Model</Label>
                  <Input id="defaultModel" value={settings?.defaultModel || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input id="temperature" value={settings?.temperature != null ? settings.temperature.toString() : ''} disabled />
                </div>
              </div>
              {/* Activation Switch */}
              <div className="flex items-center justify-between">
                <span>LLM Active</span>
                <Switch checked={settings?.isActive || false} disabled />
              </div>
              {/* Usage Stats */}
              <div>
                <h4 className="font-semibold">Usage This Month</h4>
                <p>{usage?.currentMonthUsage ?? 0} tokens used / {usage?.monthlyTokenLimit ?? 0}</p>
              </div>
              <Button onClick={() => saveApiKey(apiKey)} className="mt-4">Save API Key</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}