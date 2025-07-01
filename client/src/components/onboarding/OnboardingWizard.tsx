import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
// TODO: Create these new step components
// import { LLMConfigStep } from './steps/LLMConfigStep';
// import { DocAgentsStep } from './steps/DocAgentsStep';

// Temporary placeholder components (will be replaced with proper implementations)
function LLMConfigStep({ data, updateData, onNext, onPrevious }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">LLM Agent Configuration</h2>
        <p className="text-gray-600">Configure AI agents for your firm operations.</p>
      </div>
      <div className="p-8 bg-blue-50 rounded-lg text-center">
        <p className="text-blue-800 font-medium">LLM Configuration Step</p>
        <p className="text-blue-600 text-sm mt-2">This step will be implemented next</p>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>Previous</Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}

function DocAgentsStep({ data, updateData, onComplete, onPrevious, isLoading }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Doc+ Agents</h2>
        <p className="text-gray-600">Add document-specific agents for paralegal workflows.</p>
      </div>
      <div className="p-8 bg-green-50 rounded-lg text-center">
        <p className="text-green-800 font-medium">Document Agents Step</p>
        <p className="text-green-600 text-sm mt-2">This step will be implemented next</p>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>Previous</Button>
        <Button onClick={onComplete} disabled={isLoading}>
          {isLoading ? 'Completing...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
}
import { useOnboardingApi } from '@/hooks/useOnboardingApi';
import { useAutoSave, onboardingStorage, onboardingAPI } from '@/hooks/useAutoSave';
import { toast } from '@/lib/toast';

// Import step components
import { FirmInfoStep } from './steps/FirmInfoStep';
import { BrandingStep } from './steps/BrandingStep';
import { IntegrationsStep } from './steps/EnhancedIntegrationsStep';
import { DocumentTemplatesStep } from './steps/DocumentTemplatesStep';
import { ClientIntakeStep } from './steps/ClientIntakeStep';
import { ReviewStep } from './steps/ReviewStep';

export interface UnifiedOnboardingData {
  // Step 1: Firm Setup
  firmName: string;
  subdomain: string;
  contactEmail: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  practiceAreas: string[];
  practiceRegion: string;
  firmSize: 'solo' | 'small' | 'medium' | 'large';
  acceptedNDA: boolean;
  acceptedTerms: boolean;
  ndaSignedAt?: Date;
  termsSignedAt?: Date;
  
  // Step 2: Branding & Customization
  logo: File | null;
  primaryColor: string;
  secondaryColor: string;
  firmDisplayName: string;
  timezone: string;
  
  // Step 3: Storage & Integrations
  storageProvider: 'google' | 'dropbox' | 'onedrive' | 'aws_s3' | '';
  oauthTokens: Record<string, any>;
  apiKeys: Record<string, string>;
  selectedIntegrations: string[];
  integrationConfigs: Record<string, any>;
  
  // Step 4: Document Templates & Preferences
  documentTemplates: File[];
  defaultLanguage: string;
  fileRetentionDays: number;
  auditTrailEnabled: boolean;
  folderStructure: Record<string, any>;
  caseTypes: string[];
  
  // Step 5: Client Intake Form
  intakeFormTitle: string;
  intakeFormDescription: string;
  intakeFormFields: Array<{
    id: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox';
    required: boolean;
    options?: string[];
  }>;
  autoResponseEnabled: boolean;
  autoResponseMessage: string;
}

const ENHANCED_STEPS = [
  { id: 1, title: 'Firm Setup', description: 'Basic information and legal agreements' },
  { id: 2, title: 'Branding', description: 'Logo, colors, and customization' },
  { id: 3, title: 'Integrations', description: 'Storage and third-party services' },
  { id: 4, title: 'Documents', description: 'Templates and file management' },
  { id: 5, title: 'Client Intake', description: 'Intake form configuration' },
  { id: 6, title: 'Review', description: 'Review and confirm setup' }
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Try to restore from session storage
  const [formData, setFormData] = useState<UnifiedOnboardingData>(() => {
    const restored = onboardingStorage.load();
    return restored || {
      // Step 1: Firm Setup
      firmName: '',
      subdomain: '',
      contactEmail: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      website: '',
      practiceAreas: [],
      practiceRegion: '',
      firmSize: 'solo',
      acceptedNDA: false,
      acceptedTerms: false,
      
      // Step 2: Branding & Customization
      logo: null,
      primaryColor: '#2563eb', // Default primary color
      secondaryColor: '#e2e8f0', // Default secondary color
      firmDisplayName: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Step 3: Storage & Integrations
      storageProvider: '',
      oauthTokens: {},
      apiKeys: {},
      selectedIntegrations: [],
      integrationConfigs: {},
      
      // Step 4: Document Templates & Preferences
      documentTemplates: [],
      defaultLanguage: 'en',
      fileRetentionDays: 365,
      auditTrailEnabled: true,
      folderStructure: {
        byMatter: true,
        byDate: false,
        customFolders: []
      },
      caseTypes: [],
      
      // Step 5: Client Intake Form
      intakeFormTitle: '',
      intakeFormDescription: '',
      intakeFormFields: [],
      autoResponseEnabled: true,
      autoResponseMessage: ''
    };
  });

  const { mutate: completeOnboarding, isPending } = useOnboardingApi();

  // Calculate progress percentage
  const progress = (currentStep / ENHANCED_STEPS.length) * 100;

  // Auto-save functionality with backend integration
  const { isSaving, saveError, lastSaved, manualSave } = useAutoSave(
    formData,
    async (data) => {
      // Save to both local storage and backend
      onboardingStorage.save(data);
      try {
        await onboardingAPI.saveProgress(data, currentStep);
      } catch (error) {
        console.warn('Backend save failed, using local storage only:', error);
      }
    },
    { interval: 30000, enabled: true }
  );

  const updateFormData = (updates: Partial<UnifiedOnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < ENHANCED_STEPS.length) {
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
      toast.success("Onboarding Complete! Your firm's portal is being prepared.");
      // Redirect to firm dashboard
      window.location.href = `/admin/firms/${formData.subdomain}/dashboard`;
    } catch (error) {
      toast.error("Onboarding Failed. Please check your information and try again.");
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
          <BrandingStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <IntegrationsStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <DocumentTemplatesStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <ClientIntakeStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <ReviewStep
            data={formData}
            onComplete={handleComplete}
            onPrevious={handlePrevious}
            isLoading={isPending}
          />
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Welcome to FirmSync
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Let's get your law firm set up in just a few steps
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 md:mb-8">
        <Progress value={progress} className="h-2 mb-4" />
        <div className="hidden md:flex justify-between">
          {ENHANCED_STEPS.map((step) => (
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
              <span className="text-xs text-gray-600">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-save Status */}
      {isSaving && (
        <Alert className="mb-4">
          <Save className="w-4 h-4" />
          <AlertDescription>
            Saving your progress...
          </AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Failed to save progress. Your changes will be saved locally.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Step */}
      <Card>
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}

export default OnboardingWizard;