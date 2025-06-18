import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  FileText, 
  Settings, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

interface IntakeFormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FirmOnboardingData {
  // Firm Information
  firmName: string;
  firmSlug: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Practice Areas
  practiceAreas: string[];
  firmSize: string;
  
  // Admin User
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminRole: string;
  
  // Integrations
  selectedIntegrations: string[];
  integrationConfigs: Record<string, any>;
  
  // Forum Intake
  intakeFormTitle: string;
  intakeFormDescription: string;
  intakeFormFields: IntakeFormField[];
  
  // Features & Settings
  enabledFeatures: string[];
  billingRate: string;
  timezone: string;
}

const PRACTICE_AREAS = [
  "Corporate Law",
  "Real Estate",
  "Employment Law",
  "Intellectual Property",
  "Estate Planning",
  "Finance & Banking",
  "Dispute Resolution",
  "Contract Law",
  "Tax Law",
  "Immigration Law",
  "Family Law",
  "Criminal Law"
];

const FIRM_SIZES = [
  "Solo Practice (1)",
  "Small Firm (2-10)",
  "Medium Firm (11-50)",
  "Large Firm (51-200)",
  "Enterprise (200+)"
];

const AVAILABLE_FEATURES = [
  { id: "documents", label: "Document Analysis", description: "AI-powered legal document review" },
  { id: "billing", label: "Time & Billing", description: "Track billable hours and generate invoices" },
  { id: "intake", label: "Client Intake", description: "Streamlined client onboarding forms" },
  { id: "communications", label: "Communications Log", description: "Track client interactions" },
  { id: "calendar", label: "Calendar Integration", description: "Deadline and appointment management" },
  { id: "analytics", label: "Practice Analytics", description: "Business intelligence and reporting" }
];

const AVAILABLE_INTEGRATIONS = [
  { id: "docusign", name: "DocuSign", category: "Document Management", description: "Electronic signature and document workflow" },
  { id: "quickbooks", name: "QuickBooks", category: "Accounting", description: "Financial management and invoicing" },
  { id: "google_workspace", name: "Google Workspace", category: "Productivity", description: "Email, calendar, and document collaboration" },
  { id: "slack", name: "Slack", category: "Communication", description: "Team messaging and collaboration" },
  { id: "microsoft_365", name: "Microsoft 365", category: "Productivity", description: "Office suite and email platform" },
  { id: "dropbox", name: "Dropbox", category: "Storage", description: "Cloud file storage and sharing" }
];

export default function FirmOnboardingPage() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  const [formData, setFormData] = useState<FirmOnboardingData>({
    firmName: "",
    firmSlug: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    practiceAreas: [],
    firmSize: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminRole: "firm_admin",
    selectedIntegrations: [],
    integrationConfigs: {},
    intakeFormTitle: "Client Intake Form",
    intakeFormDescription: "Please provide the following information to help us serve you better.",
    intakeFormFields: [
      { id: "1", type: "text", label: "Full Name", placeholder: "Enter your full name", required: true },
      { id: "2", type: "email", label: "Email Address", placeholder: "Enter your email", required: true },
      { id: "3", type: "phone", label: "Phone Number", placeholder: "Enter your phone number", required: false },
      { id: "4", type: "textarea", label: "Case Description", placeholder: "Briefly describe your legal matter", required: true }
    ],
    enabledFeatures: ["documents", "billing", "intake"],
    billingRate: "",
    timezone: "America/New_York"
  });

  const updateFormData = (updates: Partial<FirmOnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const togglePracticeArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      practiceAreas: prev.practiceAreas.includes(area)
        ? prev.practiceAreas.filter(a => a !== area)
        : [...prev.practiceAreas, area]
    }));
  };

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      enabledFeatures: prev.enabledFeatures.includes(featureId)
        ? prev.enabledFeatures.filter(f => f !== featureId)
        : [...prev.enabledFeatures, featureId]
    }));
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleFirmNameChange = (name: string) => {
    updateFormData({ 
      firmName: name,
      firmSlug: generateSlug(name)
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/admin/firms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        navigate('/admin/firms');
      } else {
        console.error('Failed to create firm');
      }
    } catch (error) {
      console.error('Error creating firm:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firmName">Firm Name *</Label>
                  <Input
                    id="firmName"
                    value={formData.firmName}
                    onChange={(e) => handleFirmNameChange(e.target.value)}
                    placeholder="Enter firm name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="firmSlug">Firm URL Slug *</Label>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500 mr-2">firmsync.com/</span>
                    <Input
                      id="firmSlug"
                      value={formData.firmSlug}
                      onChange={(e) => updateFormData({ firmSlug: e.target.value })}
                      placeholder="firm-name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Firm Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Brief description of your firm"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => updateFormData({ website: e.target.value })}
                      placeholder="https://www.yourfirm.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Firm Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      placeholder="contact@yourfirm.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData({ address: e.target.value })}
                    placeholder="Street address"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData({ city: e.target.value })}
                    placeholder="City"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateFormData({ state: e.target.value })}
                    placeholder="State"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData({ zipCode: e.target.value })}
                    placeholder="ZIP"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Practice Areas *</Label>
              <p className="text-sm text-gray-600 mb-4">Select all areas your firm practices in</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PRACTICE_AREAS.map((area) => (
                  <Button
                    key={area}
                    variant={formData.practiceAreas.includes(area) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePracticeArea(area)}
                    className="justify-start h-auto py-3"
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="firmSize">Firm Size *</Label>
              <Select value={formData.firmSize} onValueChange={(value) => updateFormData({ firmSize: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select firm size" />
                </SelectTrigger>
                <SelectContent>
                  {FIRM_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="billingRate">Standard Billable Rate ($/hour)</Label>
              <Input
                id="billingRate"
                type="number"
                value={formData.billingRate}
                onChange={(e) => updateFormData({ billingRate: e.target.value })}
                placeholder="350"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => updateFormData({ timezone: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="adminFirstName">First Name *</Label>
                <Input
                  id="adminFirstName"
                  value={formData.adminFirstName}
                  onChange={(e) => updateFormData({ adminFirstName: e.target.value })}
                  placeholder="John"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="adminLastName">Last Name *</Label>
                <Input
                  id="adminLastName"
                  value={formData.adminLastName}
                  onChange={(e) => updateFormData({ adminLastName: e.target.value })}
                  placeholder="Smith"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="adminEmail">Admin Email *</Label>
              <Input
                id="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => updateFormData({ adminEmail: e.target.value })}
                placeholder="admin@yourfirm.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="adminRole">Admin Role</Label>
              <Select value={formData.adminRole} onValueChange={(value) => updateFormData({ adminRole: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firm_admin">Firm Administrator</SelectItem>
                  <SelectItem value="managing_partner">Managing Partner</SelectItem>
                  <SelectItem value="senior_partner">Senior Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Integration Setup</h3>
              <p className="text-sm text-gray-600 mb-4">Select third-party services to integrate with your firm</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_INTEGRATIONS.map((integration) => (
                  <div
                    key={integration.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.selectedIntegrations.includes(integration.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      const selected = formData.selectedIntegrations.includes(integration.id);
                      updateFormData({
                        selectedIntegrations: selected
                          ? formData.selectedIntegrations.filter(id => id !== integration.id)
                          : [...formData.selectedIntegrations, integration.id]
                      });
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{integration.name}</h4>
                        <p className="text-sm text-gray-500">{integration.category}</p>
                        <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                      </div>
                      {formData.selectedIntegrations.includes(integration.id) && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Client Intake Form Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">Customize your client intake form</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Builder */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="intakeTitle">Form Title</Label>
                    <Input
                      id="intakeTitle"
                      value={formData.intakeFormTitle}
                      onChange={(e) => updateFormData({ intakeFormTitle: e.target.value })}
                      placeholder="Enter form title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="intakeDescription">Form Description</Label>
                    <Textarea
                      id="intakeDescription"
                      value={formData.intakeFormDescription}
                      onChange={(e) => updateFormData({ intakeFormDescription: e.target.value })}
                      placeholder="Enter form description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Form Fields</Label>
                    <div className="space-y-2 mt-2">
                      {formData.intakeFormFields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <span className="font-medium">{field.label}</span>
                            <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                            {field.required && <Badge variant="secondary" className="ml-2">Required</Badge>}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newFields = formData.intakeFormFields.filter((_, i) => i !== index);
                              updateFormData({ intakeFormFields: newFields });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Preview */}
                <div className="space-y-4">
                  <h4 className="font-medium">Form Preview</h4>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h5 className="font-medium mb-2">{formData.intakeFormTitle}</h5>
                    <p className="text-sm text-gray-600 mb-4">{formData.intakeFormDescription}</p>
                    
                    <div className="space-y-3">
                      {formData.intakeFormFields.map((field) => (
                        <div key={field.id}>
                          <Label>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {field.type === 'textarea' ? (
                            <Textarea placeholder={field.placeholder} disabled />
                          ) : field.type === 'select' ? (
                            <Select disabled>
                              <SelectTrigger>
                                <SelectValue placeholder={field.placeholder} />
                              </SelectTrigger>
                            </Select>
                          ) : (
                            <Input 
                              type={field.type === 'phone' ? 'tel' : field.type}
                              placeholder={field.placeholder} 
                              disabled 
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <Label>Platform Features</Label>
              <p className="text-sm text-gray-600 mb-4">Choose which features to enable for this firm</p>
              <div className="space-y-4">
                {AVAILABLE_FEATURES.map((feature) => (
                  <div
                    key={feature.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.enabledFeatures.includes(feature.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleFeature(feature.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{feature.label}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                      {formData.enabledFeatures.includes(feature.id) && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Firm Information";
      case 2: return "Practice Configuration";
      case 3: return "Administrator Setup";
      case 4: return "Integration Setup";
      case 5: return "Client Intake Configuration";
      case 6: return "Feature Selection";
      default: return "";
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firmName && formData.firmSlug;
      case 2:
        return formData.practiceAreas.length > 0 && formData.firmSize;
      case 3:
        return formData.adminFirstName && formData.adminLastName && formData.adminEmail;
      case 4:
        return formData.enabledFeatures.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Firm Onboarding</h1>
          <p className="text-gray-600">Set up a new law firm on the FirmSync platform</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/firms')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Firms
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}: {getStepTitle()}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {currentStep === 1 && <Building2 className="h-5 w-5 mr-2" />}
            {currentStep === 2 && <Settings className="h-5 w-5 mr-2" />}
            {currentStep === 3 && <Users className="h-5 w-5 mr-2" />}
            {currentStep === 4 && <FileText className="h-5 w-5 mr-2" />}
            {getStepTitle()}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Enter basic information about the law firm"}
            {currentStep === 2 && "Configure practice areas and firm settings"}
            {currentStep === 3 && "Set up the primary administrator account"}
            {currentStep === 4 && "Choose which platform features to enable"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-3">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!isStepValid()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Onboarding
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}