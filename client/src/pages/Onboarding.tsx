import { useSession } from "@/contexts/SessionContext";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Building, Users, Settings } from "lucide-react";

export default function Onboarding() {
  const { user, isLoading, isAuthenticated } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firmName: "",
    firmType: "",
    practiceAreas: "",
    teamSize: "",
    address: "",
    phone: "",
    preferences: {
      documentTypes: [],
      analysisFeatures: [],
      reviewWorkflow: ""
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If user is not firm_admin or firm_owner, redirect to dashboard
  if (user?.role !== "firm_admin" && user?.role !== "firm_owner") {
    return <Navigate to="/dashboard" />;
  }

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
        window.location.href = '/dashboard';
      } else {
        console.error('Onboarding failed');
      }
    } catch (error) {
      console.error('Error during onboarding:', error);
    }
  };

  const steps = [
    { number: 1, title: "Firm Information", icon: Building },
    { number: 2, title: "Team Setup", icon: Users },
    { number: 3, title: "Workflow Preferences", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
              {currentStep === 3 && "Configure your workflow"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Basic information about your legal practice"}
              {currentStep === 2 && "Add team members and assign roles"}
              {currentStep === 3 && "Choose your document analysis preferences"}
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
                <div>
                  <Label>Document Analysis Features</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      "Document Summarization",
                      "Risk Analysis",
                      "Clause Extraction",
                      "Cross-Reference Checking",
                      "Formatting Analysis"
                    ].map((feature) => (
                      <label key={feature} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          defaultChecked
                        />
                        <span className="text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="reviewWorkflow">Default Review Workflow</Label>
                  <Select onValueChange={(value) => setFormData({
                    ...formData,
                    preferences: {...formData.preferences, reviewWorkflow: value}
                  })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paralegal">Paralegal Review First</SelectItem>
                      <SelectItem value="associate">Associate Review First</SelectItem>
                      <SelectItem value="partner">Partner Review Required</SelectItem>
                      <SelectItem value="automated">Automated Processing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <Button onClick={handleComplete}>
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