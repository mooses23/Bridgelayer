
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, AlertTriangle, CheckCircle, Clock, Download } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

interface DocumentAnalysisResult {
  summary: string;
  keyPoints: string[];
  riskFlags: string[];
  extractedClauses: Array<{
    type: string;
    content: string;
    location: string;
  }>;
  confidence: number;
  analysisType: string;
}

interface AnalysisResponse {
  success: boolean;
  analysis: DocumentAnalysisResult;
  fileName: string;
  documentType: string;
  timestamp: string;
}

const DOCUMENT_TYPES = [
  { value: 'nda', label: 'Non-Disclosure Agreement (NDA)' },
  { value: 'employment', label: 'Employment Agreement' },
  { value: 'lease', label: 'Lease Agreement' },
  { value: 'contract', label: 'General Contract' },
  { value: 'settlement', label: 'Settlement Agreement' },
  { value: 'litigation', label: 'Litigation Document' },
  { value: 'discovery', label: 'Discovery Document' },
  { value: 'other', label: 'Other Legal Document' }
];

export function DocumentAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { tenant } = useTenant();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setAnalysisResult(null);
      
      // Auto-suggest document type based on filename
      const fileName = file.name.toLowerCase();
      if (fileName.includes('nda') || fileName.includes('confidential')) {
        setDocumentType('nda');
      } else if (fileName.includes('employ') || fileName.includes('job')) {
        setDocumentType('employment');
      } else if (fileName.includes('lease') || fileName.includes('rent')) {
        setDocumentType('lease');
      } else if (fileName.includes('contract') || fileName.includes('agreement')) {
        setDocumentType('contract');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB limit
  });

  const analyzeDocument = async () => {
    if (!selectedFile || !documentType) {
      setError('Please select a file and document type');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('documentType', documentType);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenant?.id || '',
        },
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result: AnalysisResponse = await response.json();
      setAnalysisResult(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    if (risk.toLowerCase().includes('high')) return 'destructive';
    if (risk.toLowerCase().includes('medium')) return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>AI Document Analyzer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {selectedFile ? (
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-2">Drop your legal document here, or click to browse</p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOCX, and TXT files (max 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Document Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type</label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type for optimal analysis" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing document with AI...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={analyzeDocument} 
              disabled={!selectedFile || !documentType || isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
            </Button>
            {selectedFile && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedFile(null);
                  setDocumentType('');
                  setAnalysisResult(null);
                  setError(null);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Analysis Results</span>
              <Badge variant="secondary">
                {Math.round(analysisResult.analysis.confidence * 100)}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="key-points">Key Points</TabsTrigger>
                <TabsTrigger value="risks">Risk Flags</TabsTrigger>
                <TabsTrigger value="clauses">Extracted Clauses</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Document Summary</h4>
                  <p className="text-gray-700">{analysisResult.analysis.summary}</p>
                </div>
                <div className="text-xs text-gray-500">
                  Analyzed: {new Date(analysisResult.timestamp).toLocaleString()}
                </div>
              </TabsContent>

              <TabsContent value="key-points" className="space-y-2">
                {analysisResult.analysis.keyPoints.length > 0 ? (
                  analysisResult.analysis.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{point}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No key points identified</p>
                )}
              </TabsContent>

              <TabsContent value="risks" className="space-y-2">
                {analysisResult.analysis.riskFlags.length > 0 ? (
                  analysisResult.analysis.riskFlags.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{risk}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">No significant risk flags identified</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="clauses" className="space-y-3">
                {analysisResult.analysis.extractedClauses.length > 0 ? (
                  analysisResult.analysis.extractedClauses.map((clause, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{clause.type}</Badge>
                        <span className="text-xs text-gray-500">{clause.location}</span>
                      </div>
                      <p className="text-sm text-gray-700">{clause.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No specific clauses extracted</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DocumentAnalyzer;
