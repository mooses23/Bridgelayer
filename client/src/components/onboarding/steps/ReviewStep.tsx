import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  Building,
  Palette,
  Link,
  FileText,
  Users,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { UnifiedOnboardingData } from '../OnboardingWizard';

interface ReviewStepProps {
  data: UnifiedOnboardingData;
  onComplete: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

type ValidationResult = {
  isValid: boolean;
  message: string;
};

export function ReviewStep({ data, onComplete, onPrevious, isLoading }: ReviewStepProps) {
  const validateFirmInfo = (): ValidationResult => {
    if (!data.firmName || !data.subdomain || !data.contactEmail) {
      return {
        isValid: false,
        message: 'Missing required firm information'
      };
    }
    if (!data.acceptedNDA || !data.acceptedTerms) {
      return {
        isValid: false,
        message: 'Please accept the NDA and Terms of Service'
      };
    }
    return {
      isValid: true,
      message: 'Firm information is complete'
    };
  };

  const validateBranding = (): ValidationResult => {
    if (!data.firmDisplayName) {
      return {
        isValid: false,
        message: 'Missing firm display name'
      };
    }
    return {
      isValid: true,
      message: data.logo
        ? 'Branding and logo are configured'
        : 'Basic branding is configured (no logo)'
    };
  };

  const validateIntegrations = (): ValidationResult => {
    if (!data.storageProvider) {
      return {
        isValid: false,
        message: 'Please select a storage provider'
      };
    }
    return {
      isValid: true,
      message: `Storage provider and ${data.selectedIntegrations.length} integrations configured`
    };
  };

  const validateDocuments = (): ValidationResult => {
    if (!data.folderStructure.byMatter && !data.folderStructure.byDate) {
      return {
        isValid: false,
        message: 'Please configure folder structure'
      };
    }
    return {
      isValid: true,
      message: `${data.documentTemplates.length} templates uploaded, file management configured`
    };
  };

  const validateIntake = (): ValidationResult => {
    if (!data.intakeFormTitle || data.intakeFormFields.length === 0) {
      return {
        isValid: false,
        message: 'Client intake form is incomplete'
      };
    }
    return {
      isValid: true,
      message: `${data.intakeFormFields.length} intake form fields configured`
    };
  };

  const sections = [
    {
      title: 'Firm Information',
      icon: Building,
      validation: validateFirmInfo()
    },
    {
      title: 'Branding',
      icon: Palette,
      validation: validateBranding()
    },
    {
      title: 'Integrations',
      icon: Link,
      validation: validateIntegrations()
    },
    {
      title: 'Documents',
      icon: FileText,
      validation: validateDocuments()
    },
    {
      title: 'Client Intake',
      icon: Users,
      validation: validateIntake()
    }
  ];

  const allValid = sections.every(section => section.validation.isValid);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review &amp; Complete Setup
        </h2>
        <p className="text-gray-600">
          Review your configuration before launching your firm's portal
        </p>
      </div>

      {/* Configuration Review */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  <section.icon className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    {section.validation.isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <p className={`mt-1 text-sm ${
                    section.validation.isValid ? 'text-gray-600' : 'text-red-600'
                  }`}>
                    {section.validation.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!allValid && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            Please complete all required sections before proceeding
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button
          onClick={onComplete}
          disabled={!allValid || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Setting Up Your Portal
            </>
          ) : (
            'Complete & Launch Portal'
          )}
        </Button>
      </div>
    </div>
  );
}
