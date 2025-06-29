import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  Copy, 
  Check, 
  Share2,
  Star,
  StarOff,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface LlmResult {
  id: string;
  functionType: string;
  timestamp: string;
  prompt: string;
  response: any;
  cost: number;
  tokens: number;
  processingTime: number;
  userId: number;
  userName: string;
  documentId?: number;
  documentName?: string;
  isFavorite?: boolean;
}

interface ResultDisplayProps {
  result: LlmResult;
  onSave?: (result: LlmResult) => void;
  onFavorite?: (resultId: string, isFavorite: boolean) => void;
  showMetadata?: boolean;
  allowExport?: boolean;
  allowShare?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4
  }).format(amount);
};

const formatTokens = (tokens: number) => {
  return tokens.toLocaleString();
};

const formatDuration = (seconds: number) => {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  return `${seconds.toFixed(1)}s`;
};

export default function ResultDisplay({
  result,
  onSave,
  onFavorite,
  showMetadata = true,
  allowExport = true,
  allowShare = true
}: ResultDisplayProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']));
  const [exportFormat, setExportFormat] = useState<'txt' | 'pdf' | 'docx'>('txt');

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = async (text: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionName);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleExport = async (format: 'txt' | 'pdf' | 'docx') => {
    try {
      const response = await fetch('/api/llm/results/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resultId: result.id,
          format
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `llm-result-${result.id}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleToggleFavorite = () => {
    if (onFavorite) {
      onFavorite(result.id, !result.isFavorite);
    }
  };

  const renderStructuredContent = (content: any) => {
    if (typeof content === 'string') {
      return (
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-sm">{content}</pre>
        </div>
      );
    }

    if (typeof content === 'object' && content !== null) {
      return (
        <div className="space-y-4">
          {Object.entries(content).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg capitalize">
                  {key.replace(/_/g, ' ')}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleSection(key)}
                >
                  {expandedSections.has(key) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {expandedSections.has(key) && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        {Array.isArray(value) ? (
                          <ul className="list-disc list-inside space-y-2">
                            {value.map((item, index) => (
                              <li key={index} className="text-sm">
                                {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
                              </li>
                            ))}
                          </ul>
                        ) : typeof value === 'object' ? (
                          <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{String(value)}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(
                          Array.isArray(value) ? value.join('\n') : String(value),
                          key
                        )}
                      >
                        {copiedSection === key ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const getResultTypeIcon = (functionType: string) => {
    switch (functionType) {
      case 'document_review':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'contract_analysis':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'compliance_check':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'risk_assessment':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {getResultTypeIcon(result.functionType)}
              <div>
                <CardTitle className="text-xl">
                  {result.functionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Results
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {result.userName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                  {result.documentName && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {result.documentName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleFavorite}
              >
                {result.isFavorite ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>
              
              {allowShare && (
                <Button size="sm" variant="ghost">
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
              
              {allowExport && (
                <div className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport(exportFormat)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Metadata */}
        {showMetadata && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-4 text-sm">
              <Badge variant="secondary">
                Cost: {formatCurrency(result.cost)}
              </Badge>
              <Badge variant="secondary">
                Tokens: {formatTokens(result.tokens)}
              </Badge>
              <Badge variant="secondary">
                Time: {formatDuration(result.processingTime)}
              </Badge>
              <Badge variant="outline">
                ID: {result.id}
              </Badge>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Original Prompt */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Original Request</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(result.prompt, 'prompt')}
            >
              {copiedSection === 'prompt' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{result.prompt}</p>
          </div>
        </CardContent>
      </Card>

      {/* Main Results */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Analysis Results</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(
                typeof result.response === 'string' 
                  ? result.response 
                  : JSON.stringify(result.response, null, 2),
                'results'
              )}
            >
              {copiedSection === 'results' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderStructuredContent(result.response)}
        </CardContent>
      </Card>

      {/* Export Options */}
      {allowExport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={exportFormat === 'txt' ? 'default' : 'outline'}
                onClick={() => {
                  setExportFormat('txt');
                  handleExport('txt');
                }}
              >
                Plain Text
              </Button>
              <Button
                size="sm"
                variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                onClick={() => {
                  setExportFormat('pdf');
                  handleExport('pdf');
                }}
              >
                PDF
              </Button>
              <Button
                size="sm"
                variant={exportFormat === 'docx' ? 'default' : 'outline'}
                onClick={() => {
                  setExportFormat('docx');
                  handleExport('docx');
                }}
              >
                Word Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {onSave && (
        <div className="flex justify-center">
          <Button onClick={() => onSave(result)}>
            Save Results
          </Button>
        </div>
      )}
    </div>
  );
}
