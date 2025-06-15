import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, Building2, FileText, Shield, Users } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface DocumentTypeConfig {
  docType: string;
  displayName: string;
  summarize: boolean;
  riskAnalysis: boolean;
  clauseMode: 'check_only' | 'full_completion' | 'disabled';
  reviewer: 'paralegal' | 'associate' | 'admin';
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
}

const availableDocTypes: DocumentType[] = [
  { id: 'acquisition_agreement', name: 'Acquisition Agreements', description: 'Business acquisition and merger documents' },
  { id: 'arbitration_agreement', name: 'Arbitration Agreements', description: 'Alternative dispute resolution contracts' },
  { id: 'asset_purchase_agreement', name: 'Asset Purchase Agreements', description: 'Asset acquisition and transfer documents' },
  { id: 'assignment_agreement', name: 'Assignment Agreements', description: 'Rights and obligation transfer contracts' },
  { id: 'buy_sell_agreement', name: 'Buy-Sell Agreements', description: 'Business ownership transfer contracts' },
  { id: 'commercial_lease', name: 'Commercial Leases', description: 'Business property rental agreements' },
  { id: 'confidentiality_agreement', name: 'Confidentiality Agreements', description: 'Information protection and secrecy contracts' },
  { id: 'consulting_agreement', name: 'Consulting Agreements', description: 'Professional services and advisory contracts' },
  { id: 'contract', name: 'General Contracts', description: 'Business contracts and commercial agreements' },
  { id: 'copyright_license', name: 'Copyright Licenses', description: 'Creative work usage and licensing agreements' },
  { id: 'deed_of_trust', name: 'Deeds of Trust', description: 'Real estate security and mortgage documents' },
  { id: 'discovery', name: 'Discovery Responses', description: 'Legal discovery and evidence documents' },
  { id: 'distribution_agreement', name: 'Distribution Agreements', description: 'Product distribution and sales contracts' },
  { id: 'employment', name: 'Employment Contracts', description: 'Job offers, employment agreements, and HR documents' },
  { id: 'equipment_lease', name: 'Equipment Leases', description: 'Machinery and equipment rental agreements' },
  { id: 'escrow_agreement', name: 'Escrow Agreements', description: 'Third-party holding and transfer contracts' },
  { id: 'franchise_agreement', name: 'Franchise Agreements', description: 'Business franchise and licensing contracts' },
  { id: 'guaranty_agreement', name: 'Guaranty Agreements', description: 'Financial guarantee and surety contracts' },
  { id: 'indemnity_agreement', name: 'Indemnity Agreements', description: 'Risk protection and liability contracts' },
  { id: 'independent_contractor_agreement', name: 'Independent Contractor Agreements', description: 'Freelance and contractor service contracts' },
  { id: 'joint_venture_agreement', name: 'Joint Venture Agreements', description: 'Business partnership and collaboration contracts' },
  { id: 'lease', name: 'Lease Agreements', description: 'Rental and property lease contracts' },
  { id: 'licensing_agreement', name: 'Licensing Agreements', description: 'Intellectual property and usage rights contracts' },
  { id: 'litigation', name: 'Litigation Documents', description: 'Court filings and legal proceedings' },
  { id: 'living_will', name: 'Living Wills', description: 'Healthcare directive and end-of-life documents' },
  { id: 'loan_agreement', name: 'Loan Agreements', description: 'Financial lending and borrowing contracts' },
  { id: 'maintenance_agreement', name: 'Maintenance Agreements', description: 'Service and repair contracts' },
  { id: 'mediation_agreement', name: 'Mediation Agreements', description: 'Dispute resolution and settlement contracts' },
  { id: 'merger_agreement', name: 'Merger Agreements', description: 'Business combination and consolidation contracts' },
  { id: 'mortgage', name: 'Mortgages', description: 'Real estate financing and security documents' },
  { id: 'nda', name: 'NDAs', description: 'Non-disclosure agreements and confidentiality contracts' },
  { id: 'non_compete_agreement', name: 'Non-Compete Agreements', description: 'Post-employment competition restriction contracts' },
  { id: 'non_solicitation_agreement', name: 'Non-Solicitation Agreements', description: 'Customer and employee protection contracts' },
  { id: 'novation_agreement', name: 'Novation Agreements', description: 'Contract substitution and replacement documents' },
  { id: 'operating_agreement', name: 'Operating Agreements', description: 'LLC management and governance documents' },
  { id: 'option_agreement', name: 'Option Agreements', description: 'Stock option and purchase right contracts' },
  { id: 'partnership_agreement', name: 'Partnership Agreements', description: 'Business partnership and collaboration contracts' },
  { id: 'patent_license', name: 'Patent Licenses', description: 'Patent usage and technology licensing agreements' },
  { id: 'power_of_attorney', name: 'Powers of Attorney', description: 'Legal authority and representation documents' },
  { id: 'privacy_policy', name: 'Privacy Policies', description: 'Data protection and privacy compliance documents' },
  { id: 'promissory_note', name: 'Promissory Notes', description: 'Debt and payment obligation documents' },
  { id: 'purchase_agreement', name: 'Purchase Agreements', description: 'Sales and acquisition contracts' },
  { id: 'release_agreement', name: 'Release Agreements', description: 'Claim release and settlement documents' },
  { id: 'security_agreement', name: 'Security Agreements', description: 'Collateral and secured transaction documents' },
  { id: 'service_agreement', name: 'Service Agreements', description: 'Professional service and work contracts' },
  { id: 'settlement', name: 'Settlement Agreements', description: 'Legal settlements and dispute resolutions' },
  { id: 'severance_agreement', name: 'Severance Agreements', description: 'Employment termination and benefit contracts' },
  { id: 'shareholder_agreement', name: 'Shareholder Agreements', description: 'Corporate governance and ownership contracts' },
  { id: 'software_license', name: 'Software Licenses', description: 'Software usage and distribution agreements' },
  { id: 'stock_purchase_agreement', name: 'Stock Purchase Agreements', description: 'Equity acquisition and investment contracts' },
  { id: 'subscription_agreement', name: 'Subscription Agreements', description: 'Service subscription and recurring payment contracts' },
  { id: 'supply_agreement', name: 'Supply Agreements', description: 'Product supply and delivery contracts' },
  { id: 'terms_of_service', name: 'Terms of Service', description: 'Website and service usage agreements' },
  { id: 'trademark_license', name: 'Trademark Licenses', description: 'Brand and trademark usage agreements' },
  { id: 'trust_agreement', name: 'Trust Agreements', description: 'Estate planning and asset management documents' },
  { id: 'vendor_agreement', name: 'Vendor Agreements', description: 'Supplier and vendor service contracts' },
  { id: 'waiver_agreement', name: 'Waiver Agreements', description: 'Rights waiver and release documents' },
  { id: 'warranty_agreement', name: 'Warranty Agreements', description: 'Product warranty and guarantee contracts' },
  { id: 'will', name: 'Wills', description: 'Estate planning and inheritance documents' }
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
    reviewer: 'paralegal' | 'associate' | 'admin';
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
    reviewer: 'paralegal' | 'associate' | 'admin';
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
        clauseSuggestions: config.clauseSuggestions === 'full_suggestions' ? 'Yes' : 
                          config.clauseSuggestions === 'check_only' ? 'Review Only' : 'No',
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
            <h1 className="text-3xl font-bold text-gray-900">Document Setup Assistant</h1>
            <p className="text-gray-600 mt-2">I'll help you set up how different types of documents should be handled at your firm</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your Document Workflow Setup</CardTitle>
              <CardDescription>
                Let's start with some basic information about your firm.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFirmInfo} className="space-y-4">
                <div>
                  <Label htmlFor="firmName">What's your firm's name?</Label>
                  <Input
                    id="firmName"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Enter your firm name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">What's your email address?</Label>
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Which types of documents do you regularly use?</h1>
            <p className="text-gray-600 mt-2">Select all that apply to your firm's practice</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableDocTypes.map((docType) => (
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
              
              <div className="mt-6 pt-4 border-t">
                <Button 
                  onClick={startDocumentConfiguration}
                  className="w-full"
                  disabled={selectedDocTypes.length === 0}
                >
                  Configure Selected Documents ({selectedDocTypes.length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Document Configuration
  if (step === 3 && currentDocType) {
    const remainingCount = selectedDocTypes.length - selectedDocTypes.indexOf(currentDocType) - 1;
    
    return (
      <DocumentConfigurationStep
        documentType={getCurrentDocTypeName()}
        onConfigComplete={handleDocumentConfig}
        remainingCount={remainingCount}
      />
    );
  }

  // Step 4: Review Configuration
  if (step === 4) {
    const summary = getConfigSummary();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Review Your Configuration</h1>
            <p className="text-gray-600 mt-2">Here's how {firmName} documents will be handled:</p>
          </div>

          <div className="space-y-4 mb-8">
            {summary.map((config, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{config?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Summary:</span>
                      <div className="text-gray-900">{config?.summary}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Risk Check:</span>
                      <div className="text-gray-900">{config?.riskCheck}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Clause Suggestions:</span>
                      <div className="text-gray-900">{config?.clauseSuggestions}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Assigned Reviewer:</span>
                      <div className="text-gray-900">{config?.reviewer}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={handleFinalSubmit} className="w-full" disabled={completeOnboarding.isPending}>
            {completeOnboarding.isPending ? 'Finalizing Setup...' : 'Complete Setup'}
          </Button>
        </div>
      </div>
    );
  }

  // Step 5: Complete
  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Setup Complete!</h1>
            <p className="text-gray-600 mt-2">Your document workflow is now configured and ready to use.</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-blue-800 text-center">
              <strong>You can always adjust these settings later.</strong> We'll keep things simple and professional.
            </p>
          </div>

          <div className="text-center">
            <Button onClick={() => window.location.href = '/dashboard'} size="lg">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

interface DocumentConfigurationStepProps {
  documentType: string;
  onConfigComplete: (config: {
    summary: boolean;
    riskCheck: boolean;
    clauseSuggestions: 'check_only' | 'full_suggestions' | 'none';
    reviewer: 'paralegal' | 'associate' | 'admin';
  }) => void;
  remainingCount: number;
}

function DocumentConfigurationStep({ documentType, onConfigComplete, remainingCount }: DocumentConfigurationStepProps) {
  const [config, setConfig] = useState({
    summary: true,
    riskCheck: true,
    clauseSuggestions: 'check_only' as 'check_only' | 'full_suggestions' | 'none',
    reviewer: 'paralegal' as 'paralegal' | 'associate' | 'admin'
  });

  const handleSubmit = () => {
    onConfigComplete(config);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Configure {documentType}</h1>
          <p className="text-gray-600 mt-2">
            {remainingCount > 0 ? `${remainingCount} more document types after this` : 'Last document type to configure'}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Options</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="summary"
                    checked={config.summary}
                    onCheckedChange={(checked) => setConfig({ ...config, summary: checked as boolean })}
                  />
                  <Label htmlFor="summary" className="text-gray-700">
                    Would you like a short summary of these documents when they're uploaded?
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="riskCheck"
                    checked={config.riskCheck}
                    onCheckedChange={(checked) => setConfig({ ...config, riskCheck: checked as boolean })}
                  />
                  <Label htmlFor="riskCheck" className="text-gray-700">
                    Would you like someone to check these documents for missing or risky sections?
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Clause Review</h3>
              <Label className="text-gray-700">Should suggestions for missing clauses be included, or just a review of what's there?</Label>
              <RadioGroup
                value={config.clauseSuggestions}
                onValueChange={(value) => setConfig({ ...config, clauseSuggestions: value as any })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="check_only" id="check_only" />
                  <Label htmlFor="check_only">Just review what's there</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full_suggestions" id="full_suggestions" />
                  <Label htmlFor="full_suggestions">Include suggestions for missing clauses</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">Skip clause review</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reviewer Assignment</h3>
              <Label className="text-gray-700">Who at your firm should handle these types of documents?</Label>
              <RadioGroup
                value={config.reviewer}
                onValueChange={(value) => setConfig({ ...config, reviewer: value as any })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paralegal" id="paralegal" />
                  <Label htmlFor="paralegal">Paralegal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="associate" id="associate" />
                  <Label htmlFor="associate">Associate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Admin</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleSubmit} className="w-full">
              {remainingCount > 0 ? 'Next Document Type' : 'Review Configuration'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}