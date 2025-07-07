import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/contexts/TenantContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiService from "@/services/api.service";
import { useToast } from "@/hooks/use-toast";
import { Firm } from "@/types/schema";

export default function SettingsPage() {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [firmData, setFirmData] = useState<Partial<Firm>>({});

  // Fetch firm data using API service
  const { data: firm, isLoading } = useQuery({
    queryKey: ["firm", tenant?.slug],
    queryFn: async () => {
      const response = await apiService.getFirm(tenant?.slug || '');
      return response.data;
    },
    enabled: !!tenant?.slug,
    onSuccess: (data) => {
      setFirmData(data);
    }
  });

  // Update firm mutation
  const updateFirm = useMutation({
    mutationFn: (data: Partial<Firm>) => {
      return apiService.updateFirm(tenant?.onboardingCode || '', data);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your firm settings have been updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update settings",
        description: "Please try again later",
        variant: "destructive",
      });
      console.error("Error updating firm settings:", error);
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFirmData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    updateFirm.mutate(firmData);
  };

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
              {isLoading ? (
                <div className="text-center py-4">Loading firm information...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firmName">Firm Name</Label>
                      <Input 
                        id="firmName" 
                        value={firmData.name || ""} 
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plan">Plan</Label>
                      <Input 
                        id="plan" 
                        value={firmData.plan || ""} 
                        readOnly 
                      />
                      <p className="text-xs text-muted-foreground">
                        Contact support to change your plan
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain</Label>
                    <Input 
                      id="domain" 
                      value={firmData.domain || firmData.subdomain || firmData.slug || "Not configured"}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input 
                      id="contactEmail" 
                      value={firmData.contactEmail || ""} 
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input 
                      id="contactPhone" 
                      value={firmData.contactPhone || ""} 
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveChanges} disabled={updateFirm.isLoading}>
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Information
                    </Button>
                  )}
                </>
              )}
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
                  <Input id="firstName" defaultValue="Alex" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Johnson" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="alex@example.com" />
              </div>
              <Button>Update Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Paralegal+ AI</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable AI-powered document analysis and automation
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Client Portal</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow clients to access their documents and case status
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Calendar Integration</Label>
                  <p className="text-sm text-muted-foreground">
                    Sync with Google Calendar or Outlook
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Document OCR</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically extract text from scanned documents
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Current Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {firm?.plan || "Professional"} Plan
                  </p>
                </div>
                <Badge>Active</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Billing Cycle</h3>
                  <p className="text-sm text-muted-foreground">
                    Monthly • Renews on {new Date().toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline">Change Cycle</Button>
              </div>

              <div className="pt-2">
                <Button>Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded mr-3"></div>
                  <div>
                    <h3 className="font-medium">Visa ending in 4242</h3>
                    <p className="text-sm text-muted-foreground">
                      Expires 04/2026
                    </p>
                  </div>
                </div>
                <Button variant="outline">Update</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <h4 className="font-medium">Jun 1, 2025</h4>
                    <p className="text-sm text-muted-foreground">
                      Professional Plan - Monthly
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$99.00</p>
                    <p className="text-sm text-green-600">Paid</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <h4 className="font-medium">May 1, 2025</h4>
                    <p className="text-sm text-muted-foreground">
                      Professional Plan - Monthly
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$99.00</p>
                    <p className="text-sm text-green-600">Paid</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Change Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Login Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for new logins
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">API Key</h3>
                  <p className="text-sm text-muted-foreground">
                    For integrating with third-party services
                  </p>
                </div>
                <Button variant="outline">Generate Key</Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openai-api">OpenAI API Key</Label>
                <Input 
                  id="openai-api" 
                  type="password" 
                  value={firmData.openaiApiKey || ""}
                  onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                  disabled={!isEditing}
                  placeholder="sk-..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}