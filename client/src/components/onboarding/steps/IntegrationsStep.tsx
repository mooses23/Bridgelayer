import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link2, Settings, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IntegrationsData {
  selectedIntegrations: string[];
  docuSignEnabled: boolean;
  quickBooksEnabled: boolean;
  googleWorkspaceEnabled: boolean;
  slackEnabled: boolean;
  integrationCredentials: Record<string, any>;
}

interface IntegrationsStepProps {
  data: IntegrationsData;
  onChange: (data: Partial<IntegrationsData>) => void;
}

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Electronic signature and document management',
    category: 'Document Management',
    icon: '📝',
    setupRequired: true,
    popular: true,
    benefits: ['Digital signatures', 'Document workflows', 'Compliance tracking']
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and financial management',
    category: 'Financial',
    icon: '💰',
    setupRequired: true,
    popular: true,
    benefits: ['Invoice sync', 'Expense tracking', 'Financial reporting']
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    description: 'Email, calendar, and document collaboration',
    category: 'Productivity',
    icon: '📧',
    setupRequired: true,
    popular: true,
    benefits: ['Calendar sync', 'Document sharing', 'Email integration']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    category: 'Communication',
    icon: '💬',
    setupRequired: false,
    popular: false,
    benefits: ['Case notifications', 'Team updates', 'Deadline alerts']
  },
  {
    id: 'microsoft_365',
    name: 'Microsoft 365',
    description: 'Office suite and productivity tools',
    category: 'Productivity',
    icon: '📊',
    setupRequired: true,
    popular: false,
    benefits: ['Document editing', 'Calendar sync', 'Email integration']
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Cloud file storage and sharing',
    category: 'Storage',
    icon: '☁️',
    setupRequired: false,
    popular: false,
    benefits: ['File backup', 'Document sharing', 'Version control']
  }
];

export default function IntegrationsStep({ data, onChange }: IntegrationsStepProps) {
  const [selectedCredentialDialog, setSelectedCredentialDialog] = useState<string | null>(null);

  const handleInputChange = (field: keyof IntegrationsData, value: any) => {
    onChange({ [field]: value });
  };

  const toggleIntegration = (integrationId: string) => {
    const isSelected = data.selectedIntegrations.includes(integrationId);
    const newSelected = isSelected
      ? data.selectedIntegrations.filter(id => id !== integrationId)
      : [...data.selectedIntegrations, integrationId];
    
    handleInputChange('selectedIntegrations', newSelected);
    
    // Update specific boolean flags
    switch (integrationId) {
      case 'docusign':
        handleInputChange('docuSignEnabled', !isSelected);
        break;
      case 'quickbooks':
        handleInputChange('quickBooksEnabled', !isSelected);
        break;
      case 'google_workspace':
        handleInputChange('googleWorkspaceEnabled', !isSelected);
        break;
      case 'slack':
        handleInputChange('slackEnabled', !isSelected);
        break;
    }
  };

  const saveCredentials = (integrationId: string, credentials: any) => {
    const newCredentials = {
      ...data.integrationCredentials,
      [integrationId]: credentials
    };
    handleInputChange('integrationCredentials', newCredentials);
    setSelectedCredentialDialog(null);
  };

  const renderCredentialDialog = (integration: typeof AVAILABLE_INTEGRATIONS[0]) => {
    if (!integration.setupRequired) return null;

    return (
      <Dialog open={selectedCredentialDialog === integration.id} onOpenChange={(open) => !open && setSelectedCredentialDialog(null)}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCredentialDialog(integration.id)}
            disabled={!data.selectedIntegrations.includes(integration.id)}
          >
            <Settings className="w-4 h-4 mr-1" />
            Configure
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{integration.icon}</span>
              Configure {integration.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {integration.id === 'docusign' && (
              <DocuSignCredentials 
                credentials={data.integrationCredentials.docusign}
                onSave={(creds) => saveCredentials('docusign', creds)}
              />
            )}
            {integration.id === 'quickbooks' && (
              <QuickBooksCredentials 
                credentials={data.integrationCredentials.quickbooks}
                onSave={(creds) => saveCredentials('quickbooks', creds)}
              />
            )}
            {integration.id === 'google_workspace' && (
              <GoogleWorkspaceCredentials 
                credentials={data.integrationCredentials.google_workspace}
                onSave={(creds) => saveCredentials('google_workspace', creds)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const popularIntegrations = AVAILABLE_INTEGRATIONS.filter(i => i.popular);
  const otherIntegrations = AVAILABLE_INTEGRATIONS.filter(i => !i.popular);

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Integrations are optional but can greatly enhance your firm's workflow. 
          You can add or configure these later from your settings.
        </AlertDescription>
      </Alert>

      {/* Popular Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Popular Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {popularIntegrations.map((integration) => {
              const isSelected = data.selectedIntegrations.includes(integration.id);
              const hasCredentials = data.integrationCredentials[integration.id];
              
              return (
                <div
                  key={integration.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{integration.icon}</span>
                          <h3 className="font-medium">{integration.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {integration.category}
                          </Badge>
                          {integration.popular && (
                            <Badge variant="default" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {integration.benefits.map((benefit) => (
                            <Badge key={benefit} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && integration.setupRequired && (
                        <>
                          {hasCredentials ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs">Configured</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-amber-600">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-xs">Setup Required</span>
                            </div>
                          )}
                          {renderCredentialDialog(integration)}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Other Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Other Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {otherIntegrations.map((integration) => {
              const isSelected = data.selectedIntegrations.includes(integration.id);
              const hasCredentials = data.integrationCredentials[integration.id];
              
              return (
                <div
                  key={integration.id}
                  className={`border rounded-lg p-3 transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                      <div className="flex items-center gap-2">
                        <span>{integration.icon}</span>
                        <div>
                          <h4 className="font-medium text-sm">{integration.name}</h4>
                          <p className="text-xs text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                    </div>
                    {isSelected && integration.setupRequired && (
                      <div className="flex items-center gap-2">
                        {hasCredentials ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}
                        {renderCredentialDialog(integration)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {data.selectedIntegrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                You have selected {data.selectedIntegrations.length} integration(s):
              </p>
              <div className="flex flex-wrap gap-2">
                {data.selectedIntegrations.map((id) => {
                  const integration = AVAILABLE_INTEGRATIONS.find(i => i.id === id);
                  const hasCredentials = data.integrationCredentials[id];
                  return (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      <span>{integration?.icon}</span>
                      {integration?.name}
                      {integration?.setupRequired && (
                        hasCredentials ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                        )
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Credential configuration components
function DocuSignCredentials({ credentials, onSave }: { credentials?: any; onSave: (creds: any) => void }) {
  const [apiKey, setApiKey] = useState(credentials?.apiKey || '');
  const [accountId, setAccountId] = useState(credentials?.accountId || '');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="docusign-api-key">API Key</Label>
        <Input
          id="docusign-api-key"
          type="password"
          placeholder="Enter DocuSign API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="docusign-account-id">Account ID</Label>
        <Input
          id="docusign-account-id"
          placeholder="Enter DocuSign account ID"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onSave({ apiKey, accountId })}
          disabled={!apiKey || !accountId}
          size="sm"
        >
          Save Configuration
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="https://developers.docusign.com/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-1" />
            Get API Key
          </a>
        </Button>
      </div>
    </div>
  );
}

function QuickBooksCredentials({ credentials, onSave }: { credentials?: any; onSave: (creds: any) => void }) {
  const [clientId, setClientId] = useState(credentials?.clientId || '');
  const [clientSecret, setClientSecret] = useState(credentials?.clientSecret || '');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="qb-client-id">Client ID</Label>
        <Input
          id="qb-client-id"
          placeholder="Enter QuickBooks client ID"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="qb-client-secret">Client Secret</Label>
        <Input
          id="qb-client-secret"
          type="password"
          placeholder="Enter QuickBooks client secret"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onSave({ clientId, clientSecret })}
          disabled={!clientId || !clientSecret}
          size="sm"
        >
          Save Configuration
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="https://developer.intuit.com/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-1" />
            Get Credentials
          </a>
        </Button>
      </div>
    </div>
  );
}

function GoogleWorkspaceCredentials({ credentials, onSave }: { credentials?: any; onSave: (creds: any) => void }) {
  const [clientId, setClientId] = useState(credentials?.clientId || '');
  const [clientSecret, setClientSecret] = useState(credentials?.clientSecret || '');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="google-client-id">Client ID</Label>
        <Input
          id="google-client-id"
          placeholder="Enter Google client ID"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="google-client-secret">Client Secret</Label>
        <Input
          id="google-client-secret"
          type="password"
          placeholder="Enter Google client secret"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onSave({ clientId, clientSecret })}
          disabled={!clientId || !clientSecret}
          size="sm"
        >
          Save Configuration
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-1" />
            Google Console
          </a>
        </Button>
      </div>
    </div>
  );
}