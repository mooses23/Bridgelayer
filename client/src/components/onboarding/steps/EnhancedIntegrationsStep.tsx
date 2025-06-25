import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Cloud, Check, Key, Eye, EyeOff } from 'lucide-react';
import { UnifiedOnboardingData } from '../OnboardingWizard';
import { useToast } from '@/hooks/use-toast';

interface IntegrationsStepProps {
  data: UnifiedOnboardingData;
  updateData: (updates: Partial<UnifiedOnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const STORAGE_PROVIDERS = [
  {
    id: 'google' as const,
    name: 'Google Drive',
    description: 'Connect to Google Drive for document storage',
    icon: '📂',
    color: 'border-blue-500',
  },
  {
    id: 'dropbox' as const,
    name: 'Dropbox',
    description: 'Connect to Dropbox for document storage',
    icon: '📁',
    color: 'border-indigo-500',
  },
  {
    id: 'onedrive' as const,
    name: 'OneDrive',
    description: 'Connect to Microsoft OneDrive',
    icon: '☁️',
    color: 'border-green-500',
  },
];

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Electronic signature platform for legal documents',
    category: 'Document Management',
    requiresApiKey: true,
    icon: '✍️'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and financial management',
    category: 'Financial',
    requiresApiKey: true,
    icon: '💰'
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Email, calendar, and document collaboration',
    category: 'Productivity',
    requiresApiKey: false,
    icon: '📧'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and collaboration',
    category: 'Communication',
    requiresApiKey: true,
    icon: '💬'
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Office suite and email platform',
    category: 'Productivity',
    requiresApiKey: false,
    icon: '📊'
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Appointment scheduling and calendar management',
    category: 'Scheduling',
    requiresApiKey: true,
    icon: '📅'
  }
];

export function IntegrationsStep({ data, updateData, onNext, onPrevious }: IntegrationsStepProps) {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // Check OAuth status on component mount
  React.useEffect(() => {
    const checkOAuthStatus = async () => {
      try {
        const response = await fetch('/api/oauth/status/current-tenant');
        if (response.ok) {
          const status = await response.json();
          setConnectionStatus(status);
        }
      } catch (error) {
        console.error('Failed to check OAuth status:', error);
      }
    };
    checkOAuthStatus();
  }, []);

  const handleStorageConnect = async (provider: typeof STORAGE_PROVIDERS[0]) => {
    setConnecting(provider.id);
    try {
      updateData({ storageProvider: provider.id });
      
      // Initiate OAuth flow
      const response = await fetch(`/api/oauth/connect/${provider.id}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const { authUrl } = await response.json();
        window.open(authUrl, '_blank', 'width=500,height=600');
        
        toast({
          title: 'Connection Initiated',
          description: `Please complete the authorization in the popup window for ${provider.name}.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: `Failed to connect to ${provider.name}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleIntegrationToggle = (integrationId: string) => {
    const current = data.selectedIntegrations || [];
    const updated = current.includes(integrationId)
      ? current.filter(id => id !== integrationId)
      : [...current, integrationId];
    
    updateData({ selectedIntegrations: updated });
  };

  const handleApiKeyChange = (integrationId: string, apiKey: string) => {
    updateData({
      apiKeys: {
        ...data.apiKeys,
        [integrationId]: apiKey
      }
    });
  };

  const toggleApiKeyVisibility = (integrationId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }));
  };

  const selectedIntegrations = data.selectedIntegrations || [];
  const apiKeys = data.apiKeys || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            Storage & Integrations
          </CardTitle>
          <CardDescription>
            Connect your document storage and third-party services to streamline your workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="storage" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="storage">Document Storage</TabsTrigger>
              <TabsTrigger value="integrations">Service Integrations</TabsTrigger>
            </TabsList>
            
            {/* Storage Tab */}
            <TabsContent value="storage" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Choose Your Document Storage</h3>
                <p className="text-sm text-gray-600">
                  Select a cloud storage provider to securely store and access your legal documents.
                </p>
                
                <div className="grid gap-4">
                  {STORAGE_PROVIDERS.map((provider) => (
                    <Card key={provider.id} className={`cursor-pointer transition-colors ${
                      data.storageProvider === provider.id ? 'ring-2 ring-blue-500' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{provider.icon}</div>
                            <div>
                              <h4 className="font-medium">{provider.name}</h4>
                              <p className="text-sm text-gray-600">{provider.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {connectionStatus[provider.id] && (
                              <div className="flex items-center gap-1 text-green-600">
                                <Check className="h-4 w-4" />
                                <span className="text-sm">Connected</span>
                              </div>
                            )}
                            <Button
                              variant={data.storageProvider === provider.id ? "default" : "outline"}
                              onClick={() => handleStorageConnect(provider)}
                              disabled={connecting === provider.id}
                            >
                              {connecting === provider.id ? 'Connecting...' : 
                               connectionStatus[provider.id] ? 'Reconnect' : 'Connect'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Connect Third-Party Services</h3>
                <p className="text-sm text-gray-600">
                  Select the services you'd like to integrate with your firm management system.
                </p>
                
                <div className="grid gap-4">
                  {AVAILABLE_INTEGRATIONS.map((integration) => {
                    const isSelected = selectedIntegrations.includes(integration.id);
                    const hasApiKey = integration.requiresApiKey && apiKeys[integration.id];
                    
                    return (
                      <Card key={integration.id} className={`transition-colors ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      }`}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{integration.icon}</div>
                              <div>
                                <h4 className="font-medium">{integration.name}</h4>
                                <p className="text-sm text-gray-600">{integration.description}</p>
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  {integration.category}
                                </span>
                              </div>
                            </div>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleIntegrationToggle(integration.id)}
                            />
                          </div>
                          
                          {/* API Key Input */}
                          {isSelected && integration.requiresApiKey && (
                            <div className="space-y-2 pt-2 border-t">
                              <Label htmlFor={`api-key-${integration.id}`} className="text-sm font-medium">
                                <Key className="h-3 w-3 inline mr-1" />
                                API Key for {integration.name}
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  id={`api-key-${integration.id}`}
                                  type={showApiKeys[integration.id] ? "text" : "password"}
                                  placeholder={`Enter your ${integration.name} API key`}
                                  value={apiKeys[integration.id] || ''}
                                  onChange={(e) => handleApiKeyChange(integration.id, e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleApiKeyVisibility(integration.id)}
                                >
                                  {showApiKeys[integration.id] ? 
                                    <EyeOff className="h-4 w-4" /> : 
                                    <Eye className="h-4 w-4" />
                                  }
                                </Button>
                              </div>
                              {!hasApiKey && (
                                <p className="text-xs text-amber-600">
                                  API key required for this integration to work properly.
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button 
          type="button" 
          onClick={onNext}
          className="flex items-center gap-2"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
