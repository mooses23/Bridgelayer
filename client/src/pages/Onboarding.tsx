import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Building2, FileText, Shield, Users, Settings } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

interface DocumentTypeConfig {
  docType: string;
  displayName: string;
  summarize: boolean;
  riskAnalysis: boolean;
  clauseMode: 'check_only' | 'full_completion' | 'disabled';
  riskLevel: 'low' | 'medium' | 'high';
  reviewer: 'admin' | 'paralegal' | 'both';
  enabled: boolean;
}

interface OnboardingData {
  firmName: string;
  adminEmail: string;
  selectedDocTypes: string[];
  customConfigs: Record<string, Partial<DocumentTypeConfig>>;
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
  category: string;
}

const availableDocTypes: DocumentType[] = [
  // Most Common Legal Documents (Top 20)
  { id: 'nda', name: 'Non-Disclosure Agreements', description: 'Confidentiality and information protection contracts', category: 'Contract' },
  { id: 'employment', name: 'Employment Contracts', description: 'Job offers, employment agreements, and HR documents', category: 'Employment' },
  { id: 'lease', name: 'Lease Agreements', description: 'Property rental and leasing contracts', category: 'Real Estate' },
  { id: 'contract', name: 'General Contracts', description: 'Business contracts and commercial agreements', category: 'Contract' },
  { id: 'service_agreement', name: 'Service Agreements', description: 'Professional service and work contracts', category: 'Contract' },
  { id: 'settlement', name: 'Settlement Agreements', description: 'Legal settlements and dispute resolutions', category: 'Litigation' },
  { id: 'consulting_agreement', name: 'Consulting Agreements', description: 'Professional services and advisory contracts', category: 'Contract' },
  { id: 'purchase_agreement', name: 'Purchase Agreements', description: 'Sales and acquisition contracts', category: 'Contract' },
  { id: 'licensing_agreement', name: 'Licensing Agreements', description: 'Intellectual property and usage rights contracts', category: 'IP' },
  { id: 'loan_agreement', name: 'Loan Agreements', description: 'Financial lending and borrowing contracts', category: 'Finance' },
  { id: 'partnership_agreement', name: 'Partnership Agreements', description: 'Business partnership and collaboration contracts', category: 'Corporate' },
  { id: 'operating_agreement', name: 'Operating Agreements', description: 'LLC management and governance documents', category: 'Corporate' },
  { id: 'shareholder_agreement', name: 'Shareholder Agreements', description: 'Corporate governance and ownership contracts', category: 'Corporate' },
  { id: 'non_compete_agreement', name: 'Non-Compete Agreements', description: 'Post-employment competition restriction contracts', category: 'Employment' },
  { id: 'severance_agreement', name: 'Severance Agreements', description: 'Employment termination and benefit contracts', category: 'Employment' },
  { id: 'commercial_lease', name: 'Commercial Leases', description: 'Business property rental agreements', category: 'Real Estate' },
  { id: 'will', name: 'Wills', description: 'Estate planning and inheritance documents', category: 'Estate' },
  { id: 'power_of_attorney', name: 'Powers of Attorney', description: 'Legal authority and representation documents', category: 'Estate' },
  { id: 'merger_agreement', name: 'Merger Agreements', description: 'Business combination and consolidation contracts', category: 'Corporate' },
  { id: 'litigation', name: 'Litigation Documents', description: 'Court filings and legal proceedings', category: 'Litigation' }
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [firmName, setFirmName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [currentDocType, setCurrentDocType] = useState<string | null>(null);
  const [documentConfigs, setDocumentConfigs] = useState<Record<string, {
    summary: boolean;
    riskCheck: boolean;
    clauseSuggestions: 'check_only' | 'full_suggestions' | 'none';
    riskLevel: 'low' | 'medium' | 'high';
    reviewer: 'admin' | 'paralegal' | 'both';
  }>>({});

  const startOnboarding = useMutation({
    mutationFn: async (data: {firmName: string, adminEmail: string}) => {
      const response = await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      setStep(2);
    }
  });

  const completeOnboarding = useMutation({
    mutationFn: async (data: OnboardingData) => {
      const response = await fetch('/api/onboarding/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      setStep(5);
    }
  });

  const handleFirmInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (firmName && adminEmail) {
      startOnboarding.mutate({ firmName, adminEmail });
    }
  };

  const handleDocTypeSelection = (docTypeId: string, selected: boolean) => {
    if (selected) {
      setSelectedDocTypes([...selectedDocTypes, docTypeId]);
    } else {
      setSelectedDocTypes(selectedDocTypes.filter(id => id !== docTypeId));
      const newConfigs = { ...documentConfigs };
      delete newConfigs[docTypeId];
      setDocumentConfigs(newConfigs);
    }
  };

  const startDocumentConfiguration = () => {
    if (selectedDocTypes.length === 0) return;
    setCurrentDocType(selectedDocTypes[0]);
    setStep(3);
  };

  const handleDocumentConfig = (config: {
    summary: boolean;
    riskCheck: boolean;
    clauseSuggestions: 'check_only' | 'full_suggestions' | 'none';
    riskLevel: 'low' | 'medium' | 'high';
    reviewer: 'admin' | 'paralegal' | 'both';
  }) => {
    if (!currentDocType) return;
    
    setDocumentConfigs({
      ...documentConfigs,
      [currentDocType]: config
    });

    const currentIndex = selectedDocTypes.indexOf(currentDocType);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < selectedDocTypes.length) {
      setCurrentDocType(selectedDocTypes[nextIndex]);
    } else {
      setStep(4);
    }
  };

  const handleFinalSubmit = () => {
    const onboardingData: OnboardingData = {
      firmName,
      adminEmail,
      selectedDocTypes,
      customConfigs: Object.entries(documentConfigs).reduce((acc, [docType, config]) => {
        acc[docType] = {
          docType,
          displayName: availableDocTypes.find(dt => dt.id === docType)?.name || docType,
          summarize: config.summary,
          riskAnalysis: config.riskCheck,
          clauseMode: config.clauseSuggestions === 'full_suggestions' ? 'full_completion' : 
                     config.clauseSuggestions === 'check_only' ? 'check_only' : 'disabled',
          riskLevel: config.riskLevel,
          reviewer: config.reviewer,
          enabled: true
        };
        return acc;
      }, {} as Record<string, Partial<DocumentTypeConfig>>)
    };
    
    completeOnboarding.mutate(onboardingData);
  };

  const getCurrentDocTypeName = () => {
    const docType = availableDocTypes.find(dt => dt.id === currentDocType);
    return docType?.name || '';
  };

  const getConfigSummary = () => {
    return selectedDocTypes.map(docTypeId => {
      const docType = availableDocTypes.find(dt => dt.id === docTypeId);
      const config = documentConfigs[docTypeId];
      if (!docType || !config) return null;

      return {
        name: docType.name,
        summary: config.summary ? 'Yes' : 'No',
        riskCheck: config.riskCheck ? 'Yes' : 'No',
        clauseSuggestions: config.clauseSuggestions === 'full_suggestions' ? 'Suggest Changes' : 
                          config.clauseSuggestions === 'check_only' ? 'Review Only' : 'No',
        riskLevel: config.riskLevel.charAt(0).toUpperCase() + config.riskLevel.slice(1),
        reviewer: config.reviewer.charAt(0).toUpperCase() + config.reviewer.slice(1)
      };
    }).filter(Boolean);
  };

  // Step 1: Firm Information
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Document Workflow Setup</h1>
            <p className="text-gray-600 mt-2">Configure how your firm handles different types of legal documents</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Firm Information</CardTitle>
              <CardDescription>
                Let's start with some basic information about your firm.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFirmInfo} className="space-y-4">
                <div>
                  <Label htmlFor="firmName">Firm Name</Label>
                  <Input
                    id="firmName"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Enter your firm name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Administrator Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@lawfirm.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={startOnboarding.isPending}>
                  {startOnboarding.isPending ? 'Setting up...' : 'Continue'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: Document Type Selection
  if (step === 2) {
    const categories = Array.from(new Set(availableDocTypes.map(dt => dt.category)));
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Select Document Types</h1>
            <p className="text-gray-600 mt-2">Choose the types of documents your firm regularly handles</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {categories.map((category) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableDocTypes
                      .filter(docType => docType.category === category)
                      .map((docType) => (
                        <div key={docType.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <Checkbox
                            id={docType.id}
                            checked={selectedDocTypes.includes(docType.id)}
                            onCheckedChange={(checked) => handleDocTypeSelection(docType.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={docType.id} className="font-medium text-gray-900 cursor-pointer">
                              {docType.name}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{docType.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
              
              <div className="mt-8 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Selected: {selectedDocTypes.length} document types
                  </p>
                  <Button 
                    onClick={startDocumentConfiguration}
                    disabled={selectedDocTypes.length === 0}
                  >
                    Configure Document Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Document Configuration
  if (step === 3 && currentDocType) {
    const currentIndex = selectedDocTypes.indexOf(currentDocType);
    const totalDocs = selectedDocTypes.length;
    const currentConfig = documentConfigs[currentDocType] || {
      summary: true,
      riskCheck: true,
      clauseSuggestions: 'check_only',
      riskLevel: 'medium',
      reviewer: 'paralegal'
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Settings className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Configure Document Settings</h1>
            <p className="text-gray-600 mt-2">
              {getCurrentDocTypeName()} ({currentIndex + 1} of {totalDocs})
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document Review Settings</CardTitle>
              <CardDescription>
                Configure how {getCurrentDocTypeName()} should be processed and reviewed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Summaries */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="summary"
                  checked={currentConfig.summary}
                  onCheckedChange={(checked) => 
                    setDocumentConfigs({
                      ...documentConfigs,
                      [currentDocType]: { ...currentConfig, summary: checked as boolean }
                    })
                  }
                />
                <div>
                  <Label htmlFor="summary" className="font-medium">Generate document summaries</Label>
                  <p className="text-sm text-gray-600">Create executive summaries highlighting key terms and parties</p>
                </div>
              </div>

              {/* Flag Missing Clauses */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="riskCheck"
                  checked={currentConfig.riskCheck}
                  onCheckedChange={(checked) => 
                    setDocumentConfigs({
                      ...documentConfigs,
                      [currentDocType]: { ...currentConfig, riskCheck: checked as boolean }
                    })
                  }
                />
                <div>
                  <Label htmlFor="riskCheck" className="font-medium">Flag potential risks and missing clauses</Label>
                  <p className="text-sm text-gray-600">Identify missing standard clauses and potential legal risks</p>
                </div>
              </div>

              {/* Clause Suggestions Mode */}
              <div className="space-y-3">
                <Label className="font-medium">Review approach for missing clauses</Label>
                <RadioGroup
                  value={currentConfig.clauseSuggestions}
                  onValueChange={(value) => 
                    setDocumentConfigs({
                      ...documentConfigs,
                      [currentDocType]: { ...currentConfig, clauseSuggestions: value as 'check_only' | 'full_suggestions' | 'none' }
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="check_only" id="check_only" />
                    <Label htmlFor="check_only">Review only - flag issues for manual review</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full_suggestions" id="full_suggestions" />
                    <Label htmlFor="full_suggestions">Suggest changes - provide draft language for missing clauses</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">No clause analysis</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Risk Level */}
              <div className="space-y-3">
                <Label className="font-medium">Document risk level</Label>
                <Select
                  value={currentConfig.riskLevel}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setDocumentConfigs({
                      ...documentConfigs,
                      [currentDocType]: { ...currentConfig, riskLevel: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Standard business documents</SelectItem>
                    <SelectItem value="medium">Medium - Requires careful review</SelectItem>
                    <SelectItem value="high">High - Critical documents requiring attorney review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reviewer Assignment */}
              <div className="space-y-3">
                <Label className="font-medium">Default reviewer assignment</Label>
                <Select
                  value={currentConfig.reviewer}
                  onValueChange={(value: 'admin' | 'paralegal' | 'both') => 
                    setDocumentConfigs({
                      ...documentConfigs,
                      [currentDocType]: { ...currentConfig, reviewer: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paralegal">Paralegal</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="both">Both Paralegal and Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    const prevIndex = currentIndex - 1;
                    if (prevIndex >= 0) {
                      setCurrentDocType(selectedDocTypes[prevIndex]);
                    } else {
                      setStep(2);
                    }
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={() => handleDocumentConfig(currentConfig)}
                >
                  {currentIndex === totalDocs - 1 ? 'Review Configuration' : 'Next Document'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 4: Setup Summary
  if (step === 4) {
    const configSummary = getConfigSummary();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Setup Summary</h1>
            <p className="text-gray-600 mt-2">Review your document workflow configuration</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Firm: {firmName}</CardTitle>
              <CardDescription>Administrator: {adminEmail}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Document Types Configured: {selectedDocTypes.length}</h3>
                  <div className="space-y-4">
                    {configSummary.map((config, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <h4 className="font-medium text-gray-900">{config?.name}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Summaries:</span>
                            <span className="ml-2 font-medium">{config?.summary}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Risk Check:</span>
                            <span className="ml-2 font-medium">{config?.riskCheck}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Clause Review:</span>
                            <span className="ml-2 font-medium">{config?.clauseSuggestions}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Risk Level:</span>
                            <span className="ml-2 font-medium">{config?.riskLevel}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Reviewer:</span>
                            <span className="ml-2 font-medium">{config?.reviewer}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                  >
                    Back to Edit
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={completeOnboarding.isPending}
                  >
                    {completeOnboarding.isPending ? 'Saving Configuration...' : 'Complete Setup'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 5: Completion
  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Setup Complete!</h1>
            <p className="text-gray-600 mt-2">Your document workflow has been configured successfully</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">What happens next?</h3>
                  <div className="text-left space-y-3 max-w-md mx-auto">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                      <p className="text-sm text-gray-700">Your configuration files have been created for each document type</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                      <p className="text-sm text-gray-700">Document uploads will now be automatically processed according to your settings</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                      <p className="text-sm text-gray-700">Review workflows will route to the assigned reviewers based on document type</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}