import { useSession } from "@/contexts/SessionContext";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Building, Users, Settings, Plug, CheckSquare, AlertCircle, ExternalLink } from "lucide-react";

export default function Onboarding() {
  console.log("[Onboarding] loaded");
  const { user } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Fetch available integrations from admin-managed platform
  const { data: availableIntegrations = [], isLoading: integrationsLoading } = useQuery({
    queryKey: ['/api/integrations/available'],
    queryFn: () => fetch('/api/integrations/available', { 
      credentials: 'include' 
    }).then(res => res.json())
  });
  const [formData, setFormData] = useState({
    firmName: "",
    firmType: "",
    practiceAreas: "",
    teamSize: "",
    address: "",
    phone: "",
    preferences: {
      documentTypes: [] as string[],
      analysisFeatures: [] as string[],
      reviewWorkflow: ""
    },
    selectedIntegrations: [] as number[],
    integrationCredentials: {} as Record<number, Record<string, string>>
  });



  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Submit onboarding data to backend
      const response = await fetch('/api/firm/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        // Redirect to dashboard after successful onboarding
        window.location.href = '/dashboard';
      } else {
        console.error('Onboarding failed');
      }
    } catch (error) {
      console.error('Error during onboarding:', error);
    }
  };

  // Integration selection handlers
  const handleIntegrationToggle = (integrationId: number) => {
    const isSelected = formData.selectedIntegrations.includes(integrationId);
    const updatedIntegrations = isSelected 
      ? formData.selectedIntegrations.filter(id => id !== integrationId)
      : [...formData.selectedIntegrations, integrationId];
    
    setFormData(prev => ({
      ...prev,
      selectedIntegrations: updatedIntegrations
    }));
  };

  const handleCredentialsChange = (integrationId: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      integrationCredentials: {
        ...prev.integrationCredentials,
        [integrationId]: {
          ...prev.integrationCredentials[integrationId],
          [field]: value
        }
      }
    }));
  };

  // Check if mandatory integrations are selected (storage + billing)
  const getMandatoryIntegrations = () => {
    const integrations = Array.isArray(availableIntegrations) ? availableIntegrations : [];
    const storage = integrations.find((i: any) => i.category === 'storage');
    const billing = integrations.find((i: any) => i.category === 'billing');
    return { storage, billing };
  };

  const isMandatoryRequirementMet = () => {
    const { storage, billing } = getMandatoryIntegrations();
    const hasStorage = storage && formData.selectedIntegrations.includes(storage.id);
    const hasBilling = billing && formData.selectedIntegrations.includes(billing.id);
    return hasStorage && hasBilling;
  };

  const steps = [
    { number: 1, title: "Firm Information", icon: Building },
    { number: 2, title: "Team Setup", icon: Users },
    { number: 3, title: "Integration Setup", icon: Plug }
  ];

  return (
    <div id="onboarding-page" className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to FirmSync</h1>
          <p className="mt-2 text-gray-600">Let's set up your firm's document workflow</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`flex flex-col items-center ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.number
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="mt-2 text-sm font-medium">{step.title}</span>
                </div>
              );
            })}
          </nav>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Tell us about your firm"}
              {currentStep === 2 && "Set up your team"}
              {currentStep === 3 && "Select Your Integrations"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Basic information about your legal practice"}
              {currentStep === 2 && "Add team members and assign roles"}
              {currentStep === 3 && "Choose the tools your firm needs to connect with FirmSync"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firmName">Firm Name</Label>
                    <Input
                      id="firmName"
                      value={formData.firmName}
                      onChange={(e) => setFormData({...formData, firmName: e.target.value})}
                      placeholder="Enter firm name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="firmType">Firm Type</Label>
                    <Select onValueChange={(value) => setFormData({...formData, firmType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select firm type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo Practice</SelectItem>
                        <SelectItem value="small">Small Firm (2-10 attorneys)</SelectItem>
                        <SelectItem value="medium">Medium Firm (11-50 attorneys)</SelectItem>
                        <SelectItem value="large">Large Firm (50+ attorneys)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="practiceAreas">Practice Areas</Label>
                  <Textarea
                    id="practiceAreas"
                    value={formData.practiceAreas}
                    onChange={(e) => setFormData({...formData, practiceAreas: e.target.value})}
                    placeholder="e.g., Corporate Law, Litigation, Real Estate"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter firm address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Team Management</h3>
                <p className="text-gray-600 mb-4">
                  You can add team members and assign roles after completing the initial setup.
                </p>
                <p className="text-sm text-gray-500">
                  For now, we'll set up the basic structure for your firm.
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <>
                {integrationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading available integrations...</p>
                  </div>
                ) : (
                  <>
                    {/* Mandatory Requirements Banner */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-amber-800">Required Integrations</h3>
                          <p className="text-sm text-amber-700 mt-1">
                            Your firm must select one Storage integration and one Billing integration to complete setup.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Integration Categories */}
                    <div className="space-y-6">
                      {['storage', 'billing', 'communication', 'productivity', 'legal_tools'].map((category) => {
                        const categoryIntegrations = Array.isArray(availableIntegrations) 
                          ? availableIntegrations.filter((i: any) => i.category === category)
                          : [];
                        
                        if (categoryIntegrations.length === 0) return null;

                        const isMandatory = category === 'storage' || category === 'billing';
                        const categoryTitle = {
                          storage: 'Document Storage',
                          billing: 'Billing & Time Tracking',
                          communication: 'Communication Tools',
                          productivity: 'Productivity Suite',
                          legal_tools: 'Legal Research & Tools'
                        }[category];

                        return (
                          <div key={category} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                                <span>{categoryTitle}</span>
                                {isMandatory && (
                                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                    Required
                                  </span>
                                )}
                              </h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {categoryIntegrations.map((integration: any) => {
                                const isSelected = formData.selectedIntegrations.includes(integration.id);
                                return (
                                  <div
                                    key={integration.id}
                                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => handleIntegrationToggle(integration.id)}
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                        isSelected
                                          ? 'border-blue-500 bg-blue-500'
                                          : 'border-gray-300'
                                      }`}>
                                        {isSelected && <CheckSquare className="w-3 h-3 text-white" />}
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{integration.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                                        {integration.features && (
                                          <div className="mt-2 flex flex-wrap gap-1">
                                            {integration.features.split(',').slice(0, 3).map((feature: string, idx: number) => (
                                              <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                                {feature.trim()}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <ExternalLink className="w-4 h-4 text-gray-400" />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selection Summary */}
                    {formData.selectedIntegrations.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <h3 className="font-medium text-blue-900">Selected Integrations</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.selectedIntegrations.map((integrationId) => {
                            const integration = Array.isArray(availableIntegrations) 
                              ? availableIntegrations.find((i: any) => i.id === integrationId)
                              : null;
                            return integration ? (
                              <span key={integrationId} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                {integration.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Validation Message */}
                    {!isMandatoryRequirementMet() && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <p className="text-sm text-red-700">
                            Please select at least one Storage integration and one Billing integration to continue.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  disabled={!isMandatoryRequirementMet()}
                  className={!isMandatoryRequirementMet() ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}