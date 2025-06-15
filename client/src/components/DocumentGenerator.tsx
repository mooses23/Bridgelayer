import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Wand2, 
  Upload, 
  Download,
  Eye,
  Copy,
  Settings,
  Cloud,
  Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DocumentType {
  id: string;
  name: string;
  description: string;
  fields: Array<{
    name: string;
    type: 'text' | 'textarea' | 'date' | 'select';
    label: string;
    required: boolean;
    options?: string[];
  }>;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'eviction-notice',
    name: 'Eviction Notice',
    description: 'Notice to quit or pay rent',
    fields: [
      { name: 'tenantName', type: 'text', label: 'Tenant Name', required: true },
      { name: 'propertyAddress', type: 'textarea', label: 'Property Address', required: true },
      { name: 'rentAmount', type: 'text', label: 'Rent Amount Due', required: true },
      { name: 'dueDate', type: 'date', label: 'Due Date', required: true },
      { name: 'noticeDate', type: 'date', label: 'Notice Date', required: true },
    ]
  },
  {
    id: 'rent-demand',
    name: 'Rent Demand Letter',
    description: 'Formal demand for payment of rent',
    fields: [
      { name: 'tenantName', type: 'text', label: 'Tenant Name', required: true },
      { name: 'propertyAddress', type: 'textarea', label: 'Property Address', required: true },
      { name: 'rentAmount', type: 'text', label: 'Amount Due', required: true },
      { name: 'paymentDeadline', type: 'date', label: 'Payment Deadline', required: true },
      { name: 'lateFeesAmount', type: 'text', label: 'Late Fees (if any)', required: false },
    ]
  },
  {
    id: 'lease-agreement',
    name: 'Lease Agreement',
    description: 'Residential lease agreement template',
    fields: [
      { name: 'tenantName', type: 'text', label: 'Tenant Name', required: true },
      { name: 'landlordName', type: 'text', label: 'Landlord Name', required: true },
      { name: 'propertyAddress', type: 'textarea', label: 'Property Address', required: true },
      { name: 'monthlyRent', type: 'text', label: 'Monthly Rent', required: true },
      { name: 'leaseStartDate', type: 'date', label: 'Lease Start Date', required: true },
      { name: 'leaseEndDate', type: 'date', label: 'Lease End Date', required: true },
      { name: 'securityDeposit', type: 'text', label: 'Security Deposit', required: true },
    ]
  },
  {
    id: 'employment-contract',
    name: 'Employment Contract',
    description: 'Basic employment agreement',
    fields: [
      { name: 'employeeName', type: 'text', label: 'Employee Name', required: true },
      { name: 'employerName', type: 'text', label: 'Employer Name', required: true },
      { name: 'jobTitle', type: 'text', label: 'Job Title', required: true },
      { name: 'startDate', type: 'date', label: 'Start Date', required: true },
      { name: 'salary', type: 'text', label: 'Annual Salary', required: true },
      { name: 'workLocation', type: 'text', label: 'Work Location', required: true },
    ]
  }
];

const COUNTIES = [
  'Los Angeles County',
  'Orange County', 
  'Riverside County',
  'San Bernardino County',
  'Ventura County',
  'Santa Barbara County',
  'Kern County',
  'Imperial County'
];

export default function DocumentGenerator() {
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedDocument, setGeneratedDocument] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch uploaded form templates
  const { data: uploadedTemplates } = useQuery({
    queryKey: ["/api/firm-templates"],
  });

  const selectedType = DOCUMENT_TYPES.find(type => type.id === selectedDocumentType);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const generateDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to generate document');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      setGeneratedDocument(data.document || data.generatedContent);
      toast({
        title: "Document Generated",
        description: "Your document has been successfully generated using AI.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate document",
        variant: "destructive",
      });
    }
  });

  const handleGenerateDocument = () => {
    if (!selectedDocumentType || !selectedCounty) {
      toast({
        title: "Missing Information",
        description: "Please select a document type and county",
        variant: "destructive",
      });
      return;
    }

    const requiredFields = selectedType?.fields.filter(field => field.required) || [];
    const missingFields = requiredFields.filter(field => !formData[field.name]);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.map(f => f.label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateDocumentMutation.mutate({
      documentType: selectedDocumentType,
      county: selectedCounty,
      formData,
      useTemplate: true // Use uploaded templates if available
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDocument);
    toast({
      title: "Copied to Clipboard",
      description: "Document content has been copied to your clipboard.",
    });
  };

  const downloadDocument = () => {
    const blob = new Blob([generatedDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType?.name || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Generator</h2>
          <p className="text-gray-600">Generate legal documents using AI with your firm's templates and preferences</p>
        </div>
        <div className="mt-4 lg:mt-0 flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Templates
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Cloud Storage
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Configuration */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Document Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Document Type Selection */}
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* County Selection */}
              <div className="space-y-2">
                <Label>County/Region</Label>
                <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTIES.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Uploaded Templates */}
              {Array.isArray(uploadedTemplates) && uploadedTemplates.length > 0 && (
                <div className="space-y-2">
                  <Label>Available Templates</Label>
                  <div className="flex flex-wrap gap-2">
                    {uploadedTemplates.map((template: any) => (
                      <Badge key={template.id} variant="secondary">
                        {template.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dynamic Fields */}
          {selectedType && (
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedType.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === 'text' && (
                      <Input
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                    {field.type === 'textarea' && (
                      <Textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        rows={3}
                      />
                    )}
                    {field.type === 'date' && (
                      <Input
                        type="date"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      />
                    )}
                    {field.type === 'select' && field.options && (
                      <Select 
                        value={formData[field.name] || ''} 
                        onValueChange={(value) => handleFieldChange(field.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}

                <Separator />

                <Button 
                  onClick={handleGenerateDocument}
                  disabled={isGenerating || generateDocumentMutation.isPending}
                  className="w-full"
                >
                  {isGenerating || generateDocumentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Document...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Document
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generated Document Preview */}
        <div className="space-y-4">
          <Card className="min-h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Generated Document
                </span>
                {generatedDocument && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadDocument}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedDocument ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                    {generatedDocument}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <FileText className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No document generated yet</p>
                  <p className="text-sm">Configure your document settings and click Generate Document</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}