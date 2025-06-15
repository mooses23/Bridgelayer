import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Building2, FileText, Shield, Users, Settings, ChevronRight, ChevronLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

interface DocumentTypeConfig {
  docType: string;
  displayName: string;
  summarize: boolean;
  clauseCheck: boolean;
  suggestionMode: 'review_only' | 'suggest_changes';
  riskLevel: 'low' | 'medium' | 'high';
  reviewer: 'admin' | 'paralegal' | 'both';
  enabled: boolean;
}

interface OnboardingData {
  firmName: string;
  adminEmail: string;
  selectedDocTypes: string[];
  documentConfigs: Record<string, DocumentTypeConfig>;
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultRiskLevel: 'low' | 'medium' | 'high';
  defaultReviewer: 'admin' | 'paralegal' | 'both';
}

const availableDocTypes: DocumentType[] = [
  // Corporate & Business
  { id: 'nda', name: 'Non-Disclosure Agreements', description: 'Confidentiality and information protection', category: 'Corporate', defaultRiskLevel: 'low', defaultReviewer: 'paralegal' },
  { id: 'service_agreement', name: 'Service Agreements', description: 'Professional service contracts', category: 'Corporate', defaultRiskLevel: 'medium', defaultReviewer: 'paralegal' },
  { id: 'contract', name: 'General Contracts', description: 'Business and commercial agreements', category: 'Corporate', defaultRiskLevel: 'medium', defaultReviewer: 'paralegal' },
  { id: 'partnership_agreement', name: 'Partnership Agreements', description: 'Business partnership contracts', category: 'Corporate', defaultRiskLevel: 'high', defaultReviewer: 'admin' },
  { id: 'operating_agreement', name: 'Operating Agreements', description: 'LLC management documents', category: 'Corporate', defaultRiskLevel: 'high', defaultReviewer: 'admin' },
  { id: 'shareholder_agreement', name: 'Shareholder Agreements', description: 'Corporate governance contracts', category: 'Corporate', defaultRiskLevel: 'high', defaultReviewer: 'admin' },
  { id: 'merger_agreement', name: 'Merger Agreements', description: 'Business combination contracts', category: 'Corporate', defaultRiskLevel: 'high', defaultReviewer: 'admin' },
  
  // Employment
  { id: 'employment', name: 'Employment Contracts', description: 'Job offers and employment agreements', category: 'Employment', defaultRiskLevel: 'medium', defaultReviewer: 'paralegal' },
  { id: 'non_compete_agreement', name: 'Non-Compete Agreements', description: 'Post-employment restrictions', category: 'Employment', defaultRiskLevel: 'high', defaultReviewer: 'admin' },
  { id: 'severance_agreement', name: 'Severance Agreements', description: 'Employment termination agreements', category: 'Employment', defaultRiskLevel: 'high', defaultReviewer: 'admin' },
  { id: 'consulting_agreement', name: 'Consulting Agreements', description: 'Independent contractor agreements', category: 'Employment', defaultRiskLevel: 'medium', defaultReviewer: 'paralegal' },
  
  // Real Estate
  { id: 'lease', name: 'Residential Leases', description: 'Property rental agreements', category: 'Real Estate', defaultRiskLevel: 'medium', defaultReviewer: 'paralegal' },
  { id: 'commercial_lease', name: 'Commercial Leases', description: 'Business property rentals', category: 'Real Estate', defaultRiskLevel: 'high', defaultReviewer: 'admin' },
  { id: 'purchase_agreement', name: 'Purchase Agreements', description: 'Real estate sales contracts', category: 'Real Estate', defaultRiskLevel: 'high', defaultReviewer: 'admin' },
  
  // Intellectual Property
  { id: 'licensing_agreement', name: 'Licensing Agreements', description: 'IP usage rights contracts', category: 'Intellectual Property', defaultRiskLevel: 'medium', defaultReviewer: 'paralegal' },
  
  // Finance
  { id: 'loan_agreement', name: 'Loan Agreements', description: 'Financial lending contracts', category: 'Finance', defaultRiskLevel: 'high', defaultReviewer: 'admin' },
  
  // Litigation
  { id: 'settlement', name: 'Settlement Agreements', description: 'Legal dispute resolutions', category: 'Litigation', defaultRiskLevel: 'high', defaultReviewer: 'admin' },
  { id: 'litigation', name: 'Litigation Documents', description: 'Court filings and proceedings', category: 'Litigation', defaultRiskLevel: 'high', defaultReviewer: 'admin' },
  
  // Estate Planning
  { id: 'will', name: 'Wills', description: 'Estate planning documents', category: 'Estate Planning', defaultRiskLevel: 'high', defaultReviewer: 'admin' },
  { id: 'power_of_attorney', name: 'Powers of Attorney', description: 'Legal authority documents', category: 'Estate Planning', defaultRiskLevel: 'high', defaultReviewer: 'admin' }
];

const categoryOrder = ['Corporate', 'Employment', 'Real Estate', 'Intellectual Property', 'Finance', 'Litigation', 'Estate Planning'];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [firmName, setFirmName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [documentConfigs, setDocumentConfigs] = useState<Record<string, DocumentTypeConfig>>({});

  const startOnboarding = useMutation({
    mutationFn: async (data: {firmName: string, adminEmail: string}) => {
      const response = await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to start onboarding');
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
      if (!response.ok) throw new Error('Failed to complete onboarding');
      return response.json();
    },
    onSuccess: () => {
      setStep(4);
    }
  });

  const handleFirmInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (firmName.trim() && adminEmail.trim()) {
      startOnboarding.mutate({ firmName: firmName.trim(), adminEmail: adminEmail.trim() });
    }
  };

  const handleDocTypeSelection = (docTypeId: string, selected: boolean) => {
    if (selected) {
      setSelectedDocTypes(prev => [...prev, docTypeId]);
      // Set default configuration for this document type
      const docType = availableDocTypes.find(dt => dt.id === docTypeId);
      if (docType) {
        setDocumentConfigs(prev => ({
          ...prev,
          [docTypeId]: {
            docType: docTypeId,
            displayName: docType.name,
            summarize: true,
            clauseCheck: true,
            suggestionMode: 'review_only',
            riskLevel: docType.defaultRiskLevel,
            reviewer: docType.defaultReviewer,
            enabled: true
          }
        }));
      }
    } else {
      setSelectedDocTypes(prev => prev.filter(id => id !== docTypeId));
      setDocumentConfigs(prev => {
        const newConfigs = { ...prev };
        delete newConfigs[docTypeId];
        return newConfigs;
      });
    }
  };

  const updateDocumentConfig = (docTypeId: string, updates: Partial<DocumentTypeConfig>) => {
    setDocumentConfigs(prev => ({
      ...prev,
      [docTypeId]: {
        ...prev[docTypeId],
        ...updates
      }
    }));
  };

  const handleFinalSubmit = () => {
    const onboardingData: OnboardingData = {
      firmName,
      adminEmail,
      selectedDocTypes,
      documentConfigs
    };
    
    completeOnboarding.mutate(onboardingData);
  };

  const groupedDocTypes = categoryOrder.map(category => ({
    category,
    documents: availableDocTypes.filter(doc => doc.category === category)
  })).filter(group => group.documents.length > 0);

  // Step 1: Firm Information
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to FIRMSYNC</h1>
            <p className="text-gray-600 mt-2">Let's set up your document review workflow</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Firm Information</CardTitle>
              <CardDescription>
                Enter your firm details to get started with document workflow setup.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFirmInfo} className="space-y-4">
                <div>
                  <Label htmlFor="firmName">Law Firm Name</Label>
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
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={startOnboarding.isPending || !firmName.trim() || !adminEmail.trim()}
                >
                  {startOnboarding.isPending ? 'Setting up...' : 'Continue Setup'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: Document Type Selection & Configuration
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Document Types & Review Settings</h1>
            <p className="text-gray-600 mt-2">Select the document types your firm handles and configure review preferences</p>
          </div>

          <div className="grid gap-6">
            {groupedDocTypes.map(({ category, documents }) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {category}
                  </CardTitle>
                  <CardDescription>
                    Configure review settings for {category.toLowerCase()} documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.map((docType) => {
                      const isSelected = selectedDocTypes.includes(docType.id);
                      const config = documentConfigs[docType.id];
                      
                      return (
                        <div key={docType.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={docType.id}
                              checked={isSelected}
                              onCheckedChange={(checked) => handleDocTypeSelection(docType.id, checked as boolean)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Label htmlFor={docType.id} className="text-sm font-medium cursor-pointer">
                                  {docType.name}
                                </Label>
                                <Badge variant="outline" className="text-xs">
                                  {docType.defaultRiskLevel} risk
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{docType.description}</p>
                              
                              {isSelected && config && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-md">
                                  <div>
                                    <Label className="text-xs font-medium text-gray-700">Enable Summaries</Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Checkbox
                                        id={`${docType.id}-summary`}
                                        checked={config.summarize}
                                        onCheckedChange={(checked) => updateDocumentConfig(docType.id, { summarize: checked as boolean })}
                                      />
                                      <Label htmlFor={`${docType.id}-summary`} className="text-sm cursor-pointer">
                                        Generate summaries
                                      </Label>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-xs font-medium text-gray-700">Flag Missing Clauses</Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Checkbox
                                        id={`${docType.id}-clauses`}
                                        checked={config.clauseCheck}
                                        onCheckedChange={(checked) => updateDocumentConfig(docType.id, { clauseCheck: checked as boolean })}
                                      />
                                      <Label htmlFor={`${docType.id}-clauses`} className="text-sm cursor-pointer">
                                        Check clauses
                                      </Label>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-xs font-medium text-gray-700">Review Approach</Label>
                                    <RadioGroup
                                      value={config.suggestionMode}
                                      onValueChange={(value) => updateDocumentConfig(docType.id, { suggestionMode: value as 'review_only' | 'suggest_changes' })}
                                      className="mt-1"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="review_only" id={`${docType.id}-review`} />
                                        <Label htmlFor={`${docType.id}-review`} className="text-sm cursor-pointer">Review only</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="suggest_changes" id={`${docType.id}-suggest`} />
                                        <Label htmlFor={`${docType.id}-suggest`} className="text-sm cursor-pointer">Suggest changes</Label>
                                      </div>
                                    </RadioGroup>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-xs font-medium text-gray-700">Risk Level</Label>
                                    <Select
                                      value={config.riskLevel}
                                      onValueChange={(value) => updateDocumentConfig(docType.id, { riskLevel: value as 'low' | 'medium' | 'high' })}
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-xs font-medium text-gray-700">Reviewer Role</Label>
                                    <Select
                                      value={config.reviewer}
                                      onValueChange={(value) => updateDocumentConfig(docType.id, { reviewer: value as 'admin' | 'paralegal' | 'both' })}
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="paralegal">Paralegal</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-sm text-gray-600">
              {selectedDocTypes.length} document types selected
            </div>
            <Button 
              onClick={() => setStep(3)} 
              disabled={selectedDocTypes.length === 0}
            >
              Review Setup
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Setup Summary
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Setup Summary</h1>
            <p className="text-gray-600 mt-2">Review your document workflow configuration before finalizing</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Firm Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Firm Name</Label>
                    <p className="text-sm text-gray-900">{firmName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Administrator Email</Label>
                    <p className="text-sm text-gray-900">{adminEmail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Type Configuration</CardTitle>
                <CardDescription>
                  {selectedDocTypes.length} document types configured for review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedDocTypes.map(docTypeId => {
                    const docType = availableDocTypes.find(dt => dt.id === docTypeId);
                    const config = documentConfigs[docTypeId];
                    
                    if (!docType || !config) return null;
                    
                    return (
                      <div key={docTypeId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">{docType.name}</h3>
                          <Badge variant="outline">{docType.category}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Summaries:</span>
                            <span className="ml-2 text-gray-900">{config.summarize ? 'Yes' : 'No'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Clause Check:</span>
                            <span className="ml-2 text-gray-900">{config.clauseCheck ? 'Yes' : 'No'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Approach:</span>
                            <span className="ml-2 text-gray-900">
                              {config.suggestionMode === 'review_only' ? 'Review Only' : 'Suggest Changes'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Risk Level:</span>
                            <span className="ml-2 text-gray-900 capitalize">{config.riskLevel}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Reviewer:</span>
                            <span className="ml-2 text-gray-900 capitalize">{config.reviewer}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Edit
            </Button>
            <Button 
              onClick={handleFinalSubmit}
              disabled={completeOnboarding.isPending}
              className="px-8"
            >
              {completeOnboarding.isPending ? 'Saving Configuration...' : 'Complete Setup'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Completion
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Setup Complete!</h1>
            <p className="text-gray-600 mt-2">Your document review workflow has been configured successfully</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-medium text-gray-900">Firm Created</p>
                    <p className="text-gray-600">{firmName}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-medium text-gray-900">Document Types</p>
                    <p className="text-gray-600">{selectedDocTypes.length} configured</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="font-medium text-gray-900">Review Workflow</p>
                    <p className="text-gray-600">Ready to use</p>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-4">
                    You can now start uploading documents for review. Your team can access the dashboard and begin working with the configured document types.
                  </p>
                  
                  <Button onClick={() => window.location.href = '/'} className="w-full">
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