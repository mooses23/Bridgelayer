import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    firmName: '',
    adminEmail: '',
    selectedDocTypes: [],
    customConfigs: {}
  });
  const [availableDocTypes, setAvailableDocTypes] = useState<Array<{id: string, name: string}>>([]);
  const [configSummary, setConfigSummary] = useState('');

  const startOnboarding = useMutation({
    mutationFn: async (data: {firmName: string, adminEmail: string}) => {
      const response = await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (response: any) => {
      setAvailableDocTypes(response.availableDocTypes);
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
    onSuccess: (response: any) => {
      setConfigSummary(response.configSummary);
      setStep(4);
    }
  });

  const handleFirmInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (onboardingData.firmName && onboardingData.adminEmail) {
      startOnboarding.mutate({
        firmName: onboardingData.firmName,
        adminEmail: onboardingData.adminEmail
      });
    }
  };

  const handleDocumentSelection = () => {
    if (onboardingData.selectedDocTypes.length > 0) {
      setStep(3);
    }
  };

  const handleConfiguration = () => {
    completeOnboarding.mutate(onboardingData);
  };

  const updateDocConfig = (docType: string, field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      customConfigs: {
        ...prev.customConfigs,
        [docType]: {
          ...prev.customConfigs[docType],
          [field]: value
        }
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">BridgeLayer Onboarding</h1>
          <p className="text-gray-600 mt-2">Configure your FIRMSYNC environment in minutes</p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className={`flex items-center ${stepNum < 4 ? 'mr-4' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 4 && <div className={`w-12 h-1 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-300'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Firm Information */}
        {step === 1 && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Firm Information
              </CardTitle>
              <CardDescription>
                Let's start with your basic information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFirmInfo} className="space-y-4">
                <div>
                  <Label htmlFor="firmName">Law Firm Name</Label>
                  <Input
                    id="firmName"
                    value={onboardingData.firmName}
                    onChange={(e) => setOnboardingData(prev => ({...prev, firmName: e.target.value}))}
                    placeholder="Enter your firm name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={onboardingData.adminEmail}
                    onChange={(e) => setOnboardingData(prev => ({...prev, adminEmail: e.target.value}))}
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
        )}

        {/* Step 2: Document Type Selection */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Types
              </CardTitle>
              <CardDescription>
                Which document types do you use regularly?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {availableDocTypes.map((docType) => (
                  <div key={docType.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={docType.id}
                      checked={onboardingData.selectedDocTypes.includes(docType.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setOnboardingData(prev => ({
                            ...prev,
                            selectedDocTypes: [...prev.selectedDocTypes, docType.id]
                          }));
                        } else {
                          setOnboardingData(prev => ({
                            ...prev,
                            selectedDocTypes: prev.selectedDocTypes.filter(id => id !== docType.id)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={docType.id} className="cursor-pointer">
                      {docType.name}
                    </Label>
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleDocumentSelection} 
                className="w-full"
                disabled={onboardingData.selectedDocTypes.length === 0}
              >
                Configure Selected Documents
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Configuration */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  AI Analysis Configuration
                </CardTitle>
                <CardDescription>
                  Configure AI behavior for each document type
                </CardDescription>
              </CardHeader>
            </Card>
            
            {onboardingData.selectedDocTypes.map((docType) => {
              const docTypeInfo = availableDocTypes.find(dt => dt.id === docType);
              return (
                <Card key={docType}>
                  <CardHeader>
                    <CardTitle className="text-lg">{docTypeInfo?.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${docType}-summarize`}
                          defaultChecked={true}
                          onCheckedChange={(checked) => updateDocConfig(docType, 'summarize', checked)}
                        />
                        <Label htmlFor={`${docType}-summarize`}>
                          AI Document Summary
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${docType}-risk`}
                          defaultChecked={true}
                          onCheckedChange={(checked) => updateDocConfig(docType, 'riskAnalysis', checked)}
                        />
                        <Label htmlFor={`${docType}-risk`}>
                          Legal Risk Analysis
                        </Label>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Clause Analysis Mode</Label>
                      <Select onValueChange={(value) => updateDocConfig(docType, 'clauseMode', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select clause mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="check_only">Check Only</SelectItem>
                          <SelectItem value="full_completion">Full Completion</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Review Assignment</Label>
                      <Select onValueChange={(value) => updateDocConfig(docType, 'reviewer', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Who reviews output?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paralegal">Paralegal</SelectItem>
                          <SelectItem value="associate">Associate</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            <Button onClick={handleConfiguration} className="w-full" disabled={completeOnboarding.isPending}>
              {completeOnboarding.isPending ? 'Configuring...' : 'Complete Setup'}
            </Button>
          </div>
        )}

        {/* Step 4: Configuration Summary */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Setup Complete!
              </CardTitle>
              <CardDescription>
                Your FIRMSYNC environment is now configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <pre className="whitespace-pre-wrap text-sm">{configSummary}</pre>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => window.location.href = '/dashboard'} className="flex-1">
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}