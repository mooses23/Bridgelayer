import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Steps } from '@/components/ui/steps';

const ONBOARDING_STEPS = [
  { id: 1, title: 'Firm Setup', path: '/admin/onboarding/setup' },
  { id: 2, title: 'Integrations', path: '/admin/onboarding/integrations' },
  { id: 3, title: 'LLM Config', path: '/admin/onboarding/llm' },
  { id: 4, title: 'Document Setup', path: '/admin/onboarding/documents' },
  { id: 5, title: 'Review & Launch', path: '/admin/onboarding/review' }
];

const OnboardingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const currentStep = ONBOARDING_STEPS.findIndex(step => location.pathname.startsWith(step.path)) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Firm Onboarding</h1>
          <p className="text-gray-500 mt-1">
            Setting up a new firm in FirmSync
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <Steps
            steps={ONBOARDING_STEPS}
            currentStep={currentStep}
          />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>

        {/* Code Badge */}
        {user?.onboardingCode && (
          <div className="fixed top-4 right-4 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium">
            Code: {user.onboardingCode}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingLayout;
