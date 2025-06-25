
import { useMutation } from '@tanstack/react-query';
import { UnifiedOnboardingData } from '@/components/onboarding/OnboardingWizard';

export function useOnboardingApi() {
  return useMutation({
    mutationFn: async (data: UnifiedOnboardingData) => {
      // Get onboarding code from URL parameters
      const params = new URLSearchParams(window.location.search);
      const onboardingCode = params.get('code');
      
      if (!onboardingCode) {
        throw new Error('No onboarding code found in URL');
      }

      const formData = new FormData();
      
      // Transform UnifiedOnboardingData to match the backend schema
      const transformedData = {
        // Step 0: Template Selection
        selectedTemplate: data.selectedTemplate,
        templateCustomization: data.templateCustomizations,
        
        // Step 1: Enhanced Firm Information
        firmInfo: {
          name: data.firmName,
          subdomain: data.subdomain,
          email: data.contactEmail,
          phone: data.phone,
          website: data.website,
          address: {
            street: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: 'United States'
          },
          practiceAreas: data.practiceAreas,
          practiceRegion: data.practiceRegion,
          firmSize: data.firmSize,
          description: ''
        },
        
        // Step 2: Branding Content
        brandingContent: {
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          fontFamily: 'Inter',
          customCSS: ''
        },
        
        // Step 3: API Keys & Integrations
        apiKeysIntegrations: {
          storageProvider: data.storageProvider,
          billingProvider: '',
          calendarProvider: '',
          apiKeys: data.apiKeys
        },
        
        // Step 4: Account Creation
        accountCreation: {
          adminName: data.adminName,
          adminEmail: data.adminEmail,
          password: data.password,
          mfaEnabled: data.mfaEnabled,
          acceptedNDA: data.acceptedNDA,
          acceptedTerms: data.acceptedTerms
        },
        
        // Step 5: Forum/Intake Configuration
        forumIntake: {
          enableClientPortal: true,
          intakeFormFields: data.intakeFormFields,
          autoResponseTemplate: data.intakeFormDescription
        },
        
        // Step 6: Review & Confirmation
        reviewData: {
          marketingOptIn: false,
          newsletterOptIn: false,
          dataProcessingConsent: true,
          finalConfirmation: true
        },
        
        // Metadata
        source: 'admin' as const,
        completedSteps: [0, 1, 2, 3, 4, 5, 6],
        currentStep: 6
      };

      // Add JSON data
      Object.entries(transformedData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Add logo file if present
      if (data.logoFile) {
        formData.append('logo', data.logoFile);
      }

      const response = await fetch(`/api/onboarding/codes/${onboardingCode}/finish`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Unified onboarding failed');
      }

      return response.json();
    },
  });
}
