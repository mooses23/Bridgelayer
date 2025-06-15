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
  Save,
  FileText,
  Upload,
  Download,
  Brain,
  BarChart3,
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("firm");
  const [selectedFormTemplate, setSelectedFormTemplate] = useState<File | null>(null);
  const [taxFormData, setTaxFormData] = useState({
    formType: "1099",
    taxYear: new Date().getFullYear(),
    contractorInfo: {
      name: "",
      address: "",
      taxId: "",
      totalPaid: ""
    }
  });
  const [billingAlertSettings, setBillingAlertSettings] = useState({
    disableAfterPayment: true,
    lockUI: true,
    notifyAdmin: true,
    emailAlerts: false
  });
  const [advancedAnalytics, setAdvancedAnalytics] = useState({
    enabled: false,
    showProfitability: true,
    showStaffRates: true,
    showUnbilledTime: true
  });
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

  // Fetch form templates
  const { data: formTemplates } = useQuery({
    queryKey: ["/api/firm/form-templates"],
    queryFn: () => fetch("/api/firm/form-templates").then(res => res.json())
  });

  // Fetch billing settings
  const { data: billingSettings } = useQuery({
    queryKey: ["/api/billing/settings"],
    queryFn: () => fetch("/api/billing/settings").then(res => res.json())
  });

  // Mutations
  const uploadFormTemplateMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('template', file);
      return fetch('/api/firm/form-templates/upload', {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/firm/form-templates"] });
      toast({ title: "Form template uploaded successfully" });
    }
  });

  const generateTaxFormMutation = useMutation({
    mutationFn: async (data: any) => {
      return fetch('/api/billing/generate-tax-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: "Tax form generated successfully" });
    }
  });

  const saveAdvancedSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return fetch('/api/firm/advanced-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/firm"] });
      toast({ title: "Advanced settings saved successfully" });
    }
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
        <TabsList className="grid w-full grid-cols-6">
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
          <TabsTrigger value="tax-docs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tax Docs
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Advanced
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

        {/* Tax Docs Tab */}
        <TabsContent value="tax-docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                IRS/1099 Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Template Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Form Templates</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <h4 className="font-medium text-gray-900">Upload Tax Form Template</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload W-9, 1099, or other tax forms (PDF, DOC, DOCX)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFormTemplate(file);
                          uploadFormTemplateMutation.mutate(file);
                        }
                      }}
                      className="hidden"
                      id="tax-form-upload"
                    />
                    <label htmlFor="tax-form-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Choose File
                      </Button>
                    </label>
                  </div>
                  
                  {/* Uploaded Templates */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Templates</h4>
                    {formTemplates && formTemplates.length > 0 ? (
                      formTemplates.map((template: any) => (
                        <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-gray-500">{template.type}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 p-4 text-center">No templates uploaded yet</p>
                    )}
                  </div>
                </div>

                {/* AI Form Generation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    <h3 className="text-lg font-medium">AI Form Generation</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Form Type</Label>
                      <select
                        value={taxFormData.formType}
                        onChange={(e) => setTaxFormData(prev => ({ ...prev, formType: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="1099">1099-NEC (Contractor Payments)</option>
                        <option value="w9">W-9 (Request for Taxpayer ID)</option>
                        <option value="invoice_template">Invoice Template</option>
                        <option value="retainer_agreement">Retainer Agreement</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tax Year</Label>
                      <select
                        value={taxFormData.taxYear}
                        onChange={(e) => setTaxFormData(prev => ({ ...prev, taxYear: parseInt(e.target.value) }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                      </select>
                    </div>

                    {taxFormData.formType === "1099" && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Contractor Information</h4>
                        <Input
                          placeholder="Contractor Name"
                          value={taxFormData.contractorInfo.name}
                          onChange={(e) => setTaxFormData(prev => ({
                            ...prev,
                            contractorInfo: { ...prev.contractorInfo, name: e.target.value }
                          }))}
                        />
                        <Input
                          placeholder="Address"
                          value={taxFormData.contractorInfo.address}
                          onChange={(e) => setTaxFormData(prev => ({
                            ...prev,
                            contractorInfo: { ...prev.contractorInfo, address: e.target.value }
                          }))}
                        />
                        <Input
                          placeholder="Tax ID (SSN/EIN)"
                          value={taxFormData.contractorInfo.taxId}
                          onChange={(e) => setTaxFormData(prev => ({
                            ...prev,
                            contractorInfo: { ...prev.contractorInfo, taxId: e.target.value }
                          }))}
                        />
                        <Input
                          placeholder="Total Paid Amount"
                          type="number"
                          value={taxFormData.contractorInfo.totalPaid}
                          onChange={(e) => setTaxFormData(prev => ({
                            ...prev,
                            contractorInfo: { ...prev.contractorInfo, totalPaid: e.target.value }
                          }))}
                        />
                      </div>
                    )}

                    <Button
                      onClick={() => generateTaxFormMutation.mutate(taxFormData)}
                      disabled={generateTaxFormMutation.isPending}
                      className="w-full flex items-center gap-2"
                    >
                      <Brain className="w-4 h-4" />
                      {generateTaxFormMutation.isPending ? "Generating..." : "Generate Form with AI"}
                    </Button>

                    <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                      <p><strong>AI Features:</strong></p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Auto-fills from billing data</li>
                        <li>Uses uploaded templates for formatting</li>
                        <li>Validates required fields</li>
                        <li>Exports as PDF</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="advanced" className="space-y-6">
          {/* Billing Disable Alerts */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                Billing Disable Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">Protection Settings</h4>
                <p className="text-sm text-orange-700 mb-4">
                  Prevent firms from disabling billing after collecting payments
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lock UI when billing disabled</p>
                      <p className="text-sm text-gray-600">Prevent access to billing features</p>
                    </div>
                    <Switch
                      checked={billingAlertSettings.lockUI}
                      onCheckedChange={(checked) => setBillingAlertSettings(prev => ({ ...prev, lockUI: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Alert super-admin</p>
                      <p className="text-sm text-gray-600">Show UI popup notification</p>
                    </div>
                    <Switch
                      checked={billingAlertSettings.notifyAdmin}
                      onCheckedChange={(checked) => setBillingAlertSettings(prev => ({ ...prev, notifyAdmin: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email alerts</p>
                      <p className="text-sm text-gray-600">Send email notifications</p>
                    </div>
                    <Switch
                      checked={billingAlertSettings.emailAlerts}
                      onCheckedChange={(checked) => setBillingAlertSettings(prev => ({ ...prev, emailAlerts: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Advanced Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Enable Advanced Analytics</h4>
                  <p className="text-sm text-gray-500">Show detailed profitability and performance metrics</p>
                </div>
                <Switch
                  checked={advancedAnalytics.enabled}
                  onCheckedChange={(checked) => setAdvancedAnalytics(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              {advancedAnalytics.enabled && (
                <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Most profitable cases</p>
                      <p className="text-sm text-gray-500">Show case profitability analysis</p>
                    </div>
                    <Switch
                      checked={advancedAnalytics.showProfitability}
                      onCheckedChange={(checked) => setAdvancedAnalytics(prev => ({ ...prev, showProfitability: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Average $/hour per staff</p>
                      <p className="text-sm text-gray-500">Display staff performance metrics</p>
                    </div>
                    <Switch
                      checked={advancedAnalytics.showStaffRates}
                      onCheckedChange={(checked) => setAdvancedAnalytics(prev => ({ ...prev, showStaffRates: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Total unbilled time</p>
                      <p className="text-sm text-gray-500">Track unbilled hours and revenue</p>
                    </div>
                    <Switch
                      checked={advancedAnalytics.showUnbilledTime}
                      onCheckedChange={(checked) => setAdvancedAnalytics(prev => ({ ...prev, showUnbilledTime: checked }))}
                    />
                  </div>
                </div>
              )}

              {advancedAnalytics.enabled && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Analytics Features</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Real-time profitability tracking</li>
                    <li>• Staff performance comparisons</li>
                    <li>• Revenue forecasting</li>
                    <li>• Detailed time tracking analysis</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="mt-3"
                    onClick={() => window.open('/billing-analytics', '_blank')}
                  >
                    Open Analytics Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Most Used Forms Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Most Used Forms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload your firm's most commonly used forms. These will be prioritized in the document generator and AI analysis.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FolderOpen className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <h4 className="font-medium text-gray-900">Upload Favorite Forms</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Upload templates that your firm uses regularly
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  id="favorite-forms-upload"
                />
                <label htmlFor="favorite-forms-upload">
                  <Button variant="outline" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </label>
              </div>

              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                <p><strong>Supported formats:</strong> PDF, DOC, DOCX, TXT</p>
                <p><strong>Storage location:</strong> /forms/[firm_id]/favorites</p>
                <p><strong>AI Integration:</strong> These templates will be used to improve document formatting and suggestions</p>
              </div>

              <Button
                onClick={() => saveAdvancedSettingsMutation.mutate({
                  billingAlerts: billingAlertSettings,
                  analytics: advancedAnalytics
                })}
                disabled={saveAdvancedSettingsMutation.isPending}
                className="w-full flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Advanced Settings
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