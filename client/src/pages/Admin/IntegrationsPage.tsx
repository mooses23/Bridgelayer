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
  EyeOff
} from 'lucide-react';

interface PlatformIntegration {
  id: number;
  name: string;
  description: string;
  category: string;
  provider: string;
  authType: string;
  status: string;
  version: string;
  settings: any;
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
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
                      {integration.status === "active" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm capitalize">{integration.status}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleEnableIntegration(integration)}
                    className="w-full"
                    disabled={integration.status !== "active"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Enable Integration
                  </Button>
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
                          <div>
                            <h3 className="font-medium">{integration.name || 'Unknown Integration'}</h3>
                            <p className="text-sm text-gray-500">
                              Enabled {new Date(integration.enabledAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {integration.apiCredentials?.hasApiKey ? 'Configured' : 'No API Key'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
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
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest integration events and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                No recent activity to display
              </div>
            </CardContent>
          </Card>
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