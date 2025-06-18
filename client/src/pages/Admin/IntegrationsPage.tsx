import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  AlertCircle, 
  Activity, 
  Settings, 
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Users,
  Server,
  Key,
  RefreshCw,
  Download,
  Upload,
  Calendar,
  ExternalLink,
  Shield,
  Database
} from 'lucide-react';

interface PlatformIntegration {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  provider: string;
  logoUrl: string;
  webhookUrl: string | null;
  apiBaseUrl: string;
  authType: string;
  isActive: boolean;
  requiresApproval: boolean;
  planRestrictions: any;
  configSchema: any;
  createdAt: string;
  updatedAt: string;
}

interface FirmIntegration {
  id: number;
  firmId: number;
  integrationId: number;
  name?: string;
  status: string;
  configuration: any;
  apiCredentials: { hasApiKey: boolean } | null;
  enabledAt: Date;
  enabledBy: number;
  lastSyncAt?: Date | null;
  syncStatus?: string | null;
  errorMessage?: string | null;
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
    queryKey: ["/api/integrations/available"],
  });

  const enableIntegrationMutation = useMutation({
    mutationFn: async (data: { integrationId: number; apiKey: string; configuration: string }) => {
      const response = await fetch('/api/integrations/firm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to enable integration');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/dashboard"] });
      setIsEnableDialogOpen(false);
      setApiKey("");
      setConfiguration("");
      toast({
        description: "Integration enabled successfully",
      });
    },
    onError: () => {
      toast({
        description: "Failed to enable integration",
        variant: "destructive",
      });
    },
  });

  const handleEnableIntegration = (integration: PlatformIntegration) => {
    setSelectedIntegration(integration);
    setIsEnableDialogOpen(true);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Document Management': 'bg-blue-100 text-blue-800',
      'Finance': 'bg-green-100 text-green-800',
      'Communication': 'bg-purple-100 text-purple-800',
      'Productivity': 'bg-orange-100 text-orange-800',
      'Legal': 'bg-red-100 text-red-800',
      'AI': 'bg-indigo-100 text-indigo-800',
      'Analytics': 'bg-yellow-100 text-yellow-800',
      'Cloud Storage': 'bg-cyan-100 text-cyan-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAuthTypeIcon = (authType: string) => {
    switch (authType) {
      case 'API_KEY':
        return <Key className="h-4 w-4" />;
      case 'OAUTH2':
        return <Shield className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
          {/* Integration Categories Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
              All Categories ({dashboardData?.availableIntegrations.length || 0})
            </Badge>
            {Array.from(new Set(dashboardData?.availableIntegrations.map(i => i.category) || [])).map(category => (
              <Badge key={category} variant="outline" className="cursor-pointer hover:bg-gray-100">
                {category}
              </Badge>
            ))}
          </div>

          {dashboardData?.availableIntegrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Server className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Integrations Available</h3>
                <p className="text-gray-500 text-center">
                  Contact platform administrator to add new integrations to the marketplace.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData?.availableIntegrations.map((integration) => (
                <Card key={integration.id} className="relative hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getAuthTypeIcon(integration.authType)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <p className="text-sm text-gray-500">{integration.provider}</p>
                        </div>
                      </div>
                      <Badge className={getCategoryColor(integration.category)}>
                        {integration.category}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">{integration.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Auth:</span>
                        <Badge variant="outline" className="text-xs">
                          {integration.authType}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Status:</span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(integration.isActive ? 'active' : 'inactive')}
                          <span className="text-xs capitalize">
                            {integration.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {integration.apiBaseUrl && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">API Endpoint:</span>
                        <div className="flex items-center space-x-1">
                          <ExternalLink className="h-3 w-3" />
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {new URL(integration.apiBaseUrl).hostname}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <Button 
                        onClick={() => handleEnableIntegration(integration)}
                        className="w-full"
                        disabled={!integration.isActive}
                        variant={integration.isActive ? "default" : "secondary"}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {integration.isActive ? 'Enable Integration' : 'Unavailable'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
                <Button variant="outline" onClick={() => document.querySelector('[data-state="inactive"][value="available"]')?.click()}>
                  Browse Available Integrations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Management Controls */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Active Integrations</h3>
                  <p className="text-gray-500">Manage your firm's connected services and API configurations</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync All
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </div>

              {/* Integration Management Cards */}
              <div className="space-y-4">
                {dashboardData?.enabledIntegrations.map((integration) => (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getStatusIcon(integration.status)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-lg">
                                {integration.name || 'Unknown Integration'}
                              </h3>
                              <Badge variant={integration.status === 'active' ? 'default' : 'destructive'}>
                                {integration.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Enabled:</span>
                                <p className="font-medium">
                                  {new Date(integration.enabledAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">API Status:</span>
                                <div className="flex items-center space-x-1">
                                  {integration.apiCredentials?.hasApiKey ? (
                                    <>
                                      <Key className="h-3 w-3 text-green-500" />
                                      <span className="text-green-600">Configured</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="h-3 w-3 text-red-500" />
                                      <span className="text-red-600">Missing Key</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Last Sync:</span>
                                <p className="font-medium">
                                  {integration.lastSyncAt 
                                    ? new Date(integration.lastSyncAt).toLocaleDateString()
                                    : 'Never'
                                  }
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Users:</span>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span className="font-medium">
                                    {dashboardData?.userPermissions.filter(p => p.integrationId === integration.integrationId).length || 0}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {integration.syncStatus && integration.syncStatus !== 'success' && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <div className="flex items-center space-x-2">
                                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                                  <span className="text-sm text-yellow-800">
                                    Sync Issue: {integration.errorMessage || 'Unknown error'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Permissions
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Log Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Integration Activity Log</h3>
              <p className="text-gray-500">Track all integration events, configuration changes, and system activities</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Filter Dates
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Log
              </Button>
            </div>
          </div>

          {dashboardData?.recentActivity.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
                <p className="text-gray-500 text-center mb-4">
                  Integration activities will appear here as you enable and configure services.
                </p>
                <div className="text-sm text-gray-400">
                  Activity types tracked: Enablements, Configuration Changes, API Calls, Sync Events, Errors
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {dashboardData?.recentActivity.map((activity: any) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {activity.type === 'integration_enabled' && <Plus className="h-4 w-4 text-green-600" />}
                          {activity.type === 'sync_completed' && <RefreshCw className="h-4 w-4 text-blue-600" />}
                          {activity.type === 'permission_granted' && <Users className="h-4 w-4 text-purple-600" />}
                          {activity.type === 'config_updated' && <Settings className="h-4 w-4 text-orange-600" />}
                          {activity.type === 'sync_error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                          {!['integration_enabled', 'sync_completed', 'permission_granted', 'config_updated', 'sync_error'].includes(activity.type) && 
                            <Activity className="h-4 w-4 text-gray-600" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{activity.integration || 'System'}</span>
                              <Badge variant="outline" className="text-xs">
                                {activity.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>By: {activity.user}</span>
                            <span>•</span>
                            <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Load More Button */}
                <div className="p-4 border-t bg-gray-50">
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Load More Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Enable Integration Dialog */}
      <Dialog open={isEnableDialogOpen} onOpenChange={setIsEnableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Configure the integration settings and provide necessary credentials.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>
            
            <div>
              <Label htmlFor="configuration">Configuration (JSON)</Label>
              <Textarea
                id="configuration"
                value={configuration}
                onChange={(e) => setConfiguration(e.target.value)}
                placeholder='{"setting": "value"}'
                rows={4}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsEnableDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedIntegration) {
                  enableIntegrationMutation.mutate({
                    integrationId: selectedIntegration.id,
                    apiKey,
                    configuration
                  });
                }
              }}
              disabled={enableIntegrationMutation.isPending || !apiKey}
            >
              {enableIntegrationMutation.isPending ? 'Enabling...' : 'Enable Integration'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}