import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/context/TenantContext";
import { useSession } from "@/contexts/SessionContext";
import { Building, User, Shield, Bell, CreditCard, Globe } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { tenant, hasFeature } = useTenant();
  const { user } = useSession();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      {/* Firm Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Firm Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firmName">Firm Name</Label>
              <Input 
                id="firmName" 
                defaultValue={tenant?.name || "Legal Associates"} 
                disabled 
              />
            </div>
            <div>
              <Label htmlFor="firmSlug">Firm Slug</Label>
              <Input 
                id="firmSlug" 
                defaultValue={tenant?.slug || "legal-associates"} 
                disabled 
              />
            </div>
          </div>
          <div>
            <Label htmlFor="plan">Current Plan</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input 
                id="plan" 
                defaultValue={tenant?.plan || "Professional"} 
                disabled 
              />
              <Badge variant="secondary">
                {tenant?.onboarded ? "Active" : "Setup Required"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                defaultValue={user?.firstName || ""} 
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                defaultValue={user?.lastName || ""} 
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              defaultValue={user?.email || ""} 
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input 
              id="role" 
              defaultValue={user?.role || ""} 
              disabled 
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Feature Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Document Management</h4>
                <p className="text-sm text-gray-500">Upload and analyze legal documents</p>
              </div>
              <Badge variant={hasFeature('documentsEnabled') ? "default" : "secondary"}>
                {hasFeature('documentsEnabled') ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Client Intake</h4>
                <p className="text-sm text-gray-500">Manage new client intake process</p>
              </div>
              <Badge variant={hasFeature('intakeEnabled') ? "default" : "secondary"}>
                {hasFeature('intakeEnabled') ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Billing & Time Tracking</h4>
                <p className="text-sm text-gray-500">Track time and generate invoices</p>
              </div>
              <Badge variant={hasFeature('billingEnabled') ? "default" : "secondary"}>
                {hasFeature('billingEnabled') ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Communications Log</h4>
                <p className="text-sm text-gray-500">Track client communications</p>
              </div>
              <Badge variant={hasFeature('communicationsEnabled') ? "default" : "secondary"}>
                {hasFeature('communicationsEnabled') ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Calendar Integration</h4>
                <p className="text-sm text-gray-500">Sync with court calendars and deadlines</p>
              </div>
              <Badge variant={hasFeature('calendarEnabled') ? "default" : "secondary"}>
                {hasFeature('calendarEnabled') ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Push Notifications</h4>
              <p className="text-sm text-gray-500">Receive notifications in your browser</p>
            </div>
            <Switch 
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Alerts</h4>
              <p className="text-sm text-gray-500">Get important updates via email</p>
            </div>
            <Switch 
              checked={emailAlerts}
              onCheckedChange={setEmailAlerts}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Enable Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full">
            Download Account Data
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button>Save Changes</Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </div>
  );
}