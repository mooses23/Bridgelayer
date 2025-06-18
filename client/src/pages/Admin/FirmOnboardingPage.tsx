import { useState, useRef } from "react";
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
  MapPin,
  Upload
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
  riskTolerance: string;
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
  enableDocumentTemplates?: boolean;
  
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
  const totalSteps = 5;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    riskTolerance: '50',
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newTemplates = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      enhancedPrompt: '',
      uploadedFile: file
    }));

    updateFormData({
      documentTemplates: [...formData.documentTemplates, ...newTemplates]
    });
  };

  const removeTemplate = (templateId: string) => {
    updateFormData({
      documentTemplates: formData.documentTemplates.filter(t => t.id !== templateId)
    });
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

      case 4:
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

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">AI Assistant Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">Configure AI analysis settings based on your firm profile: {formData.firmName} specializing in {formData.practiceAreas.join(', ')}</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enhanced Prompt Preview with Document Template Toggle */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Enhanced Prompt Preview</h4>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="enableTemplateUpload" className="text-sm">Document Templates</Label>
                      <Checkbox
                        id="enableTemplateUpload"
                        checked={formData.enableDocumentTemplates || false}
                        onCheckedChange={(checked) => 
                          updateFormData({ enableDocumentTemplates: !!checked })
                        }
                      />
                    </div>
                  </div>
                  
                  {/* Document Template Upload (conditionally shown) */}
                  {formData.enableDocumentTemplates && (
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
                        <Upload className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                        <p className="text-sm text-blue-600 mb-2">Upload template documents for enhanced AI prompts</p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          multiple
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-blue-300 text-blue-600 hover:bg-blue-100"
                        >
                          Choose Files
                        </Button>
                      </div>
                      
                      {formData.documentTemplates.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {formData.documentTemplates.map((template) => (
                            <div key={template.id} className="flex items-center justify-between p-2 border border-blue-200 rounded bg-white">
                              <div>
                                <span className="text-sm font-medium text-blue-800">{template.name}</span>
                                <span className="text-xs text-blue-500 ml-2">({template.type})</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => removeTemplate(template.id)}>
                                <X className="h-3 w-3 text-blue-600" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border rounded-lg p-4 bg-gray-50 h-80 overflow-y-auto">
                    <div className="text-sm text-gray-700">
                      <div className="font-bold mb-3 text-blue-800 border-b pb-2">FIRMSYNC AI LEGAL ASSISTANT - {formData.firmName}</div>
                      
                      <div className="bg-blue-50 p-3 rounded mb-3 border-l-4 border-blue-400">
                        <p className="text-xs"><strong>Firm Profile:</strong> {formData.firmName} | <strong>Practice Areas:</strong> {formData.practiceAreas.join(', ')} | <strong>Size:</strong> {formData.firmSize}</p>
                        <p className="text-xs"><strong>Jurisdiction:</strong> {formData.state} | <strong>Risk Tolerance:</strong> {formData.riskTolerance}% | <strong>Priority:</strong> {formData.reviewPriorities}</p>
                      </div>

                      <div className="font-medium mb-2 text-green-700">COMPREHENSIVE CASE ANALYSIS FRAMEWORK</div>
                      <div className="text-xs mb-3 bg-green-50 p-2 rounded">
                        You are a highly skilled AI legal assistant integrated into {formData.firmName}'s system. You have been provided with a case submission from the firm portal, including case description and supporting documents. Your task is to analyze the information and produce a thorough legal analysis for the attorneys.
                      </div>

                      <div className="font-medium mb-2">ANALYSIS STRUCTURE:</div>
                      <div className="space-y-2 mb-3">
                        <div className="bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">
                          <p className="font-medium text-xs text-yellow-800">1. Facts and Context</p>
                          <p className="text-xs">Extract and merge all relevant facts, dates, events from case description and documents. Present clear timeline of background facts.</p>
                        </div>
                        
                        <div className="bg-orange-50 p-2 rounded border-l-2 border-orange-400">
                          <p className="font-medium text-xs text-orange-800">2. Legal Issues and Analysis</p>
                          <p className="text-xs">Determine case type ({formData.practiceAreas[0] || 'legal'} focus), jurisdiction importance, list legal issues with explanations.</p>
                        </div>
                        
                        <div className="bg-red-50 p-2 rounded border-l-2 border-red-400">
                          <p className="font-medium text-xs text-red-800">3. Obligations/Duties</p>
                          <p className="text-xs">Identify legal obligations, contractual duties, statutory requirements, fiduciary duties, and deadlines.</p>
                        </div>
                        
                        <div className="bg-purple-50 p-2 rounded border-l-2 border-purple-400">
                          <p className="font-medium text-xs text-purple-800">4. Risks/Liabilities</p>
                          <p className="text-xs">Assess potential legal penalties, financial exposures, reputational risks, procedural risks for client.</p>
                        </div>
                        
                        <div className="bg-teal-50 p-2 rounded border-l-2 border-teal-400">
                          <p className="font-medium text-xs text-teal-800">5. Opportunities/Strategies</p>
                          <p className="text-xs">Identify strategic advantages, negotiation opportunities, available remedies, creative legal strategies.</p>
                        </div>
                        
                        <div className="bg-gray-100 p-2 rounded border-l-2 border-gray-400">
                          <p className="font-medium text-xs text-gray-800">6. Information Gaps</p>
                          <p className="text-xs">Note missing information, open questions, required documents, needed verifications.</p>
                        </div>
                        
                        <div className="bg-indigo-50 p-2 rounded border-l-2 border-indigo-400">
                          <p className="font-medium text-xs text-indigo-800">7. Next Steps</p>
                          <p className="text-xs">Outline investigative, procedural, research, and drafting recommendations aligned with issues.</p>
                        </div>
                      </div>
                      
                      {formData.enableDocumentTemplates && formData.documentTemplates.length > 0 && (
                        <div className="bg-purple-50 p-2 rounded border-l-4 border-purple-400 mb-3">
                          <p className="font-medium text-xs text-purple-800">ENHANCED WITH FIRM TEMPLATES</p>
                          <p className="text-xs">Analysis enhanced with {formData.documentTemplates.length} firm-specific document templates for improved accuracy and firm-specific language patterns.</p>
                        </div>
                      )}
                      
                      {formData.customPromptInstructions && (
                        <div className="bg-yellow-100 p-2 rounded border-l-4 border-yellow-400 mb-3">
                          <p className="font-medium text-xs">FIRM-SPECIFIC INSTRUCTIONS</p>
                          <p className="text-xs">{formData.customPromptInstructions}</p>
                        </div>
                      )}
                      
                      <div className="font-medium mb-1">ENABLED ANALYSIS MODULES:</div>
                      <div className="text-xs grid grid-cols-2 gap-1 mb-3">
                        {Object.entries(formData.analysisModules).map(([module, enabled]) => (
                          <span key={module} className={`px-2 py-1 rounded ${enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {enabled ? '✓' : '○'} {module.charAt(0).toUpperCase() + module.slice(1)}
                          </span>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                        <strong>Professional Standard:</strong> Maintain analytical tone, base conclusions only on provided information, flag assumptions clearly, escalate high-risk items to attorney review.
                      </div>
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
                    <Label htmlFor="riskTolerance">Risk Tolerance (%)</Label>
                    <Select 
                      value={formData.riskTolerance} 
                      onValueChange={(value: string) => 
                        updateFormData({ riskTolerance: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25% (Conservative)</SelectItem>
                        <SelectItem value="50">50% (Moderate)</SelectItem>
                        <SelectItem value="75">75% (Aggressive)</SelectItem>
                        <SelectItem value="90">90% (High Risk)</SelectItem>
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
                      <p>• Templates: {formData.enableDocumentTemplates ? formData.documentTemplates.length : 0} uploaded</p>
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

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Firm Information";
      case 2: return "Account Creation";
      case 3: return "Storage Setup";
      case 4: return "Integrations";
      case 5: return "Forum Intake";
      case 6: return "AI Assistant Configuration";
      default: return "";
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