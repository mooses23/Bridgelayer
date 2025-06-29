import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  User, 
  FileText, 
  Settings, 
  Send, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  UserPlus,
  Lock
} from 'lucide-react';

interface FirmOnboardingData {
  // Step 1: Law Firm Information
  firmName: string;
  firmSlug: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  logo: File | null;
  
  // Practice details
  practiceAreas: string[];
  practiceRegion: string;
  firmSize: string;
  
  // Step 2: Admin User Creation
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminRole: string;
  
  // Step 3: Template Configuration
  selectedIntegrations: string[];
  llmPrompts: Record<string, string>;
  customization: {
    primaryColor: string;
    secondaryColor: string;
    enabledFeatures: string[];
  };
}

const initialFormData: FirmOnboardingData = {
  firmName: '',
  firmSlug: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  email: '',
  website: '',
  logo: null,
  practiceAreas: [],
  practiceRegion: '',
  firmSize: '',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminRole: 'firm_admin',
  selectedIntegrations: [],
  llmPrompts: {
    clients: '',
    cases: '',
    documents: '',
    calendar: '',
    tasks: '',
    billing: '',
    paralegal: ''
  },
  customization: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    enabledFeatures: []
  }
};

const practiceAreaOptions = [
  'Criminal Law',
  'Family Law',
  'Corporate Law',
  'Real Estate Law',
  'Personal Injury',
  'Immigration Law',
  'Employment Law',
  'Intellectual Property',
  'Tax Law',
  'Estate Planning',
  'Bankruptcy Law',
  'Environmental Law'
];

const integrationOptions = [
  { id: 'docusign', name: 'DocuSign', description: 'Digital signature platform' },
  { id: 'quickbooks', name: 'QuickBooks', description: 'Accounting software' },
  { id: 'clio', name: 'Clio', description: 'Practice management' },
  { id: 'outlook', name: 'Outlook', description: 'Email and calendar' },
  { id: 'dropbox', name: 'Dropbox', description: 'Cloud storage' },
  { id: 'zoom', name: 'Zoom', description: 'Video conferencing' }
];

const featureOptions = [
  { id: 'clients', name: 'Client Management', description: 'Manage client information and communications' },
  { id: 'cases', name: 'Case Management', description: 'Track cases, deadlines, and progress' },
  { id: 'documents', name: 'Document Management', description: 'Store and organize legal documents' },
  { id: 'calendar', name: 'Calendar Management', description: 'Schedule court dates and appointments' },
  { id: 'tasks', name: 'Task Management', description: 'Assign and track tasks' },
  { id: 'billing', name: 'Billing Management', description: 'Invoice generation and payment tracking' },
  { id: 'paralegal', name: 'Paralegal+ Tools', description: 'Advanced research and document tools' },
  { id: 'intake', name: 'Client Intake', description: 'Client onboarding workflows' }
];

export default function FirmOnboardingFormPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FirmOnboardingData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof FirmOnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedFormData = (section: string, field: string, value: any) => {
    setFormData(prev => {
      const currentSection = prev[section as keyof FirmOnboardingData] as any;
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: value
        }
      };
    });
  };

  const handlePracticeAreaToggle = (area: string) => {
    const current = formData.practiceAreas;
    if (current.includes(area)) {
      updateFormData('practiceAreas', current.filter(a => a !== area));
    } else {
      updateFormData('practiceAreas', [...current, area]);
    }
  };

  const handleIntegrationToggle = (integrationId: string) => {
    const current = formData.selectedIntegrations;
    if (current.includes(integrationId)) {
      updateFormData('selectedIntegrations', current.filter(i => i !== integrationId));
    } else {
      updateFormData('selectedIntegrations', [...current, integrationId]);
    }
  };

  const handleFeatureToggle = (featureId: string) => {
    const current = formData.customization.enabledFeatures;
    if (current.includes(featureId)) {
      updateNestedFormData('customization', 'enabledFeatures', current.filter(f => f !== featureId));
    } else {
      updateNestedFormData('customization', 'enabledFeatures', [...current, featureId]);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleFirmNameChange = (name: string) => {
    updateFormData('firmName', name);
    if (!formData.firmSlug) {
      updateFormData('firmSlug', generateSlug(name));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firmName && formData.firmSlug && formData.email && formData.practiceAreas.length > 0);
      case 2:
        return !!(formData.adminFirstName && formData.adminLastName && formData.adminEmail);
      case 3:
        return formData.customization.enabledFeatures.length > 0;
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        title: "Please complete all required fields",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Here you would submit to your API
      console.log('Submitting onboarding data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Firm onboarding created successfully!",
        description: "The firm has been set up and credentials will be sent."
      });
      
      // Reset form or redirect
      setFormData(initialFormData);
      setCurrentStep(1);
      
    } catch (error) {
      toast({
        title: "Error creating firm",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Law Firm Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="firmName">Firm Name *</Label>
                  <Input
                    id="firmName"
                    value={formData.firmName}
                    onChange={(e) => handleFirmNameChange(e.target.value)}
                    placeholder="Johnson & Associates"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="firmSlug">Firm Slug (URL identifier) *</Label>
                  <Input
                    id="firmSlug"
                    value={formData.firmSlug}
                    onChange={(e) => updateFormData('firmSlug', e.target.value)}
                    placeholder="johnson-associates"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be used in the URL: firmsync.com/{formData.firmSlug}
                  </p>
                </div>

                <div>
                  <Label htmlFor="email">Business Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="contact@firm.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => updateFormData('website', e.target.value)}
                      placeholder="https://firm.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="firmSize">Firm Size</Label>
                  <Select value={formData.firmSize} onValueChange={(value) => updateFormData('firmSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select firm size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo Practice</SelectItem>
                      <SelectItem value="small">Small (2-10 attorneys)</SelectItem>
                      <SelectItem value="medium">Medium (11-50 attorneys)</SelectItem>
                      <SelectItem value="large">Large (50+ attorneys)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      placeholder="123 Main Street, Suite 100"
                      className="pl-10"
                      rows={2}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="New York"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    placeholder="NY"
                  />
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Practice Areas *</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {practiceAreaOptions.map(area => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={formData.practiceAreas.includes(area)}
                      onCheckedChange={() => handlePracticeAreaToggle(area)}
                    />
                    <Label htmlFor={area} className="text-sm">{area}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="practiceRegion">Practice Region</Label>
              <Select value={formData.practiceRegion} onValueChange={(value) => updateFormData('practiceRegion', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select practice region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="state">State-wide</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="local">Local/Regional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Admin User Creation</h3>
              <p className="text-gray-600 mb-6">
                Create the primary administrator account for this firm. This user will have full access to manage the firm's FirmSync instance.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminFirstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="adminFirstName"
                      value={formData.adminFirstName}
                      onChange={(e) => updateFormData('adminFirstName', e.target.value)}
                      placeholder="John"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="adminLastName">Last Name *</Label>
                  <Input
                    id="adminLastName"
                    value={formData.adminLastName}
                    onChange={(e) => updateFormData('adminLastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="adminEmail">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="adminEmail"
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => updateFormData('adminEmail', e.target.value)}
                      placeholder="john.doe@firm.com"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Login credentials will be sent to this email address
                  </p>
                </div>

                <div>
                  <Label htmlFor="adminRole">Role</Label>
                  <Select value={formData.adminRole} onValueChange={(value) => updateFormData('adminRole', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="firm_admin">Firm Administrator</SelectItem>
                      <SelectItem value="firm_owner">Firm Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Template Configuration</h3>
              
              {/* Enabled Features */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Enable Features *</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featureOptions.map(feature => (
                    <Card key={feature.id} className={`cursor-pointer transition-colors ${
                      formData.customization.enabledFeatures.includes(feature.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:border-gray-300'
                    }`} onClick={() => handleFeatureToggle(feature.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={formData.customization.enabledFeatures.includes(feature.id)}
                            onChange={() => {}}
                          />
                          <div>
                            <h5 className="font-medium">{feature.name}</h5>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Integrations */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Available Integrations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {integrationOptions.map(integration => (
                    <Card key={integration.id} className={`cursor-pointer transition-colors ${
                      formData.selectedIntegrations.includes(integration.id) 
                        ? 'border-green-500 bg-green-50' 
                        : 'hover:border-gray-300'
                    }`} onClick={() => handleIntegrationToggle(integration.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={formData.selectedIntegrations.includes(integration.id)}
                            onChange={() => {}}
                          />
                          <div>
                            <h5 className="font-medium">{integration.name}</h5>
                            <p className="text-sm text-gray-600">{integration.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Branding */}
              <div>
                <h4 className="font-medium mb-3">Branding & Customization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.customization.primaryColor}
                        onChange={(e) => updateNestedFormData('customization', 'primaryColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={formData.customization.primaryColor}
                        onChange={(e) => updateNestedFormData('customization', 'primaryColor', e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.customization.secondaryColor}
                        onChange={(e) => updateNestedFormData('customization', 'secondaryColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={formData.customization.secondaryColor}
                        onChange={(e) => updateNestedFormData('customization', 'secondaryColor', e.target.value)}
                        placeholder="#1E40AF"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review & Complete Onboarding</h3>
              <p className="text-gray-600 mb-6">
                Please review all information before completing the onboarding process.
              </p>
              
              {/* Firm Information Summary */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>Firm Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Name:</strong> {formData.firmName}</div>
                    <div><strong>Slug:</strong> {formData.firmSlug}</div>
                    <div><strong>Email:</strong> {formData.email}</div>
                    <div><strong>Phone:</strong> {formData.phone}</div>
                    <div className="md:col-span-2"><strong>Practice Areas:</strong> {formData.practiceAreas.join(', ')}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin User Summary */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5" />
                    <span>Administrator Account</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Name:</strong> {formData.adminFirstName} {formData.adminLastName}</div>
                    <div><strong>Email:</strong> {formData.adminEmail}</div>
                    <div><strong>Role:</strong> {formData.adminRole}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Features & Integrations Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <strong>Enabled Features:</strong>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.customization.enabledFeatures.map(featureId => {
                          const feature = featureOptions.find(f => f.id === featureId);
                          return (
                            <Badge key={featureId} variant="secondary">
                              {feature?.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <strong>Selected Integrations:</strong>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.selectedIntegrations.map(integrationId => {
                          const integration = integrationOptions.find(i => i.id === integrationId);
                          return (
                            <Badge key={integrationId} variant="outline">
                              {integration?.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <strong>Branding:</strong>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: formData.customization.primaryColor }}
                          />
                          <span className="text-sm">Primary: {formData.customization.primaryColor}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: formData.customization.secondaryColor }}
                          />
                          <span className="text-sm">Secondary: {formData.customization.secondaryColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Law Firm Onboarding</h1>
        <p className="mt-2 text-gray-600">
          Complete the onboarding process to set up a new law firm on FirmSync
        </p>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
          
          <div className="flex justify-between mt-4 text-sm">
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Firm Information
            </span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Admin User
            </span>
            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Configuration
            </span>
            <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Review
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent className="p-6">
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
          <ArrowLeft className="mr-2 w-4 h-4" />
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={handleNext}
            disabled={!validateStep(currentStep)}
          >
            Next
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Firm...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 w-4 h-4" />
                Complete Onboarding
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
