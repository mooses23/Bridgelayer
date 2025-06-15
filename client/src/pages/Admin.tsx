import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Building2, 
  Plug, 
  FileText, 
  Users, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw,
  Globe,
  Database,
  Zap,
  History,
  Clock,
  User,
  Eye
} from "lucide-react";
import AdminGhostMode from "@/components/AdminGhostMode";
import type { 
  Firm, 
  AvailableIntegration, 
  DocumentTypeTemplate, 
  PlatformSetting 
} from "@shared/schema";

export default function Admin() {
  console.log("Admin page: AdminGhostMode component mounted");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("firms");

  // Fetch all data
  const { data: firms = [], isLoading: firmsLoading } = useQuery({
    queryKey: ['/api/admin/firms'],
  });

  const { data: availableIntegrations = [], isLoading: integrationsLoading } = useQuery({
    queryKey: ['/api/admin/integrations/available'],
  });

  const { data: documentTypes = [], isLoading: docTypesLoading } = useQuery({
    queryKey: ['/api/admin/document-types'],
  });

  const { data: platformSettings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
  });

  const { data: verticals = [] } = useQuery({
    queryKey: ['/api/admin/verticals'],
  });

  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ['/api/audit-logs'],
    enabled: activeTab === 'audit',
  });

  // Header Component
  const AdminHeader = () => (
    <div className="border-b bg-white dark:bg-gray-900 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            BridgeLayer Admin Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Platform management for BridgeLayer staff only
          </p>
        </div>
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          ADMIN ACCESS
        </Badge>
      </div>
    </div>
  );

  // Firms Management Tab
  const FirmsTab = () => {
    const [editingFirm, setEditingFirm] = useState<Firm | null>(null);
    const [newFirmData, setNewFirmData] = useState({
      name: "",
      slug: "",
      plan: "starter",
      status: "active"
    });

    const updateFirmMutation = useMutation({
      mutationFn: async ({ firmId, updates }: { firmId: number; updates: any }) => {
        return await apiRequest(`/api/admin/firms/${firmId}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/firms'] });
        setEditingFirm(null);
        toast({
          title: "Success",
          description: "Firm updated successfully",
        });
      },
    });

    const updateVerticalMutation = useMutation({
      mutationFn: async ({ firmId, vertical }: { firmId: number; vertical: string }) => {
        return await apiRequest(`/api/admin/firms/${firmId}/vertical`, {
          method: "PUT",
          body: JSON.stringify({ vertical }),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/firms'] });
        toast({
          title: "Success",
          description: "Firm vertical updated successfully",
        });
      },
    });

    const createFirmMutation = useMutation({
      mutationFn: async (firmData: any) => {
        return await apiRequest('/api/admin/firms', {
          method: "POST",
          body: JSON.stringify(firmData),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/firms'] });
        setNewFirmData({ name: "", slug: "", plan: "starter", status: "active" });
        toast({
          title: "Success",
          description: "Firm created successfully",
        });
      },
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Firm Management</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Firm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Firm</DialogTitle>
                <DialogDescription>
                  Add a new firm to the BridgeLayer platform
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firm-name" className="text-right">Name</Label>
                  <Input
                    id="firm-name"
                    value={newFirmData.name}
                    onChange={(e) => setNewFirmData(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firm-slug" className="text-right">Slug</Label>
                  <Input
                    id="firm-slug"
                    value={newFirmData.slug}
                    onChange={(e) => setNewFirmData(prev => ({ ...prev, slug: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firm-plan" className="text-right">Plan</Label>
                  <Select 
                    value={newFirmData.plan} 
                    onValueChange={(value) => setNewFirmData(prev => ({ ...prev, plan: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => createFirmMutation.mutate(newFirmData)}
                  disabled={createFirmMutation.isPending}
                >
                  {createFirmMutation.isPending ? "Creating..." : "Create Firm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Firms ({firms.length})</CardTitle>
            <CardDescription>
              Manage all firms on the BridgeLayer platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firm Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vertical</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {firms.map((firm: Firm) => (
                  <TableRow key={firm.id}>
                    <TableCell className="font-medium">{firm.name}</TableCell>
                    <TableCell>
                      <Badge variant={firm.plan === 'enterprise' ? 'default' : 'secondary'}>
                        {firm.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={firm.status === 'active' ? 'default' : 'destructive'}>
                        {firm.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={firm.settings?.vertical || 'firmsync'}
                        onValueChange={(vertical) => updateVerticalMutation.mutate({ firmId: firm.id, vertical })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {verticals.map((vertical: any) => (
                            <SelectItem key={vertical.name} value={vertical.name}>
                              {vertical.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(firm.createdAt!).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingFirm(firm)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Integrations Management Tab
  const IntegrationsTab = () => {
    const [newIntegration, setNewIntegration] = useState({
      name: "",
      displayName: "",
      description: "",
      isActive: true,
      requiresSetup: true
    });

    const createIntegrationMutation = useMutation({
      mutationFn: async (integrationData: any) => {
        return await apiRequest('/api/admin/integrations/available', {
          method: "POST",
          body: JSON.stringify(integrationData),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/integrations/available'] });
        setNewIntegration({
          name: "",
          displayName: "",
          description: "",
          isActive: true,
          requiresSetup: true
        });
        toast({
          title: "Success",
          description: "Integration added successfully",
        });
      },
    });

    const toggleIntegrationMutation = useMutation({
      mutationFn: async ({ integrationId, isActive }: { integrationId: number; isActive: boolean }) => {
        return await apiRequest(`/api/admin/integrations/available/${integrationId}`, {
          method: "PUT",
          body: JSON.stringify({ isActive }),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/integrations/available'] });
        toast({
          title: "Success",
          description: "Integration status updated",
        });
      },
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Integration Management</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Integration</CardTitle>
              <CardDescription>
                Define new third-party integrations for firms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="int-name">Integration Name</Label>
                <Input
                  id="int-name"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="google_drive"
                />
              </div>
              <div>
                <Label htmlFor="int-display">Display Name</Label>
                <Input
                  id="int-display"
                  value={newIntegration.displayName}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Google Drive"
                />
              </div>
              <div>
                <Label htmlFor="int-desc">Description</Label>
                <Input
                  id="int-desc"
                  value={newIntegration.description}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Cloud storage integration"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="int-active"
                  checked={newIntegration.isActive}
                  onCheckedChange={(checked) => setNewIntegration(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="int-active">Active by default</Label>
              </div>
              <Button 
                onClick={() => createIntegrationMutation.mutate(newIntegration)}
                disabled={createIntegrationMutation.isPending}
                className="w-full"
              >
                {createIntegrationMutation.isPending ? "Adding..." : "Add Integration"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Integrations ({availableIntegrations.length})</CardTitle>
              <CardDescription>
                Manage platform-wide integration options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableIntegrations.map((integration: AvailableIntegration) => (
                  <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{integration.displayName}</h4>
                      <p className="text-sm text-gray-600">{integration.description}</p>
                    </div>
                    <Switch
                      checked={integration.isActive}
                      onCheckedChange={(checked) => 
                        toggleIntegrationMutation.mutate({ 
                          integrationId: integration.id, 
                          isActive: checked 
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Document Types Management Tab
  const DocumentTypesTab = () => {
    const [newDocType, setNewDocType] = useState({
      name: "",
      displayName: "",
      category: "",
      vertical: "firmsync",
      defaultConfig: {
        summarize: true,
        risk: true,
        clauses: true,
        crossref: false,
        formatting: true
      },
      keywords: []
    });

    const createDocTypeMutation = useMutation({
      mutationFn: async (docTypeData: any) => {
        return await apiRequest('/api/admin/document-types', {
          method: "POST",
          body: JSON.stringify({
            ...docTypeData,
            createdBy: 1 // TODO: Get from authenticated admin
          }),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/document-types'] });
        setNewDocType({
          name: "",
          displayName: "",
          category: "",
          vertical: "firmsync",
          defaultConfig: {
            summarize: true,
            risk: true,
            clauses: true,
            crossref: false,
            formatting: true
          },
          keywords: []
        });
        toast({
          title: "Success",
          description: "Document type created successfully",
        });
      },
    });

    const deleteDocTypeMutation = useMutation({
      mutationFn: async (docTypeId: number) => {
        return await apiRequest(`/api/admin/document-types/${docTypeId}`, {
          method: "DELETE",
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/document-types'] });
        toast({
          title: "Success",
          description: "Document type deleted successfully",
        });
      },
    });

    const groupedDocTypes = documentTypes.reduce((acc: any, docType: DocumentTypeTemplate) => {
      if (!acc[docType.vertical]) {
        acc[docType.vertical] = [];
      }
      acc[docType.vertical].push(docType);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Document Type Templates</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Document Type</CardTitle>
              <CardDescription>
                Add new document types to the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doc-name">Name</Label>
                  <Input
                    id="doc-name"
                    value={newDocType.name}
                    onChange={(e) => setNewDocType(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="nda"
                  />
                </div>
                <div>
                  <Label htmlFor="doc-display">Display Name</Label>
                  <Input
                    id="doc-display"
                    value={newDocType.displayName}
                    onChange={(e) => setNewDocType(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Non-Disclosure Agreement"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doc-category">Category</Label>
                  <Input
                    id="doc-category"
                    value={newDocType.category}
                    onChange={(e) => setNewDocType(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="corporate"
                  />
                </div>
                <div>
                  <Label htmlFor="doc-vertical">Vertical</Label>
                  <Select
                    value={newDocType.vertical}
                    onValueChange={(value) => setNewDocType(prev => ({ ...prev, vertical: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {verticals.map((vertical: any) => (
                        <SelectItem key={vertical.name} value={vertical.name}>
                          {vertical.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Default Analysis Features</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(newDocType.defaultConfig).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(checked) => 
                          setNewDocType(prev => ({
                            ...prev,
                            defaultConfig: { ...prev.defaultConfig, [key]: checked }
                          }))
                        }
                      />
                      <Label className="capitalize">{key}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                onClick={() => createDocTypeMutation.mutate(newDocType)}
                disabled={createDocTypeMutation.isPending}
                className="w-full"
              >
                {createDocTypeMutation.isPending ? "Creating..." : "Create Document Type"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Type Library</CardTitle>
              <CardDescription>
                Manage existing document types by vertical
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupedDocTypes).map(([vertical, types]: [string, any]) => (
                  <div key={vertical}>
                    <h4 className="font-medium mb-2 text-blue-600 uppercase text-sm">
                      {vertical}
                    </h4>
                    <div className="space-y-2">
                      {types.map((docType: DocumentTypeTemplate) => (
                        <div key={docType.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{docType.displayName}</div>
                            <div className="text-sm text-gray-600">{docType.category}</div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteDocTypeMutation.mutate(docType.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Platform Settings Tab
  const SettingsTab = () => {
    const [newSetting, setNewSetting] = useState({
      key: "",
      value: "",
      description: "",
      category: "features"
    });

    const updateSettingMutation = useMutation({
      mutationFn: async ({ key, value }: { key: string; value: any }) => {
        return await apiRequest(`/api/admin/settings/${key}`, {
          method: "PUT",
          body: JSON.stringify({ value }),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
        toast({
          title: "Success",
          description: "Setting updated successfully",
        });
      },
    });

    const createSettingMutation = useMutation({
      mutationFn: async (settingData: any) => {
        return await apiRequest('/api/admin/settings', {
          method: "POST",
          body: JSON.stringify({
            ...settingData,
            updatedBy: 1 // TODO: Get from authenticated admin
          }),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
        setNewSetting({
          key: "",
          value: "",
          description: "",
          category: "features"
        });
        toast({
          title: "Success",
          description: "Setting created successfully",
        });
      },
    });

    const groupedSettings = platformSettings.reduce((acc: any, setting: PlatformSetting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Platform Settings</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Setting</CardTitle>
              <CardDescription>
                Add global platform configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="setting-key">Setting Key</Label>
                <Input
                  id="setting-key"
                  value={newSetting.key}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="ai_features_enabled"
                />
              </div>
              <div>
                <Label htmlFor="setting-value">Value (JSON)</Label>
                <Input
                  id="setting-value"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="true"
                />
              </div>
              <div>
                <Label htmlFor="setting-desc">Description</Label>
                <Input
                  id="setting-desc"
                  value={newSetting.description}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enable AI analysis features"
                />
              </div>
              <div>
                <Label htmlFor="setting-category">Category</Label>
                <Select
                  value={newSetting.category}
                  onValueChange={(value) => setNewSetting(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="features">Features</SelectItem>
                    <SelectItem value="ai">AI Settings</SelectItem>
                    <SelectItem value="limits">Limits</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => createSettingMutation.mutate({
                  ...newSetting,
                  value: JSON.parse(newSetting.value || 'null')
                })}
                disabled={createSettingMutation.isPending}
                className="w-full"
              >
                {createSettingMutation.isPending ? "Creating..." : "Create Setting"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>
                Global settings affecting all firms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupedSettings).map(([category, settings]: [string, any]) => (
                  <div key={category}>
                    <h4 className="font-medium mb-2 text-green-600 uppercase text-sm flex items-center gap-2">
                      {category === 'ai' && <Zap className="w-4 h-4" />}
                      {category === 'features' && <Settings className="w-4 h-4" />}
                      {category === 'limits' && <Database className="w-4 h-4" />}
                      {category === 'billing' && <Globe className="w-4 h-4" />}
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {settings.map((setting: PlatformSetting) => (
                        <div key={setting.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{setting.key}</div>
                            <div className="text-sm text-gray-600">{setting.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {JSON.stringify(setting.value)}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newValue = prompt("Enter new value (JSON):", JSON.stringify(setting.value));
                                if (newValue !== null) {
                                  try {
                                    const parsedValue = JSON.parse(newValue);
                                    updateSettingMutation.mutate({ 
                                      key: setting.key, 
                                      value: parsedValue 
                                    });
                                  } catch (e) {
                                    toast({
                                      title: "Error",
                                      description: "Invalid JSON format",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Audit Log Tab Component
  const AuditLogTab = () => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString();
    };

    const getActionIcon = (action: string) => {
      switch (action) {
        case 'DOC_UPLOAD':
          return <FileText className="w-4 h-4 text-blue-500" />;
        case 'DOC_REVIEW_COMPLETED':
          return <Shield className="w-4 h-4 text-green-500" />;
        case 'CONFIG_CHANGE':
          return <Settings className="w-4 h-4 text-orange-500" />;
        case 'LOGIN':
          return <User className="w-4 h-4 text-gray-500" />;
        default:
          return <Clock className="w-4 h-4 text-gray-400" />;
      }
    };

    const getActionColor = (action: string) => {
      switch (action) {
        case 'DOC_UPLOAD':
          return 'bg-blue-50 border-blue-200';
        case 'DOC_REVIEW_COMPLETED':
          return 'bg-green-50 border-green-200';
        case 'CONFIG_CHANGE':
          return 'bg-orange-50 border-orange-200';
        case 'LOGIN':
          return 'bg-gray-50 border-gray-200';
        default:
          return 'bg-gray-50 border-gray-200';
      }
    };

    if (auditLoading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>Loading compliance audit trail...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 p-4 border rounded">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Audit Log - Compliance Firewall
            </CardTitle>
            <CardDescription>
              Immutable record of all system actions for compliance and security monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogs && auditLogs.length > 0 ? (
                auditLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className={`p-4 border rounded-lg ${getActionColor(log.action)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getActionIcon(log.action)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.action.replace('_', ' ')}</span>
                            <Badge variant="outline" className="text-xs">
                              {log.resourceType}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Performed by <strong>{log.actorName}</strong>
                            {log.resourceId && ` on ${log.resourceType} ${log.resourceId}`}
                          </p>
                          {log.details && (
                            <div className="text-xs bg-white/50 p-2 rounded border">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{formatDate(log.timestamp)}</div>
                        {log.ipAddress && (
                          <div className="mt-1">IP: {log.ipAddress}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No audit logs found</p>
                  <p className="text-xs mt-1">System actions will appear here for compliance tracking</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (firmsLoading || integrationsLoading || docTypesLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading admin panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="firms" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Firms
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="w-4 h-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="document-types" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Document Types
            </TabsTrigger>
            <TabsTrigger value="ghost-mode" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Ghost Mode
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="firms">
            <FirmsTab />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsTab />
          </TabsContent>

          <TabsContent value="document-types">
            <DocumentTypesTab />
          </TabsContent>

          <TabsContent value="ghost-mode">
            <div className="space-y-6">
              <div className="text-xs text-green-600 font-medium mb-2">[AdminGhostMode] is live</div>
              <AdminGhostMode />
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}