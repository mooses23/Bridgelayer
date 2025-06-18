import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from 'lucide-react';
import { FirmInfoStep } from './steps/FirmInfoStep';
import { AccountCreationStep } from './steps/AccountCreationStep';
import { ApiKeysStep } from './steps/ApiKeysStep';
import { ReviewStep } from './steps/ReviewStep';
import { useOnboardingApi } from '@/hooks/useOnboardingApi';
import { toast } from '@/lib/toast';

export interface OnboardingFormData {
  // Step 1: Firm Info
  firmName: string;
  subdomain: string;
  contactEmail: string;
  branding?: File;

  // Step 2: Account Creation
  adminName: string;
  adminEmail: string;
  password: string;
  confirmPassword: string;
  mfaEnabled: boolean;

  // Step 3: API Keys
  storageProvider: 'google' | 'dropbox' | 'onedrive' | '';
  apiKeys: Record<string, string>;
  oauthTokens: Record<string, any>;

  // Step 4: Integrations
  selectedIntegrations: string[];
  integrationConfigs: Record<string, any>;

  // Step 5: Forum Intake
  intakeFormFields: Array<{
    id: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox';
    required: boolean;
    options?: string[];
  }>;
  intakeFormTitle: string;
  intakeFormDescription: string;
}

const STEPS = [
  { id: 1, title: 'Firm Information', description: 'Basic firm details and branding' },
  { id: 2, title: 'Account Creation', description: 'Create your admin account' },
  { id: 3, title: 'Storage Setup', description: 'Connect cloud storage' },
  { id: 4, title: 'Integrations', description: 'Connect third-party services' },
  { id: 5, title: 'Forum Intake', description: 'Configure client intake forms' },
  { id: 6, title: 'Review', description: 'Confirm your settings' }
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    firmName: '',
    subdomain: '',
    contactEmail: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    mfaEnabled: false,
    storageProvider: '',
    apiKeys: {},
    oauthTokens: {},
    selectedIntegrations: [],
    integrationConfigs: {},
    intakeFormFields: [
      { id: 'name', label: 'Full Name', type: 'text', required: true },
      { id: 'email', label: 'Email Address', type: 'email', required: true },
      { id: 'phone', label: 'Phone Number', type: 'phone', required: false },
      { id: 'matter_type', label: 'Matter Type', type: 'select', required: true, options: ['Personal Injury', 'Family Law', 'Criminal Defense', 'Business Law', 'Real Estate'] }
    ],
    intakeFormTitle: 'Client Intake Form',
    intakeFormDescription: 'Please provide your information so we can assist you with your legal matter.'
  });

  const { mutate: completeOnboarding, isPending } = useOnboardingApi();

  const updateFormData = (updates: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding(formData);
      toast({
        description: "Onboarding Complete! Welcome to FirmSync. Your dashboard is being prepared."
      });
      // Redirect to firm dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      toast({
        description: "Onboarding Failed. Please check your information and try again.",
        variant: "destructive"
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FirmInfoStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <AccountCreationStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <ApiKeysStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={formData}
            onComplete={handleComplete}
            onPrevious={handlePrevious}
            isLoading={isPending}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to FirmSync
          </h1>
          <p className="text-gray-600">
            Let's get your law firm set up in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className="flex items-center mb-2">
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : currentStep === step.id ? (
                    <Circle className="w-6 h-6 text-blue-500 fill-current" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1]?.title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1]?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}