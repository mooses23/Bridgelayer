import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, Info, ChevronLeft, ChevronRight, Building } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "@/contexts/SessionContext";

// Step components
import FirmInfoStep from "./steps/FirmInfoStep";
import BrandingStep from "./steps/BrandingStep";
import PreferencesStep from "./steps/PreferencesStep";
import IntegrationsStep from "./steps/IntegrationsStep";
import TemplatesStep from "./steps/TemplatesStep";
import ReviewStep from "./steps/ReviewStep";

export interface OnboardingData {
  // Step 1: Firm & Admin Info
  firmInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    adminName: string;
    adminEmail: string;
    timezone: string;
    acceptedTerms: boolean;
    acceptedNDA: boolean;
  };
  
  // Step 2: Branding & Identity
  branding: {
    logoFile: File | null;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    displayName: string;
  };
  
  // Step 3: Preferences & Defaults
  preferences: {
    defaultLanguage: string;
    practiceAreas: string[];
    caseTypes: string[];
    fileRetentionDays: number;
    auditTrailEnabled: boolean;
    folderStructure: 'by_matter' | 'by_date';
  };
  
  // Step 4: Integrations
  integrations: {
    selectedIntegrations: string[];
    docuSignEnabled: boolean;
    quickBooksEnabled: boolean;
    googleWorkspaceEnabled: boolean;
    slackEnabled: boolean;
    integrationCredentials: Record<string, any>;
  };
  
  // Step 5: Templates
  templates: {
    uploadedTemplates: Array<{
      file: File;
      templateType: string;
      description: string;
    }>;
  };
}

const STEPS = [
  { id: 1, title: "Firm & Admin Info", description: "Basic information and agreements" },
  { id: 2, title: "Branding & Identity", description: "Logo and visual identity" },
  { id: 3, title: "Preferences & Defaults", description: "Firm-specific settings" },
  { id: 4, title: "Integrations", description: "Third-party connections" },
  { id: 5, title: "Templates", description: "Upload custom templates" },
  { id: 6, title: "Review & Confirm", description: "Final review and completion" }
];

export default function OnboardingWizard() {
  const { user } = useSession();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `onboarding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    firmInfo: {
      name: "",
      address: "",
      phone: "",
      email: "",
      adminName: user?.firstName + " " + user?.lastName || "",
      adminEmail: user?.email || "",
      timezone: "America/New_York",
      acceptedTerms: false,
      acceptedNDA: false,
    },
    branding: {
      logoFile: null,
      logoUrl: "",
      primaryColor: "#2563eb",
      secondaryColor: "#64748b",
      displayName: "",
    },
    preferences: {
      defaultLanguage: "en",
      practiceAreas: [],
      caseTypes: [],
      fileRetentionDays: 2555, // 7 years
      auditTrailEnabled: true,
      folderStructure: 'by_matter',
    },
    integrations: {
      selectedIntegrations: [],
      docuSignEnabled: false,
      quickBooksEnabled: false,
      googleWorkspaceEnabled: false,
      slackEnabled: false,
      integrationCredentials: {},
    },
    templates: {
      uploadedTemplates: [],
    },
  });

  // Auto-save progress
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await fetch('/api/admin/onboarding/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            sessionId,
            currentStep,
            stepData: onboardingData,
            status: 'in_progress'
          }),
        });
      } catch (error) {
        console.error('Error saving onboarding progress:', error);
      }
    };

    const debounceTimer = setTimeout(saveProgress, 1000);
    return () => clearTimeout(debounceTimer);
  }, [onboardingData, currentStep, sessionId]);

  const updateOnboardingData = (step: keyof OnboardingData, data: Partial<OnboardingData[keyof OnboardingData]>) => {
    setOnboardingData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          onboardingData.firmInfo.name &&
          onboardingData.firmInfo.address &&
          onboardingData.firmInfo.email &&
          onboardingData.firmInfo.adminName &&
          onboardingData.firmInfo.adminEmail &&
          onboardingData.firmInfo.acceptedTerms &&
          onboardingData.firmInfo.acceptedNDA
        );
      case 2:
        return !!(onboardingData.branding.displayName);
      case 3:
        return !!(
          onboardingData.preferences.practiceAreas.length > 0 &&
          onboardingData.preferences.fileRetentionDays > 0
        );
      case 4:
        return true; // Integrations are optional
      case 5:
        return true; // Templates are optional
      case 6:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Incomplete Setup",
        description: "Please review and complete all required information.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          onboardingData,
          ipAddress: window.location.hostname,
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Firm Created Successfully!",
          description: `${onboardingData.firmInfo.name} has been set up and is ready to use.`,
        });
        
        // Redirect to the new firm's dashboard or admin panel
        window.location.href = result.redirectUrl || '/admin';
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "An error occurred during setup.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FirmInfoStep
            data={onboardingData.firmInfo}
            onChange={(data: Partial<OnboardingData['firmInfo']>) => updateOnboardingData('firmInfo', data)}
          />
        );
      case 2:
        return (
          <BrandingStep
            data={onboardingData.branding}
            onChange={(data: Partial<OnboardingData['branding']>) => updateOnboardingData('branding', data)}
          />
        );
      case 3:
        return (
          <PreferencesStep
            data={onboardingData.preferences}
            onChange={(data: Partial<OnboardingData['preferences']>) => updateOnboardingData('preferences', data)}
          />
        );
      case 4:
        return (
          <IntegrationsStep
            data={onboardingData.integrations}
            onChange={(data: Partial<OnboardingData['integrations']>) => updateOnboardingData('integrations', data)}
          />
        );
      case 5:
        return (
          <TemplatesStep
            data={onboardingData.templates}
            onChange={(data: Partial<OnboardingData['templates']>) => updateOnboardingData('templates', data)}
          />
        );
      case 6:
        return (
          <ReviewStep
            data={onboardingData}
            onChange={setOnboardingData}
          />
        );
      default:
        return null;
    }
  };

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FirmSync Setup Wizard
          </h1>
          <p className="text-gray-600">
            Set up your new law firm in just a few steps
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id === currentStep ? 'text-blue-600' : 
                  step.id < currentStep ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id === currentStep ? 'bg-blue-100 text-blue-600' :
                  step.id < currentStep ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.id < currentStep ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                <span className="text-xs mt-1 text-center max-w-20">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {STEPS[currentStep - 1]?.title}
              <Info className="w-4 h-4 text-gray-400" />
            </CardTitle>
            <p className="text-gray-600">
              {STEPS[currentStep - 1]?.description}
            </p>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isLoading || !validateStep(currentStep)}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Firm...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}