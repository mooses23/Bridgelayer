import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Cog, Clock, FileText, Settings, Download, Play } from 'lucide-react';
import llmApi from '@/lib/llmApi';

interface DocumentAutomationProps {
  firmId: number;
  userId: number;
}

const DocumentAutomation: React.FC<DocumentAutomationProps> = ({ firmId, userId }) => {
  const [automationType, setAutomationType] = useState('');
  const [parameters, setParameters] = useState<any>({});
  const [userQuery, setUserQuery] = useState('');
  const [automationResults, setAutomationResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const automationTypes = [
    'Document Generation', 'Document Review Automation', 'Contract Assembly', 
    'Clause Library Management', 'Document Comparison', 'Template Creation',
    'Bulk Document Processing', 'Document Classification', 'Data Extraction',
    'Approval Workflow', 'Version Control', 'Document Standardization'
  ];

  const handleParameterChange = (key: string, value: any) => {
    setParameters({ ...parameters, [key]: value });
  };

  const handleRunAutomation = async () => {
    if (!automationType) {
      setError('Please select an automation type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await llmApi.getDocumentAutomation(
        firmId, 
        userId, 
        automationType,
        parameters,
        userQuery
      );
      setAutomationResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run document automation');
    } finally {
      setLoading(false);
    }
  };

  const getParameterForm = () => {
    const commonFields = [
      { key: 'input_documents', label: 'Input Documents (IDs, comma-separated)', type: 'text' },
      { key: 'output_format', label: 'Output Format', type: 'select', options: ['PDF', 'DOCX', 'HTML', 'TXT'] },
      { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'] }
    ];

    const typeSpecificFields: any = {
      'Document Generation': [
        { key: 'template_id', label: 'Template ID', type: 'number' },
        { key: 'data_source', label: 'Data Source', type: 'text' },
        { key: 'merge_fields', label: 'Merge Fields (JSON)', type: 'textarea' }
      ],
      'Document Review Automation': [
        { key: 'review_criteria', label: 'Review Criteria', type: 'textarea' },
        { key: 'compliance_standards', label: 'Compliance Standards', type: 'text' },
        { key: 'auto_flag_issues', label: 'Auto-flag Issues', type: 'checkbox' }
      ],
      'Contract Assembly': [
        { key: 'contract_type', label: 'Contract Type', type: 'text' },
        { key: 'clause_library', label: 'Clause Library ID', type: 'number' },
        { key: 'assembly_rules', label: 'Assembly Rules', type: 'textarea' }
      ],
      'Document Comparison': [
        { key: 'baseline_document', label: 'Baseline Document ID', type: 'number' },
        { key: 'comparison_documents', label: 'Comparison Document IDs', type: 'text' },
        { key: 'comparison_type', label: 'Comparison Type', type: 'select', options: ['Full', 'Structural', 'Content Only'] }
      ],
      'Bulk Document Processing': [
        { key: 'batch_size', label: 'Batch Size', type: 'number' },
        { key: 'processing_rules', label: 'Processing Rules', type: 'textarea' },
        { key: 'parallel_processing', label: 'Parallel Processing', type: 'checkbox' }
      ]
    };

    const fields = [...commonFields, ...(typeSpecificFields[automationType] || [])];

    return (
      <div className="space-y-4">
        <h4 className="font-semibold">Automation Parameters</h4>
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-2">{field.label}</label>
            {field.type === 'textarea' ? (
              <Textarea
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={parameters[field.key] || ''}
                onChange={(e) => handleParameterChange(field.key, e.target.value)}
                rows={3}
              />
            ) : field.type === 'select' ? (
              <Select 
                value={parameters[field.key] || ''} 
                onValueChange={(value) => handleParameterChange(field.key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option: string) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.key}
                  checked={parameters[field.key] || false}
                  onCheckedChange={(checked) => handleParameterChange(field.key, checked)}
                />
                <label htmlFor={field.key} className="text-sm">
                  Enable {field.label.toLowerCase()}
                </label>
              </div>
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

  const renderAutomationStatus = (status: any) => {
    if (!status) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog className="h-5 w-5" />
            Automation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">
                  {status.processed_documents || 0}
                </div>
                <div className="text-sm text-blue-700">Processed</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {status.successful_operations || 0}
                </div>
                <div className="text-sm text-green-700">Successful</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {status.failed_operations || 0}
                </div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <div className="text-2xl font-bold text-yellow-600">
                  {status.completion_percentage || 0}%
                </div>
                <div className="text-sm text-yellow-700">Complete</div>
              </div>
            </div>

            {status.current_operation && (
              <div className="bg-blue-50 p-3 rounded">
                <h5 className="font-medium mb-1">Current Operation</h5>
                <p className="text-sm">{status.current_operation}</p>
              </div>
            )}

            {status.estimated_completion && (
              <div className="text-sm text-gray-600">
                <strong>Estimated Completion:</strong> {status.estimated_completion}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProcessedDocuments = (documents: any[]) => {
    if (!documents || documents.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Processed Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc: any, index: number) => (
              <div key={index} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{doc.name || `Document ${index + 1}`}</h5>
                  <div className="flex gap-2">
                    <Badge variant={doc.status === 'completed' ? 'secondary' : 
                                   doc.status === 'failed' ? 'destructive' : 'default'}>
                      {doc.status}
                    </Badge>
                    {doc.download_url && (
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>

                {doc.processing_summary && (
                  <p className="text-sm text-gray-600 mb-2">{doc.processing_summary}</p>
                )}

                {doc.modifications && doc.modifications.length > 0 && (
                  <div>
                    <strong className="text-sm">Modifications Applied:</strong>
                    <ul className="mt-1 space-y-1">
                      {doc.modifications.map((mod: string, modIndex: number) => (
                        <li key={modIndex} className="text-sm flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          {mod}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {doc.issues && doc.issues.length > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded">
                    <strong className="text-sm">Issues Found:</strong>
                    <ul className="mt-1 space-y-1">
                      {doc.issues.map((issue: string, issueIndex: number) => (
                        <li key={issueIndex} className="text-sm flex items-start gap-2">
                          <span className="text-yellow-500">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {doc.metadata && (
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {doc.metadata.size && <div><strong>Size:</strong> {doc.metadata.size}</div>}
                      {doc.metadata.pages && <div><strong>Pages:</strong> {doc.metadata.pages}</div>}
                      {doc.metadata.format && <div><strong>Format:</strong> {doc.metadata.format}</div>}
                      {doc.metadata.processing_time && <div><strong>Time:</strong> {doc.metadata.processing_time}</div>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAutomationWorkflow = (workflow: any) => {
    if (!workflow) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflow.steps && workflow.steps.map((step: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.status === 'completed' ? 'bg-green-100 text-green-700' :
                  step.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  step.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium">{step.name}</h5>
                  {step.description && (
                    <p className="text-sm text-gray-600">{step.description}</p>
                  )}
                  {step.estimated_time && (
                    <div className="text-xs text-gray-500 mt-1">
                      Est. time: {step.estimated_time}
                    </div>
                  )}
                </div>
                <Badge variant={step.status === 'completed' ? 'secondary' : 
                               step.status === 'in_progress' ? 'default' :
                               step.status === 'failed' ? 'destructive' : 'outline'}>
                  {step.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAutomationSummary = (summary: any) => {
    if (!summary) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Automation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.description && (
              <p className="text-sm leading-relaxed">{summary.description}</p>
            )}

            {summary.benefits && summary.benefits.length > 0 && (
              <div>
                <h5 className="font-medium mb-2">Benefits Achieved</h5>
                <ul className="space-y-1">
                  {summary.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.time_saved && (
              <div className="bg-green-50 p-3 rounded">
                <strong className="text-green-700">Time Saved: {summary.time_saved}</strong>
              </div>
            )}

            {summary.cost_savings && (
              <div className="bg-blue-50 p-3 rounded">
                <strong className="text-blue-700">Cost Savings: {summary.cost_savings}</strong>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Automation</CardTitle>
          <p className="text-sm text-gray-600">
            Automate document processing, generation, and management tasks
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Automation Type</label>
            <Select value={automationType} onValueChange={setAutomationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select automation type" />
              </SelectTrigger>
              <SelectContent>
                {automationTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {automationType && getParameterForm()}

          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Instructions (optional)
            </label>
            <Textarea
              placeholder="Any specific instructions or requirements for the automation?"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleRunAutomation} 
            disabled={loading || !automationType}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Running Automation...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Automation
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

      {automationResults && (
        <div className="space-y-4">
          {/* Automation Summary */}
          {renderAutomationSummary(automationResults.summary)}

          {/* Automation Status */}
          {renderAutomationStatus(automationResults.status)}

          {/* Workflow */}
          {renderAutomationWorkflow(automationResults.workflow)}

          {/* Processed Documents */}
          {renderProcessedDocuments(automationResults.processed_documents)}

          {/* Recommendations */}
          {automationResults.recommendations && automationResults.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Automation Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {automationResults.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Cog className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics */}
          {automationResults.performance && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(automationResults.performance).map(([metric, value]: [string, any]) => (
                    <div key={metric} className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-xl font-bold text-gray-700">{value}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {metric.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentAutomation;
