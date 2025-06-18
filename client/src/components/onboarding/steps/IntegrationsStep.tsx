import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Cloud, Check } from 'lucide-react';
import { OnboardingFormData } from '../OnboardingWizard';

interface IntegrationsStepProps {
  data: OnboardingFormData;
  updateData: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Electronic signature platform for legal documents',
    category: 'Document Management'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and financial management',
    category: 'Financial'
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Email, calendar, and document collaboration',
    category: 'Productivity'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and collaboration',
    category: 'Communication'
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Office suite and email platform',
    category: 'Productivity'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Cloud file storage and sharing',
    category: 'Storage'
  }
];

export function IntegrationsStep({ data, updateData, onNext, onPrevious }: IntegrationsStepProps) {
  const handleIntegrationToggle = (integrationId: string, checked: boolean) => {
    const updatedIntegrations = checked
      ? [...data.selectedIntegrations, integrationId]
      : data.selectedIntegrations.filter(id => id !== integrationId);
    
    updateData({ selectedIntegrations: updatedIntegrations });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Tools
        </h2>
        <p className="text-gray-600">
          Select the third-party services you'd like to integrate with FirmSync
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_INTEGRATIONS.map((integration) => (
          <Card 
            key={integration.id} 
            className={`cursor-pointer transition-all ${
              data.selectedIntegrations.includes(integration.id)
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => handleIntegrationToggle(
              integration.id,
              !data.selectedIntegrations.includes(integration.id)
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                </div>
                <Checkbox
                  checked={data.selectedIntegrations.includes(integration.id)}
                  onChange={(checked) => handleIntegrationToggle(integration.id, checked)}
                />
              </div>
              <CardDescription className="text-sm text-gray-500">
                {integration.category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{integration.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Check className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-800">
            Don't worry! You can add or configure these integrations later from your dashboard.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext}>
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}