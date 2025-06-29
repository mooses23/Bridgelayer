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
  Building2,
  TrendingUp,
  Database,
  Plug
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

// Accept onboarding code for firm-specific context
interface IntegrationsPageProps {
  code?: string;
}
const IntegrationsPage: React.FC<IntegrationsPageProps> = ({ code }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedIntegration, setSelectedIntegration] = useState<PlatformIntegration | null>(null);
  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [configuration, setConfiguration] = useState("");

  // Fetch integration dashboard data with proper credentials
  const { data: dashboardData, isLoading, error } = useQuery<IntegrationDashboard>({
    queryKey: ["/api/integrations/dashboard"],
    queryFn: async () => {
      const response = await fetch('/api/integrations/dashboard', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Debug logging
  React.useEffect(() => {
    console.log("🔍 IntegrationsPage Dashboard Data:", { dashboardData, isLoading, error });
  }, [dashboardData, isLoading, error]);

  // Fetch platform integrations (admin only)
  const { data: platformIntegrations, isLoading: platformLoading } = useQuery<PlatformIntegration[]>({
    queryKey: ["/api/integrations/available"],
    queryFn: async () => {
      const response = await fetch('/api/integrations/available', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    retry: 2,
    refetchOnWindowFocus: false,
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

  // Show loading state while either query is loading
  if (isLoading || platformLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-gray-600">Loading integration data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading integrations...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if queries failed
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-gray-600">Error loading integration data</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Integrations</h3>
            <p className="text-gray-500 text-center mb-4">
              Unable to fetch integration data. Please check your connection and try again.
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/integrations/dashboard"] })}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Context-aware header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {code ? 'Firm Integration Selection' : 'Platform Integrations'}
          </h1>
          <p className="text-gray-600">
            {code 
              ? `Select integrations for firm ${code} (Step 2 of onboarding)`
              : 'Manage platform integrations and firm-level API access'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline">
            {dashboardData?.enabledIntegrations.length || 0} Active
          </Badge>
          <Badge variant="outline">
            {dashboardData?.availableIntegrations.length || 0} Available
          </Badge>
          {code && (
            <Badge variant="default">
              Onboarding Mode
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue={code ? "selection" : "marketplace"} className="space-y-6">
        <TabsList>
          {code ? (
            // Firm onboarding mode tabs
            <>
              <TabsTrigger value="selection">Select Integrations</TabsTrigger>
              <TabsTrigger value="preview">Preview Configuration</TabsTrigger>
            </>
          ) : (
            // Admin marketplace mode tabs
            <>
              <TabsTrigger value="marketplace">Platform Marketplace</TabsTrigger>
              <TabsTrigger value="firms">Firm Integrations</TabsTrigger>
              <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Firm Selection Mode */}
        {code && (
          <TabsContent value="selection" className="space-y-6">
            {/* Integration Categories Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                All Available ({dashboardData?.availableIntegrations.length || 0})
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
                  <Plug className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Integrations Available</h3>
                  <p className="text-gray-500 text-center">
                    No integrations are currently available for firms to enable.<br />
                    Contact your administrator to add integrations to the marketplace.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData?.availableIntegrations.map((integration) => (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Plug className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <Badge className={getCategoryColor(integration.category)} variant="secondary">
                              {integration.category}
                            </Badge>
                          </div>
                        </div>
                        {getAuthTypeIcon(integration.authType)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="mb-4">
                        {integration.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Server className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{integration.provider}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleEnableIntegration(integration)}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Enable for Firm
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {code && (
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Configuration Preview</CardTitle>
                <CardDescription>
                  Review the integrations that will be enabled for firm {code}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Configuration Preview</h3>
                  <p className="text-sm">
                    Selected integrations will appear here for final review<br />
                    before completing the onboarding process.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Admin Marketplace Mode */}
        {!code && (
          <TabsContent value="marketplace" className="space-y-6">
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

        <TabsContent value="firms" className="space-y-6">
          {/* Firm Integration Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Total Firms</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Active Integrations</p>
                    <p className="text-2xl font-bold">34</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-2xl font-bold">+8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {dashboardData?.enabledIntegrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Firm Integrations Yet</h3>
                <p className="text-gray-500 text-center mb-4">
                  Once firms start enabling integrations during onboarding, they will appear here for monitoring and management.
                </p>
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

        <TabsContent value="analytics" className="space-y-6">
          {/* Usage Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Total API Calls</p>
                    <p className="text-2xl font-bold">24,589</p>
                    <p className="text-xs text-green-600">+12% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold">98.7%</p>
                    <p className="text-xs text-green-600">+0.3% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-500">Avg Response</p>
                    <p className="text-2xl font-bold">247ms</p>
                    <p className="text-xs text-green-600">-23ms from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">Error Rate</p>
                    <p className="text-2xl font-bold">1.3%</p>
                    <p className="text-xs text-red-600">-0.3% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Integrations by Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Most Used Integrations</CardTitle>
              <CardDescription>Integration usage across all firms in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "DocuSign", usage: "8,234", firms: 8, trend: "+15%" },
                  { name: "QuickBooks", usage: "6,789", firms: 7, trend: "+8%" },
                  { name: "Google Workspace", usage: "5,432", firms: 10, trend: "+22%" },
                  { name: "Dropbox Business", usage: "3,876", firms: 6, trend: "+5%" },
                  { name: "Slack", usage: "2,945", firms: 4, trend: "+31%" }
                ].map((integration, index) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-gray-500">{integration.firms} firms using</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">{integration.usage}</p>
                        <p className="text-sm text-gray-500">API calls</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {integration.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {dashboardData?.recentActivity.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-500 text-center mb-4">
                  Integration usage analytics will populate as firms begin using platform integrations.
                </p>
                <div className="text-sm text-gray-400">
                  Metrics tracked: API usage, response times, error rates, firm adoption rates
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
};

export default IntegrationsPage;