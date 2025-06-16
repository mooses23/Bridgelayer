import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Building, User, Cloud } from 'lucide-react';
import { OnboardingFormData } from '../OnboardingWizard';

interface ReviewStepProps {
  data: OnboardingFormData;
  onComplete: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

export function ReviewStep({ data, onComplete, onPrevious, isLoading }: ReviewStepProps) {
  const storageProviderNames = {
    google: 'Google Drive',
    dropbox: 'Dropbox',
    onedrive: 'OneDrive'
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Review Your Setup</h3>
        <p className="text-gray-600">
          Please review your information before completing the setup
        </p>
      </div>

      <div className="space-y-4">
        {/* Firm Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Building className="w-5 h-5" />
              <span>Firm Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Firm Name:</span>
              <span className="font-medium">{data.firmName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subdomain:</span>
              <span className="font-medium">{data.subdomain}.firmsync.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contact Email:</span>
              <span className="font-medium">{data.contactEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Logo:</span>
              <span className="font-medium">
                {data.branding ? data.branding.name : 'None uploaded'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Admin Account */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <User className="w-5 h-5" />
              <span>Admin Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Admin Name:</span>
              <span className="font-medium">{data.adminName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Admin Email:</span>
              <span className="font-medium">{data.adminEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">MFA Enabled:</span>
              <span className="font-medium">{data.mfaEnabled ? 'Yes' : 'No'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Storage Setup */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Cloud className="w-5 h-5" />
              <span>Storage Setup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Storage Provider:</span>
              <span className="font-medium">
                {data.storageProvider ? storageProviderNames[data.storageProvider] : 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Connection Status:</span>
              <span className="font-medium text-green-600">Connected</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your firm's dashboard will be created with your branding</li>
          <li>• Your admin account will be set up with secure access</li>
          <li>• Document templates will be configured for your practice areas</li>
          <li>• You can start uploading documents and using AI analysis</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button 
          onClick={onComplete} 
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <span>
            {isLoading ? 'Setting up your firm...' : 'Complete Setup'}
          </span>
        </Button>
      </div>
    </div>
  );
}