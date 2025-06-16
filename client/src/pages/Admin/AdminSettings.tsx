import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Database, Mail, AlertTriangle } from "lucide-react";

export default function AdminSettings() {
  const [systemSettings, setSystemSettings] = useState({
    siteName: "FIRMSYNC",
    supportEmail: "support@firmsync.com",
    maxFileSize: "10",
    sessionTimeout: "24",
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    backupFrequency: "daily"
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: "8",
    requireTwoFactor: false,
    sessionSecure: true,
    ipWhitelist: "",
    maxLoginAttempts: "5",
    lockoutDuration: "30"
  });

  const handleSystemSave = () => {
    console.log("System settings saved:", systemSettings);
  };

  const handleSecuritySave = () => {
    console.log("Security settings saved:", securitySettings);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings and security options</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={systemSettings.siteName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={systemSettings.supportEmail}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={systemSettings.maxFileSize}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFileSize: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Disable site access for maintenance</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registrationEnabled">User Registration</Label>
                    <p className="text-sm text-gray-600">Allow new firm registrations</p>
                  </div>
                  <Switch
                    id="registrationEnabled"
                    checked={systemSettings.registrationEnabled}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, registrationEnabled: checked }))}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSystemSave}>Save General Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Min Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={securitySettings.lockoutDuration}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipWhitelist">IP Whitelist (comma-separated)</Label>
                <Input
                  id="ipWhitelist"
                  placeholder="192.168.1.100, 10.0.0.50"
                  value={securitySettings.ipWhitelist}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireTwoFactor">Require Two-Factor Auth</Label>
                    <p className="text-sm text-gray-600">Enforce 2FA for all admin accounts</p>
                  </div>
                  <Switch
                    id="requireTwoFactor"
                    checked={securitySettings.requireTwoFactor}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireTwoFactor: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sessionSecure">Secure Sessions</Label>
                    <p className="text-sm text-gray-600">Use secure HTTPS-only cookies</p>
                  </div>
                  <Switch
                    id="sessionSecure"
                    checked={securitySettings.sessionSecure}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, sessionSecure: checked }))}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSecuritySave}>Save Security Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Database Status</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Connected</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">247</p>
                        <p className="text-sm text-gray-600">Total Firms</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">1,847</p>
                        <p className="text-sm text-gray-600">Total Users</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">45,892</p>
                        <p className="text-sm text-gray-600">Documents</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline">Create Backup</Button>
                <Button variant="outline">Restore Backup</Button>
                <Button variant="destructive">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Maintenance Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Send system alerts via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={systemSettings.emailNotifications}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Recent System Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">High API usage detected</p>
                      <p className="text-xs text-gray-600">Wilson & Associates - 10 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Database className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Scheduled maintenance completed</p>
                      <p className="text-xs text-gray-600">Database backup - 2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}