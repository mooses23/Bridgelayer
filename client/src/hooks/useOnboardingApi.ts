
import { useMutation } from '@tanstack/react-query';
import { OnboardingFormData } from '@/components/onboarding/OnboardingWizard';

export function useOnboardingApi() {
  return useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'branding' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'oauthTokens' || key === 'apiKeys') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, String(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Onboarding failed');
      }

      return response.json();
    },
  });
}
