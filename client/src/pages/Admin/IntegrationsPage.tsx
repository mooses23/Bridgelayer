import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Settings, Users, BarChart3, AlertCircle, CheckCircle, Key, Shield, Activity, ExternalLink } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PlatformIntegration {
  id: number;
  name: string;
  description: string;
  category: string;
  provider: string;
  authType: string;
  status: "active" | "inactive";
  version: string;
  createdAt: string;
  updatedAt: string;
}

interface FirmIntegration {
  id: number;
  firmId: number;
  integrationId: number;
  name: string;
  status: "active" | "inactive" | "error";
  enabledBy: number;
  apiCredentials: { hasApiKey: boolean } | null;
  configuration: any;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationDashboard {
  availableIntegrations: PlatformIntegration[];
  enabledIntegrations: FirmIntegration[];
  userPermissions: any[];
  recentActivity: any[];
}

export default function IntegrationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedIntegration, setSelectedIntegration] = useState<PlatformIntegration | null>(null);
  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [configuration, setConfiguration] = useState("");

  // Fetch integration dashboard data
  const { data: dashboardData, isLoading } = useQuery<IntegrationDashboard>({
    queryKey: ["/api/integrations/dashboard"],
  });

  // Fetch platform integrations (admin only)
  const { data: platformIntegrations } = useQuery<PlatformIntegration[]>({
    queryKey: ["/api/integrations/platform"],
  });

  // Enable firm integration mutation
  const enableIntegrationMutation = useMutation({
    mutationFn: async (data: { integrationId: number; apiKey?: string; configuration?: any }) => {
      return await apiRequest("/api/integrations/firm", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/dashboard"] });
      setIsEnableDialogOpen(false);
      setApiKey("");
      setConfiguration("");
      toast({
        title: "Integration Enabled",
        description: "Integration has been successfully enabled for your firm.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Enable Failed",
        description: error.message || "Failed to enable integration",
        variant: "destructive",
      });
    },
  });

  // Disable firm integration mutation
  const disableIntegrationMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      return await apiRequest(`/api/integrations/firm/${integrationId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/dashboard"] });
      toast({
        title: "Integration Disabled",
        description: "Integration has been disabled for your firm.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Disable Failed",
        description: error.message || "Failed to disable integration",
        variant: "destructive",
      });
    },
  });

  const handleEnableIntegration = () => {
    if (!selectedIntegration) return;

    const data: any = {
      integrationId: selectedIntegration.id,
    };

    // Add API key if provided (except for OpenAI which is per-user)
    if (apiKey && selectedIntegration.name !== "OpenAI") {
      data.apiKey = apiKey;
    }

    // Add configuration if provided
    if (configuration) {
      try {
        data.configuration = JSON.parse(configuration);
      } catch (e) {
        toast({
          title: "Invalid Configuration",
          description: "Configuration must be valid JSON",
          variant: "destructive",
        });
        return;
      }
    }

    enableIntegrationMutation.mutate(data);
  };

  const getIntegrationStatus = (integration: PlatformIntegration) => {
    const enabled = dashboardData?.enabledIntegrations.find(
      (fi) => fi.integrationId === integration.id
    );
    return enabled?.status || "available";
  };

  const isIntegrationEnabled = (integration: PlatformIntegration) => {
    return dashboardData?.enabledIntegrations.some(
      (fi) => fi.integrationId === integration.id && fi.status === "active"
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Document Management": "bg-blue-100 text-blue-800",
      "Communication": "bg-green-100 text-green-800",
      "Finance": "bg-purple-100 text-purple-800",
      "Analytics": "bg-orange-100 text-orange-800",
      "AI": "bg-red-100 text-red-800",
      "Cloud Storage": "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-gray-600">
            Manage platform integrations and firm-level API access
          </p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline">
            {dashboardData?.enabledIntegrations.length || 0} Active
          </Badge>
          <Badge variant="outline">
            {dashboardData?.availableIntegrations.length || 0} Available
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Integrations</TabsTrigger>
          <TabsTrigger value="enabled">Enabled Integrations</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData?.availableIntegrations.map((integration) => (
              <Card key={integration.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge className={getCategoryColor(integration.category)}>
                      {integration.category}
                    </Badge>
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Provider:</span>
                    <span className="font-medium">{integration.provider}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Auth Type:</span>
                    <Badge variant="outline">{integration.authType}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <div className="flex items-center space-x-1">
                      {getIntegrationStatus(integration) === "active" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : getIntegrationStatus(integration) === "error" ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Activity className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="capitalize">{getIntegrationStatus(integration)}</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    {isIntegrationEnabled(integration) ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => disableIntegrationMutation.mutate(integration.id)}
                        disabled={disableIntegrationMutation.isPending}
                      >
                        Disable Integration
                      </Button>
                    ) : (
                      <Dialog open={isEnableDialogOpen} onOpenChange={setIsEnableDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={() => setSelectedIntegration(integration)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Enable Integration
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Enable {selectedIntegration?.name}</DialogTitle>
                            <DialogDescription>
                              Configure API credentials and settings for this integration.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {selectedIntegration?.name !== "OpenAI" && (
                              <div className="space-y-2">
                                <Label htmlFor="apiKey">
                                  API Key
                                  {selectedIntegration?.authType === "API_KEY" && (
                                    <span className="text-red-500">*</span>
                                  )}
                                </Label>
                                <div className="flex items-center space-x-2">
                                  <Key className="h-4 w-4 text-gray-500" />
                                  <Input
                                    id="apiKey"
                                    type="password"
                                    placeholder="Enter API key..."
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                  />
                                </div>
                                <p className="text-sm text-gray-500">
                                  This API key will be shared across all users in your firm.
                                </p>
                              </div>
                            )}
                            {selectedIntegration?.name === "OpenAI" && (
                              <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertDescription>
                                  OpenAI API keys are configured per-user for security. Users will set their own keys in their profile settings.
                                </AlertDescription>
                              </Alert>
                            )}
                            <div className="space-y-2">
                              <Label htmlFor="configuration">Configuration (Optional)</Label>
                              <Textarea
                                id="configuration"
                                placeholder='{"key": "value"}'
                                value={configuration}
                                onChange={(e) => setConfiguration(e.target.value)}
                                rows={4}
                              />
                              <p className="text-sm text-gray-500">
                                JSON configuration for integration-specific settings.
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsEnableDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleEnableIntegration}
                              disabled={
                                enableIntegrationMutation.isPending ||
                                (selectedIntegration?.authType === "API_KEY" && 
                                 selectedIntegration?.name !== "OpenAI" && 
                                 !apiKey)
                              }
                            >
                              {enableIntegrationMutation.isPending ? "Enabling..." : "Enable"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enabled" className="space-y-6">
          {dashboardData?.enabledIntegrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Integrations Enabled</h3>
                <p className="text-gray-500 text-center mb-4">
                  Enable integrations from the Available tab to start connecting your firm's workflows.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dashboardData?.enabledIntegrations.map((integration) => (
                <Card key={integration.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {integration.status === "active" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : integration.status === "error" ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Activity className="h-5 w-5 text-gray-400" />
                          )}
                          <h3 className="font-medium">{integration.name}</h3>
                        </div>
                        <Badge variant={integration.status === "active" ? "default" : "destructive"}>
                          {integration.status}
                        </Badge>
                        {integration.apiCredentials?.hasApiKey && (
                          <Badge variant="outline">
                            <Key className="h-3 w-3 mr-1" />
                            API Key Set
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => disableIntegrationMutation.mutate(integration.integrationId)}
                          disabled={disableIntegrationMutation.isPending}
                        >
                          Disable
                        </Button>
                      </div>
                    </div>
                    {integration.errorMessage && (
                      <Alert className="mt-4" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{integration.errorMessage}</AlertDescription>
                      </Alert>
                    )}
                    <div className="mt-4 text-sm text-gray-500">
                      Enabled on {new Date(integration.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Integration Activity</CardTitle>
              <CardDescription>
                Track integration usage and configuration changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData?.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.details}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}