import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/context/TenantContext";
import { useSession } from "@/contexts/SessionContext";

export default function SettingsPage() {
  const { tenant } = useTenant();
  const { user } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your firm settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Firm Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firmName">Firm Name</Label>
                  <Input id="firmName" value={tenant?.name || "Loading..."} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan</Label>
                  <Input id="plan" value={tenant?.plan || "Professional"} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input id="domain" value={tenant?.domain || "Not configured"} />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={user?.firstName || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={user?.lastName || ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Badge variant="secondary">{user?.role || "Loading..."}</Badge>
              </div>
              <Button>Update Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Access</CardTitle>
              <p className="text-sm text-muted-foreground">
                Control which features are available to your firm
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="documents">Document Management</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload and analyze legal documents
                  </p>
                </div>
                <Switch 
                  id="documents" 
                  checked={tenant?.features?.documentsEnabled || false}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="intake">Client Intake</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage new client onboarding
                  </p>
                </div>
                <Switch 
                  id="intake" 
                  checked={tenant?.features?.intakeEnabled || false}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="billing">Billing & Time Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track time and generate invoices
                  </p>
                </div>
                <Switch 
                  id="billing" 
                  checked={tenant?.features?.billingEnabled || false}
                />
              </div>
              <Button>Save Feature Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Default Hourly Rate</Label>
                  <Input id="hourlyRate" type="number" placeholder="250.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" value="USD" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input id="taxRate" type="number" placeholder="8.25" />
              </div>
              <Button>Update Billing Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch id="twoFactor" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sessionTimeout">Auto Logout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after inactivity
                  </p>
                </div>
                <Switch id="sessionTimeout" defaultChecked />
              </div>
              <Button variant="outline">Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}