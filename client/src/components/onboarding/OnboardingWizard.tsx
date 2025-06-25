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
import { IntegrationsStep } from './steps/EnhancedIntegrationsStep';

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
  
  // Step 2: Integrations (3rd Party Marketplace)
  selectedIntegrations: string[];
  apiCredentials: Record<string, string>;
  marketplaceConnections: Record<string, any>;
  storageProvider: 'google' | 'dropbox' | 'onedrive' | '';
  
  // Step 3: LLM Agent Config
  llmProvider: 'openai' | 'anthropic' | 'custom' | '';
  llmApiKey: string;
  firmWideAgents: Array<{
    id: string;
    name: string;
    purpose: string;
    prompt: string;
    enabled: boolean;
  }>;
  agentSettings: {
    defaultModel: string;
    maxTokens: number;
    temperature: number;
  };
  
  // Step 4: Doc+ (Document-Specific Agents)
  documentAgents: Array<{
    id: string;
    name: string;
    documentType: string;
    workflow: string;
    prompt: string;
    enabled: boolean;
  }>;
  paralegalWorkflows: string[];
}

// Backward compatibility alias
export type OnboardingFormData = UnifiedOnboardingData;

const ENHANCED_STEPS = [
  { id: 1, title: 'Firm Setup', description: 'Complete firm details and generate unique code' },
  { id: 2, title: 'Integrations', description: '3rd party marketplace and API credentials' },
  { id: 3, title: 'LLM Agent Config', description: 'Configure AI agents for your firm' },
  { id: 4, title: 'Doc+ Agents', description: 'Add document-specific agents for workflows' }
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
      
      // Step 2: Integrations (3rd Party Marketplace)
      selectedIntegrations: [],
      apiCredentials: {},
      marketplaceConnections: {},
      storageProvider: '',
      
      // Step 3: LLM Agent Config
      llmProvider: '',
      llmApiKey: '',
      firmWideAgents: [],
      agentSettings: {
        defaultModel: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
      },
      
      // Step 4: Doc+ (Document-Specific Agents)
      documentAgents: [],
      paralegalWorkflows: [],
    };
  });

  const { mutate: completeOnboarding, isPending } = useOnboardingApi();

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
    if (currentStep < 4) {
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
      toast.success("Onboarding Complete! Welcome to FirmSync. Your dashboard is being prepared.");
      // Redirect to firm dashboard
      window.location.href = '/dashboard';
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
          <IntegrationsStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <LLMConfigStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <DocAgentsStep
            data={formData}
            updateData={updateFormData}
            onComplete={handleComplete}
            onPrevious={handlePrevious}
            isLoading={isPending}
          />
        );
      default:
        return null;
    }
  };

  const progress = ((currentStep) / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 md:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile step indicator */}
          <div className="md:hidden text-center">
            <p className="text-sm font-medium text-gray-900 mb-1">
              Step {currentStep + 1} of {ENHANCED_STEPS.length}: {ENHANCED_STEPS[currentStep]?.title}
            </p>
            <p className="text-xs text-gray-500">
              {ENHANCED_STEPS[currentStep]?.description}
            </p>
          </div>
        </div>

        {/* Auto-Save Status */}
        {(isSaving || saveError || lastSaved) && (
          <div className="mb-4">
            <Alert variant={saveError ? "destructive" : "default"} className="max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {saveError ? (
                  <span className="text-red-600">Auto-save failed: {saveError}</span>
                ) : isSaving ? (
                  <span className="flex items-center space-x-2">
                    <Save className="h-3 w-3 animate-pulse" />
                    <span>Saving progress...</span>
                  </span>
                ) : lastSaved ? (
                  <span className="text-green-600">
                    Progress saved at {lastSaved?.toLocaleTimeString()}
                  </span>
                ) : null}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{ENHANCED_STEPS[currentStep]?.title}</CardTitle>
            <CardDescription>{ENHANCED_STEPS[currentStep]?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OnboardingWizard;