import { useState } from "react";
import { ChevronRight, CheckCircle } from "lucide-react";

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firmName: "",
    address: "",
    contactEmail: "",
    phone: "",
    documentTypes: [] as string[],
    teamMembers: [] as { name: string; email: string; role: string }[]
  });

  const steps = [
    { id: 1, name: "Firm Details", description: "Basic information about your firm" },
    { id: 2, name: "Document Types", description: "Configure your document workflows" },
    { id: 3, name: "Team Setup", description: "Add team members and roles" },
    { id: 4, name: "Review", description: "Confirm your settings" }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Firm Information</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Firm Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.firmName}
                  onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Document Types</h3>
            <p className="text-sm text-gray-600">Select the types of documents your firm commonly works with:</p>
            <div className="grid grid-cols-2 gap-4">
              {["NDA", "Contracts", "Leases", "Employment", "Settlement", "Discovery", "Litigation"].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.documentTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, documentTypes: [...formData.documentTypes, type] });
                      } else {
                        setFormData({ ...formData, documentTypes: formData.documentTypes.filter(t => t !== type) });
                      }
                    }}
                  />
                  <span className="ml-2 text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Team Setup</h3>
            <p className="text-sm text-gray-600">Add team members who will use the platform:</p>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>Paralegal</option>
                    <option>Associate</option>
                    <option>Partner</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-500 text-sm">+ Add Team Member</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Review & Confirm</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Firm Name</dt>
                  <dd className="text-sm text-gray-900">{formData.firmName || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Document Types</dt>
                  <dd className="text-sm text-gray-900">{formData.documentTypes.join(", ") || "None selected"}</dd>
                </div>
              </dl>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Step content */}
      {renderStepContent()}

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button
          onClick={currentStep === steps.length ? () => {/* Complete onboarding */} : handleNext}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {currentStep === steps.length ? "Complete Setup" : "Next"}
          {currentStep < steps.length && <ChevronRight className="ml-2 h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}