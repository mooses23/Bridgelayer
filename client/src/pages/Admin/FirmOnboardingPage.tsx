import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  Brain,
  X,
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
  
  // AI Assistant Configuration
  commonDocumentTypes: string[];
  researchRequirements: string[];
  reviewPriorities: 'speed' | 'thoroughness' | 'balanced';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  customPromptInstructions: string;
  analysisModules: {
    summarize: boolean;
    risk: boolean;
    clauses: boolean;
    crossref: boolean;
    formatting: boolean;
  };
  documentTemplates: Array<{
    id: string;
    name: string;
    type: string;
    enhancedPrompt: string;
    uploadedFile?: File;
  }>;
  
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
    commonDocumentTypes: [],
    researchRequirements: [],
    reviewPriorities: 'balanced',
    riskTolerance: 'moderate',
    customPromptInstructions: '',
    analysisModules: {
      summarize: true,
      risk: true,
      clauses: false,
      crossref: false,
      formatting: false
    },
    documentTemplates: [],
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
              <h3 className="text-lg font-medium mb-4">Feature Selection</h3>
              <p className="text-sm text-gray-600 mb-4">Choose which features to enable for your firm</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
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

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">AI Assistant Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">Configure AI analysis settings based on your firm profile and upload document templates for enhanced prompts</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Document Template Upload */}
                <div className="space-y-4">
                  <h4 className="font-medium">Document Templates</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload template documents</p>
                    <Button variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>
                  
                  {formData.documentTemplates.length > 0 && (
                    <div className="space-y-2">
                      {formData.documentTemplates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="text-sm font-medium">{template.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({template.type})</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Base Prompt Display */}
                <div className="space-y-4">
                  <h4 className="font-medium">Enhanced Prompt Preview</h4>
                  <div className="border rounded-lg p-4 bg-gray-50 h-64 overflow-y-auto">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium mb-2">TRUST LAYER ENHANCER</div>
                      <p className="mb-3">You are FIRMSYNC's AI Legal Assistant. Provide evidence-based analysis with specific citations...</p>
                      
                      <div className="font-medium mb-2">RISK PROFILE BALANCER</div>
                      <p className="mb-3">Current Risk Level: {formData.riskTolerance.toUpperCase()}</p>
                      
                      <div className="font-medium mb-2">ANALYSIS MODULES</div>
                      <ul className="mb-3">
                        {Object.entries(formData.analysisModules).filter(([_, enabled]) => enabled).map(([module]) => (
                          <li key={module} className="text-blue-600">• {module.charAt(0).toUpperCase() + module.slice(1)} Analysis</li>
                        ))}
                      </ul>
                      
                      {formData.customPromptInstructions && (
                        <>
                          <div className="font-medium mb-2">CUSTOM INSTRUCTIONS</div>
                          <p className="mb-3 bg-yellow-100 p-2 rounded">{formData.customPromptInstructions}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Configuration Controls */}
                <div className="space-y-4">
                  <h4 className="font-medium">Analysis Settings</h4>
                  
                  <div>
                    <Label htmlFor="reviewPriorities">Review Priorities</Label>
                    <Select 
                      value={formData.reviewPriorities} 
                      onValueChange={(value: 'speed' | 'thoroughness' | 'balanced') => 
                        updateFormData({ reviewPriorities: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speed">Speed (Quick Review)</SelectItem>
                        <SelectItem value="balanced">Balanced (Standard)</SelectItem>
                        <SelectItem value="thoroughness">Thoroughness (Deep Analysis)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                    <Select 
                      value={formData.riskTolerance} 
                      onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') => 
                        updateFormData({ riskTolerance: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Analysis Modules</Label>
                    <div className="space-y-2 mt-2">
                      {Object.entries(formData.analysisModules).map(([module, enabled]) => (
                        <div key={module} className="flex items-center space-x-2">
                          <Checkbox
                            id={module}
                            checked={enabled}
                            onCheckedChange={(checked) => 
                              updateFormData({
                                analysisModules: {
                                  ...formData.analysisModules,
                                  [module]: !!checked
                                }
                              })
                            }
                          />
                          <Label htmlFor={module} className="text-sm">
                            {module.charAt(0).toUpperCase() + module.slice(1)} Analysis
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customInstructions">Custom Instructions</Label>
                    <Textarea
                      id="customInstructions"
                      value={formData.customPromptInstructions}
                      onChange={(e) => updateFormData({ customPromptInstructions: e.target.value })}
                      placeholder="Enter firm-specific AI analysis instructions..."
                      rows={4}
                    />
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
              <h3 className="text-lg font-medium mb-4">AI Assistant Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">Configure AI analysis settings based on your firm profile: {formData.firmName} specializing in {formData.practiceAreas.join(', ')}</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Document Template Upload */}
                <div className="space-y-4">
                  <h4 className="font-medium">Document Templates</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload template documents</p>
                    <Button variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>
                  
                  {formData.documentTemplates.length > 0 && (
                    <div className="space-y-2">
                      {formData.documentTemplates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="text-sm font-medium">{template.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({template.type})</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    <p className="font-medium mb-1">Document Types Based on Practice Areas:</p>
                    <ul className="space-y-1">
                      {formData.practiceAreas.map(area => {
                        const typeMap = {
                          'Corporate Law': 'Corporate Agreements, M&A Documents',
                          'Real Estate': 'Purchase Agreements, Leases, Deeds',
                          'Employment Law': 'Employment Contracts, NDAs',
                          'Intellectual Property': 'Patent Applications, Licensing',
                          'Estate Planning': 'Wills, Trust Agreements',
                          'Litigation': 'Discovery Documents, Settlements'
                        };
                        return (
                          <li key={area} className="text-blue-600">
                            • {typeMap[area as keyof typeof typeMap] || 'General Legal Documents'}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Enhanced Prompt Preview */}
                <div className="space-y-4">
                  <h4 className="font-medium">Enhanced Prompt Preview</h4>
                  <div className="border rounded-lg p-4 bg-gray-50 h-64 overflow-y-auto">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium mb-2 text-blue-700">FIRMSYNC AI LEGAL ASSISTANT</div>
                      <p className="mb-3 bg-blue-50 p-2 rounded">Firm: {formData.firmName} | Practice: {formData.practiceAreas.join(', ')} | Size: {formData.firmSize}</p>
                      
                      <div className="font-medium mb-2">TRUST LAYER ENHANCER</div>
                      <p className="mb-3">Evidence-based analysis with specific citations. Professional paralegal-level assistance focusing on {formData.practiceAreas[0] || 'legal'} documentation...</p>
                      
                      <div className="font-medium mb-2">RISK PROFILE BALANCER</div>
                      <p className="mb-3">Current Risk Level: <span className="font-semibold text-red-600">{formData.riskTolerance.toUpperCase()}</span> | Review Priority: <span className="font-semibold text-green-600">{formData.reviewPriorities.toUpperCase()}</span></p>
                      
                      <div className="font-medium mb-2">ENABLED ANALYSIS MODULES</div>
                      <ul className="mb-3">
                        {Object.entries(formData.analysisModules).filter(([_, enabled]) => enabled).map(([module]) => (
                          <li key={module} className="text-blue-600">• {module.charAt(0).toUpperCase() + module.slice(1)} Analysis</li>
                        ))}
                      </ul>
                      
                      {formData.customPromptInstructions && (
                        <>
                          <div className="font-medium mb-2">FIRM-SPECIFIC INSTRUCTIONS</div>
                          <p className="mb-3 bg-yellow-100 p-2 rounded border-l-4 border-yellow-400">{formData.customPromptInstructions}</p>
                        </>
                      )}
                      
                      <div className="font-medium mb-2">INTEGRATIONS CONTEXT</div>
                      <p className="text-xs">Connected: {formData.selectedIntegrations.length} integrations | Features: {formData.enabledFeatures.length} enabled</p>
                    </div>
                  </div>
                </div>

                {/* Configuration Controls */}
                <div className="space-y-4">
                  <h4 className="font-medium">Analysis Settings</h4>
                  
                  <div>
                    <Label htmlFor="reviewPriorities">Review Priorities</Label>
                    <Select 
                      value={formData.reviewPriorities} 
                      onValueChange={(value: 'speed' | 'thoroughness' | 'balanced') => 
                        updateFormData({ reviewPriorities: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speed">Speed (Quick Review)</SelectItem>
                        <SelectItem value="balanced">Balanced (Standard)</SelectItem>
                        <SelectItem value="thoroughness">Thoroughness (Deep Analysis)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                    <Select 
                      value={formData.riskTolerance} 
                      onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') => 
                        updateFormData({ riskTolerance: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Analysis Modules</Label>
                    <div className="space-y-2 mt-2">
                      {Object.entries(formData.analysisModules).map(([module, enabled]) => (
                        <div key={module} className="flex items-center space-x-2">
                          <Checkbox
                            id={module}
                            checked={enabled}
                            onCheckedChange={(checked) => 
                              updateFormData({
                                analysisModules: {
                                  ...formData.analysisModules,
                                  [module]: !!checked
                                }
                              })
                            }
                          />
                          <Label htmlFor={module} className="text-sm">
                            {module.charAt(0).toUpperCase() + module.slice(1)} Analysis
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customInstructions">Custom Instructions</Label>
                    <Textarea
                      id="customInstructions"
                      value={formData.customPromptInstructions}
                      onChange={(e) => updateFormData({ customPromptInstructions: e.target.value })}
                      placeholder={`Enter ${formData.firmName} specific AI analysis instructions...`}
                      rows={4}
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-1">AI Configuration Summary</h5>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>• Practice Areas: {formData.practiceAreas.length} selected</p>
                      <p>• Integrations: {formData.selectedIntegrations.length} connected</p>
                      <p>• Features: {formData.enabledFeatures.length} enabled</p>
                      <p>• Admin: {formData.adminFirstName} {formData.adminLastName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firmName && formData.firmSlug && formData.email;
      case 2:
        return formData.practiceAreas.length > 0 && formData.firmSize;
      case 3:
        return formData.adminFirstName && formData.adminLastName && formData.adminEmail;
      case 4:
        return true; // Integration step is optional
      case 5:
        return formData.enabledFeatures.length > 0;
      case 6:
        return true; // AI configuration is optional but has defaults
      default:
        return false;
    }
  };



  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Firm Onboarding</h1>
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
            {currentStep === 5 && <Brain className="h-5 w-5 mr-2" />}
            {currentStep === 6 && <CheckCircle className="h-5 w-5 mr-2" />}
            {getStepTitle()}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Enter basic information about the law firm"}
            {currentStep === 2 && "Configure practice areas and firm settings"}
            {currentStep === 3 && "Set up the primary administrator account"}
            {currentStep === 4 && "Choose which platform integrations to enable"}
            {currentStep === 5 && "Select which features to enable for your firm"}
            {currentStep === 6 && "Configure AI analysis settings based on your firm profile"}
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
      case 5: return "Feature Selection";
      case 6: return "AI Assistant Configuration";
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
        return true; // Integration setup is optional
      case 5:
        return formData.intakeFormTitle && formData.intakeFormDescription && formData.intakeFormFields.length > 0;
      case 6:
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