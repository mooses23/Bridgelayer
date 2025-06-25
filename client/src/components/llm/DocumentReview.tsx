import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import llmApi from '@/lib/llmApi';
import axios from 'axios';

interface DocumentReviewProps {
  documentId?: number;
}

export default function DocumentReview({ documentId }: DocumentReviewProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(documentId || null);
  const [customQuery, setCustomQuery] = useState('');
  const [result, setResult] = useState<any>(null);

  // Mock firm and user data - in real app these would come from auth context
  const firmId = 1;
  const userId = 1;

  // Fetch available documents
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await axios.get('/api/documents');
      return response.data;
    }
  });

  // Document review mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ docId, query }: { docId: number; query?: string }) => {
      return await llmApi.getDocumentReview(
        firmId,
        userId,
        docId,
        query || 'Provide a comprehensive legal review of this document'
      );
    },
    onSuccess: (data) => {
      setResult(data);
    }
  });

  const handleReview = () => {
    if (!selectedDocumentId) return;
    reviewMutation.mutate({ 
      docId: selectedDocumentId, 
      query: customQuery || undefined 
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Review
            <Badge variant="secondary">AI-Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Document to Review
            </label>
            {documentsLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading documents...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {documents?.map((doc: any) => (
                  <Button
                    key={doc.id}
                    variant={selectedDocumentId === doc.id ? "default" : "outline"}
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => setSelectedDocumentId(doc.id)}
                  >
                    <div>
                      <div className="font-medium text-sm">{doc.fileName}</div>
                      <div className="text-xs text-gray-500">
                        {doc.documentType} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Unknown date'}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Query */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Custom Analysis Request (Optional)
            </label>
            <Textarea
              placeholder="e.g., Focus on privacy clauses and data protection compliance"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Review Button */}
          <Button 
            onClick={handleReview}
            disabled={!selectedDocumentId || reviewMutation.isPending}
            className="w-full"
          >
            {reviewMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              'Start Document Review'
            )}
          </Button>

          {/* Error Display */}
          {reviewMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(reviewMutation.error as any)?.response?.data?.error || 'Failed to analyze document'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Review Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Display structured results if available */}
              {result.summary && (
                <div>
                  <h3 className="font-semibold mb-2">Executive Summary</h3>
                  <p className="text-gray-700">{result.summary}</p>
                </div>
              )}
              
              {result.risks && result.risks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Identified Risks</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.risks.map((risk: string, index: number) => (
                      <li key={index} className="text-gray-700">{risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fallback for unstructured response */}
              {(!result.summary && !result.risks && !result.recommendations) && (
                <div>
                  <h3 className="font-semibold mb-2">Analysis Results</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">
                      {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
