import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TemplateFile {
  file: File;
  templateType: string;
  description: string;
}

interface TemplatesData {
  uploadedTemplates: TemplateFile[];
}

interface TemplatesStepProps {
  data: TemplatesData;
  onChange: (data: Partial<TemplatesData>) => void;
}

const TEMPLATE_TYPES = [
  { value: "letterhead", label: "Firm Letterhead" },
  { value: "engagement_letter", label: "Engagement Letter" },
  { value: "retainer_agreement", label: "Retainer Agreement" },
  { value: "client_intake_form", label: "Client Intake Form" },
  { value: "invoice_template", label: "Invoice Template" },
  { value: "contract_template", label: "Contract Template" },
  { value: "nda_template", label: "NDA Template" },
  { value: "motion_template", label: "Motion Template" },
  { value: "brief_template", label: "Brief Template" },
  { value: "settlement_template", label: "Settlement Template" },
  { value: "discovery_template", label: "Discovery Template" },
  { value: "pleading_template", label: "Pleading Template" },
  { value: "other", label: "Other Document" }
];

export default function TemplatesStep({ data, onChange }: TemplatesStepProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentTemplateType, setCurrentTemplateType] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];

    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, DOC, DOCX, TXT, or RTF files only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes (10MB limit per file)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Add files to templates
    files.forEach(file => {
      addTemplate(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addTemplate = (file: File) => {
    const newTemplate: TemplateFile = {
      file,
      templateType: currentTemplateType || "other",
      description: currentDescription || `${file.name} template`
    };

    const updatedTemplates = [...data.uploadedTemplates, newTemplate];
    onChange({ uploadedTemplates: updatedTemplates });

    toast({
      title: "Template Added",
      description: `${file.name} has been added to your templates.`,
    });

    // Reset form
    setCurrentTemplateType("");
    setCurrentDescription("");
  };

  const removeTemplate = (index: number) => {
    const updatedTemplates = data.uploadedTemplates.filter((_, i) => i !== index);
    onChange({ uploadedTemplates: updatedTemplates });

    toast({
      title: "Template Removed",
      description: "Template has been removed from your uploads.",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      case 'rtf':
        return '📋';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Upload your firm's custom templates to have them ready from day one. 
          These can include letterheads, engagement letters, and standard forms.
        </AlertDescription>
      </Alert>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="templateType">Template Type</Label>
              <Select
                value={currentTemplateType}
                onValueChange={setCurrentTemplateType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this template..."
                value={currentDescription}
                onChange={(e) => setCurrentDescription(e.target.value)}
                rows={1}
              />
            </div>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Templates</h3>
            <p className="text-gray-600 mb-2">
              Click to browse or drag and drop files here
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, DOCX, TXT, RTF (max 10MB per file)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.rtf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Templates */}
      {data.uploadedTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Uploaded Templates ({data.uploadedTemplates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.uploadedTemplates.map((template, index) => {
                const templateTypeLabel = TEMPLATE_TYPES.find(
                  t => t.value === template.templateType
                )?.label || 'Unknown';

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getFileIcon(template.file.name)}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">
                            {template.file.name}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {templateTypeLabel}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatFileSize(template.file.size)}</span>
                          <span>•</span>
                          <span>{template.file.type}</span>
                        </div>
                        {template.description && (
                          <p className="text-xs text-gray-600">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Create blob URL for preview
                          const url = URL.createObjectURL(template.file);
                          window.open(url, '_blank');
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTemplate(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Categories Summary */}
      {data.uploadedTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Templates by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {TEMPLATE_TYPES.map((type) => {
                const count = data.uploadedTemplates.filter(
                  t => t.templateType === type.value
                ).length;
                
                if (count === 0) return null;

                return (
                  <div
                    key={type.value}
                    className="p-3 border rounded-lg text-center"
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      {count}
                    </div>
                    <div className="text-xs text-gray-500">
                      {count === 1 ? 'template' : 'templates'}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Template Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Recommended Templates:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Firm letterhead with logo</li>
                <li>• Client engagement letter</li>
                <li>• Retainer agreement</li>
                <li>• Invoice template</li>
                <li>• Basic contract template</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">File Requirements:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Maximum 10MB per file</li>
                <li>• PDF, DOC, DOCX, TXT, RTF formats</li>
                <li>• Clear, readable content</li>
                <li>• Remove confidential information</li>
                <li>• Use placeholder text for variables</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}