import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Building2, 
  Users, 
  Shield, 
  Bell,
  Palette,
  Globe,
  CreditCard,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("firm");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch firm data
  const { data: firm } = useQuery({
    queryKey: ["/api/firm"],
    queryFn: () => fetch("/api/firm").then(res => res.json())
  });

  // Fetch analysis settings
  const { data: analysisSettings } = useQuery({
    queryKey: ["/api/firm/analysis-settings"],
    queryFn: () => fetch("/api/firm/analysis-settings").then(res => res.json())
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your firm configuration and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="firm" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Firm
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Firm Settings */}
        <TabsContent value="firm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Firm Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firmName">Firm Name</Label>
                  <Input 
                    id="firmName" 
                    defaultValue={firm?.name || "Smith & Associates Law Firm"} 
                  />
                </div>
                <div>
                  <Label htmlFor="firmSlug">URL Slug</Label>
                  <Input 
                    id="firmSlug" 
                    defaultValue={firm?.slug || "smith-associates"}
                    placeholder="firm-url-slug"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Current Plan</Label>
                  <div className="mt-2">
                    <Badge variant="outline" className="capitalize">
                      {firm?.plan || "Professional"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-2">
                    <Badge className="capitalize">
                      {firm?.status || "Active"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                <Input 
                  id="customDomain" 
                  placeholder="yourdomain.com" 
                />
                <p className="text-sm text-gray-500 mt-1">
                  Configure a custom domain for your FIRMSYNC workspace
                </p>
              </div>

              <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Firm Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Settings */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Document Analysis Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Document Summarization</h4>
                    <p className="text-sm text-gray-500">Extract key terms and document purpose</p>
                  </div>
                  <Switch defaultChecked={analysisSettings?.summarization ?? true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Risk Analysis</h4>
                    <p className="text-sm text-gray-500">Identify potential legal risks and issues</p>
                  </div>
                  <Switch defaultChecked={analysisSettings?.riskAnalysis ?? true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Clause Extraction</h4>
                    <p className="text-sm text-gray-500">Detect standard legal clauses</p>
                  </div>
                  <Switch defaultChecked={analysisSettings?.clauseExtraction ?? true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cross-Reference Check</h4>
                    <p className="text-sm text-gray-500">Verify internal document references</p>
                  </div>
                  <Switch defaultChecked={analysisSettings?.crossReference ?? false} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Formatting Analysis</h4>
                    <p className="text-sm text-gray-500">Check document structure and style</p>
                  </div>
                  <Switch defaultChecked={analysisSettings?.formatting ?? true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto Analysis</h4>
                    <p className="text-sm text-gray-500">Automatically analyze documents on upload</p>
                  </div>
                  <Switch defaultChecked={analysisSettings?.autoAnalysis ?? false} />
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Analysis Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Role-Based Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Permissions Configuration
                </h3>
                <p className="text-gray-500 mb-6">
                  Advanced permission settings will be available here
                </p>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Document Analysis Complete</h4>
                    <p className="text-sm text-gray-500">Notify when analysis finishes</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">High-Risk Documents</h4>
                    <p className="text-sm text-gray-500">Alert for documents requiring review</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Team Messages</h4>
                    <p className="text-sm text-gray-500">Notifications for team communications</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </div>

              <div>
                <Label htmlFor="slackWebhook">Slack Webhook URL (Optional)</Label>
                <Input 
                  id="slackWebhook" 
                  placeholder="https://hooks.slack.com/services/..." 
                />
                <p className="text-sm text-gray-500 mt-1">
                  Send notifications to your Slack workspace
                </p>
              </div>

              <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium">Current Plan</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">Professional</p>
                    <p className="text-sm text-gray-500">$99/month</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium">Documents Used</h3>
                    <p className="text-2xl font-bold">12 / 500</p>
                    <p className="text-sm text-gray-500">2.4% used</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium">Team Members</h3>
                    <p className="text-2xl font-bold">3 / 20</p>
                    <p className="text-sm text-gray-500">15% capacity</p>
                  </div>
                </div>

                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Billing Management
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Subscription and payment management will be available here
                  </p>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}