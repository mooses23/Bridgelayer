import { ReactNode } from "react";
import { CheckCircle, Circle } from "lucide-react";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep?: number;
  totalSteps?: number;
}

export default function OnboardingLayout({ 
  children, 
  currentStep = 1, 
  totalSteps = 4 
}: OnboardingLayoutProps) {
  const steps = [
    { id: 1, name: "Firm Details", description: "Basic information" },
    { id: 2, name: "Document Types", description: "Configure workflows" },
    { id: 3, name: "Team Setup", description: "Add team members" },
    { id: 4, name: "Review", description: "Confirm settings" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">FIRMSYNC</h1>
              <span className="ml-4 text-sm text-gray-500">Setup Wizard</span>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center space-x-8">
              {steps.map((step) => (
                <li key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center">
                      {step.id < currentStep ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : step.id === currentStep ? (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{step.id}</span>
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${
                        step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                  </div>
                  {step.id < steps.length && (
                    <div className={`w-16 h-0.5 ml-8 ${
                      step.id < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}