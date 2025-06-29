import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Clock, Download, Eye, Edit } from 'lucide-react';
import llmApi from '@/lib/llmApi';

interface DocumentDraftingProps {
  firmId: number;
  userId: number;
}

const DocumentDrafting: React.FC<DocumentDraftingProps> = ({ firmId, userId }) => {
  const [documentType, setDocumentType] = useState('');
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [parameters, setParameters] = useState<any>({});
  const [draftedDocument, setDraftedDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const documentTypes = [
    'Contract', 'NDA', 'Employment Agreement', 'Service Agreement', 'Lease Agreement',
    'Purchase Agreement', 'License Agreement', 'Partnership Agreement', 'Operating Agreement',
    'Terms of Service', 'Privacy Policy', 'Demand Letter', 'Cease and Desist', 'Motion',
    'Brief', 'Complaint', 'Answer', 'Discovery Request', 'Settlement Agreement'
  ];

  const handleParameterChange = (key: string, value: string) => {
    setParameters({ ...parameters, [key]: value });
  };

  const handleDraftDocument = async () => {
    if (!documentType) {
      setError('Please select a document type');
      return;
    }

    if (Object.keys(parameters).length === 0) {
      setError('Please provide at least some parameters for the document');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await llmApi.getDocumentDrafting(
        firmId, 
        userId, 
        documentType,
        parameters,
        templateId || undefined
      );
      setDraftedDocument(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to draft document');
    } finally {
      setLoading(false);
    }
  };

  const getParameterFields = (docType: string) => {
    const baseFields = [
      { key: 'party1_name', label: 'Party 1 Name', type: 'text', required: true },
      { key: 'party2_name', label: 'Party 2 Name', type: 'text', required: true },
      { key: 'effective_date', label: 'Effective Date', type: 'date', required: true },
      { key: 'governing_law', label: 'Governing Law', type: 'text', required: false }
    ];

    const typeSpecificFields: any = {
      'Contract': [
        { key: 'contract_value', label: 'Contract Value', type: 'text', required: false },
        { key: 'payment_terms', label: 'Payment Terms', type: 'textarea', required: false },
        { key: 'deliverables', label: 'Deliverables/Services', type: 'textarea', required: true }
      ],
      'NDA': [
        { key: 'confidential_info', label: 'Confidential Information Description', type: 'textarea', required: true },
        { key: 'disclosure_purpose', label: 'Purpose of Disclosure', type: 'textarea', required: true },
        { key: 'term_duration', label: 'Term Duration', type: 'text', required: true }
      ],
      'Employment Agreement': [
        { key: 'position_title', label: 'Position Title', type: 'text', required: true },
        { key: 'salary', label: 'Salary', type: 'text', required: true },
        { key: 'start_date', label: 'Start Date', type: 'date', required: true },
        { key: 'benefits', label: 'Benefits', type: 'textarea', required: false }
      ],
      'Demand Letter': [
        { key: 'amount_owed', label: 'Amount Owed', type: 'text', required: false },
        { key: 'basis_of_claim', label: 'Basis of Claim', type: 'textarea', required: true },
        { key: 'deadline', label: 'Response Deadline', type: 'date', required: true },
        { key: 'consequences', label: 'Consequences of Non-Compliance', type: 'textarea', required: false }
      ]
    };

    return [...baseFields, ...(typeSpecificFields[docType] || [])];
  };

  const renderParameterForm = () => {
    if (!documentType) return null;

    const fields = getParameterFields(documentType);

    return (
      <div className="space-y-4">
        <h4 className="font-semibold">Document Parameters</h4>
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <Textarea
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={parameters[field.key] || ''}
                onChange={(e) => handleParameterChange(field.key, e.target.value)}
                rows={3}
              />
            ) : (
              <Input
                type={field.type}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={parameters[field.key] || ''}
                onChange={(e) => handleParameterChange(field.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDocumentPreview = (document: any) => {
    if (!document) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {document.title || `${documentType} Draft`}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {document.metadata && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <h5 className="font-medium mb-2">Document Information</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {document.metadata.word_count && (
                  <div><strong>Word Count:</strong> {document.metadata.word_count}</div>
                )}
                {document.metadata.sections && (
                  <div><strong>Sections:</strong> {document.metadata.sections}</div>
                )}
                {document.metadata.estimated_review_time && (
                  <div><strong>Est. Review Time:</strong> {document.metadata.estimated_review_time}</div>
                )}
                {document.metadata.complexity_level && (
                  <div><strong>Complexity:</strong> 
                    <Badge variant="outline" className="ml-1">
                      {document.metadata.complexity_level}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {previewMode ? (
            <div className="prose max-w-none">
              <div className="bg-white border rounded p-6 min-h-[400px] whitespace-pre-wrap font-serif text-sm leading-relaxed">
                {document.content}
              </div>
            </div>
          ) : (
            <Textarea
              value={document.content}
              onChange={(e) => setDraftedDocument({
                ...draftedDocument,
                content: e.target.value
              })}
              rows={20}
              className="font-mono text-sm"
            />
          )}

          {document.suggestions && document.suggestions.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <h5 className="font-medium mb-2">AI Suggestions</h5>
              <ul className="space-y-1 text-sm">
                {document.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {document.review_checklist && document.review_checklist.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded">
              <h5 className="font-medium mb-2">Review Checklist</h5>
              <ul className="space-y-1 text-sm">
                {document.review_checklist.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDocumentSections = (sections: any[]) => {
    if (!sections || sections.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Document Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sections.map((section: any, index: number) => (
              <div key={index} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{section.title}</h5>
                  <Badge variant="outline">{section.type}</Badge>
                </div>
                {section.description && (
                  <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                )}
                {section.content && (
                  <div className="text-sm bg-gray-50 p-2 rounded">
                    {section.content.substring(0, 200)}
                    {section.content.length > 200 && '...'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Drafting</CardTitle>
          <p className="text-sm text-gray-600">
            AI-assisted legal document creation and revision
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Template ID (optional)</label>
            <Input
              type="number"
              placeholder="Enter template ID to use as base"
              value={templateId || ''}
              onChange={(e) => setTemplateId(e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>

          {renderParameterForm()}

          <Button 
            onClick={handleDraftDocument} 
            disabled={loading || !documentType}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Drafting Document...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Draft Document
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {draftedDocument && (
        <div className="space-y-4">
          {/* Document Preview */}
          {renderDocumentPreview(draftedDocument)}

          {/* Document Sections */}
          {renderDocumentSections(draftedDocument.sections)}

          {/* Alternative Versions */}
          {draftedDocument.alternatives && draftedDocument.alternatives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Alternative Versions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {draftedDocument.alternatives.map((alt: any, index: number) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{alt.name}</h5>
                        <Button variant="outline" size="sm">
                          Use This Version
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">{alt.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legal Analysis */}
          {draftedDocument.legal_analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Legal Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {draftedDocument.legal_analysis.strengths && (
                    <div>
                      <h5 className="font-medium text-green-700">Strengths</h5>
                      <ul className="mt-1 space-y-1">
                        {draftedDocument.legal_analysis.strengths.map((strength: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {draftedDocument.legal_analysis.weaknesses && (
                    <div>
                      <h5 className="font-medium text-red-700">Areas for Improvement</h5>
                      <ul className="mt-1 space-y-1">
                        {draftedDocument.legal_analysis.weaknesses.map((weakness: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-red-500">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentDrafting;
