import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, FileText, Clock, Filter, BookOpen } from 'lucide-react';
import llmApi from '@/lib/llmApi';

interface ClauseExtractionProps {
  firmId: number;
  userId: number;
}

const ClauseExtraction: React.FC<ClauseExtractionProps> = ({ firmId, userId }) => {
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [selectedClauseTypes, setSelectedClauseTypes] = useState<string[]>([]);
  const [customClauseType, setCustomClauseType] = useState('');
  const [extractedClauses, setExtractedClauses] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterTerm, setFilterTerm] = useState('');

  const commonClauseTypes = [
    'Liability Limitation', 'Indemnification', 'Termination', 'Force Majeure',
    'Confidentiality', 'Non-Disclosure', 'Payment Terms', 'Warranties',
    'Intellectual Property', 'Governing Law', 'Dispute Resolution', 'Assignment',
    'Amendment', 'Severability', 'Integration', 'Non-Compete',
    'Non-Solicitation', 'Insurance', 'Data Protection', 'Compliance'
  ];

  const handleClauseTypeChange = (clauseType: string, checked: boolean) => {
    if (checked) {
      setSelectedClauseTypes([...selectedClauseTypes, clauseType]);
    } else {
      setSelectedClauseTypes(selectedClauseTypes.filter(c => c !== clauseType));
    }
  };

  const addCustomClauseType = () => {
    if (customClauseType.trim() && !selectedClauseTypes.includes(customClauseType.trim())) {
      setSelectedClauseTypes([...selectedClauseTypes, customClauseType.trim()]);
      setCustomClauseType('');
    }
  };

  const handleExtractClauses = async () => {
    if (!selectedDocument) {
      setError('Please select a document to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await llmApi.getClauseExtraction(
        firmId, 
        userId, 
        selectedDocument, 
        selectedClauseTypes.length > 0 ? selectedClauseTypes : undefined,
        userQuery
      );
      setExtractedClauses(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract clauses');
    } finally {
      setLoading(false);
    }
  };

  const getClauseRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return { bg: 'bg-red-50', text: 'text-red-700', badge: 'destructive' };
      case 'medium':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'default' };
      case 'low':
        return { bg: 'bg-green-50', text: 'text-green-700', badge: 'secondary' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'outline' };
    }
  };

  const filteredClauses = extractedClauses?.clauses?.filter((clause: any) =>
    !filterTerm || 
    clause.type?.toLowerCase().includes(filterTerm.toLowerCase()) ||
    clause.content?.toLowerCase().includes(filterTerm.toLowerCase()) ||
    clause.description?.toLowerCase().includes(filterTerm.toLowerCase())
  ) || [];

  const renderClausesSummary = (summary: any) => {
    if (!summary) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Extraction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {summary.total_clauses || 0}
              </div>
              <div className="text-sm text-blue-700">Total Clauses</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {summary.standard_clauses || 0}
              </div>
              <div className="text-sm text-green-700">Standard</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">
                {summary.custom_clauses || 0}
              </div>
              <div className="text-sm text-yellow-700">Custom</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">
                {summary.high_risk_clauses || 0}
              </div>
              <div className="text-sm text-red-700">High Risk</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderClauseDetails = (clauses: any[]) => {
    if (!clauses || clauses.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Extracted Clauses
            <span className="text-sm font-normal text-gray-500">
              ({filteredClauses.length} of {clauses.length})
            </span>
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Filter clauses..."
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClauses.map((clause: any, index: number) => {
              const riskConfig = getClauseRiskColor(clause.risk_level);
              return (
                <div key={index} className={`border rounded-lg p-4 ${riskConfig.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{clause.type}</h4>
                    <div className="flex gap-2">
                      {clause.risk_level && (
                        <Badge variant={riskConfig.badge as any}>
                          {clause.risk_level} risk
                        </Badge>
                      )}
                      {clause.category && (
                        <Badge variant="outline">
                          {clause.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {clause.description && (
                    <p className="text-sm text-gray-600 mb-3">{clause.description}</p>
                  )}

                  <div className="bg-white border rounded p-3 mb-3">
                    <div className="text-xs text-gray-500 mb-2">Clause Content:</div>
                    <div className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                      {clause.content}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {clause.location && (
                      <div>
                        <span className="text-xs font-medium">Location:</span>
                        <div className="text-sm">{clause.location}</div>
                      </div>
                    )}
                    {clause.enforceability && (
                      <div>
                        <span className="text-xs font-medium">Enforceability:</span>
                        <div className="text-sm">{clause.enforceability}</div>
                      </div>
                    )}
                  </div>

                  {clause.key_terms && clause.key_terms.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-medium">Key Terms:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {clause.key_terms.map((term: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {clause.concerns && (
                    <div className="mb-3 p-2 bg-yellow-50 rounded text-sm">
                      <strong>Concerns:</strong> {clause.concerns}
                    </div>
                  )}

                  {clause.recommendations && clause.recommendations.length > 0 && (
                    <div>
                      <span className="text-xs font-medium">Recommendations:</span>
                      <ul className="mt-1 space-y-1">
                        {clause.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderClauseTypesBreakdown = (breakdown: any) => {
    if (!breakdown) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Clause Types Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(breakdown).map(([type, count]: [string, any]) => (
              <div key={type} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-medium">{type}</span>
                <Badge variant="outline">{count}</Badge>
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
          <CardTitle>Clause Extraction</CardTitle>
          <p className="text-sm text-gray-600">
            Smart identification and categorization of clauses
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Document ID</label>
            <Input
              type="number"
              placeholder="Enter document ID"
              value={selectedDocument || ''}
              onChange={(e) => setSelectedDocument(e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Clause Types to Extract
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {commonClauseTypes.map((clauseType) => (
                <div key={clauseType} className="flex items-center space-x-2">
                  <Checkbox
                    id={clauseType}
                    checked={selectedClauseTypes.includes(clauseType)}
                    onCheckedChange={(checked) => handleClauseTypeChange(clauseType, checked as boolean)}
                  />
                  <label htmlFor={clauseType} className="text-sm">
                    {clauseType}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom clause type"
                value={customClauseType}
                onChange={(e) => setCustomClauseType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomClauseType()}
              />
              <Button variant="outline" onClick={addCustomClauseType}>
                Add
              </Button>
            </div>

            {selectedClauseTypes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedClauseTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="cursor-pointer"
                         onClick={() => handleClauseTypeChange(type, false)}>
                    {type} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Extraction Focus (optional)
            </label>
            <Textarea
              placeholder="What specific aspects of the clauses would you like to focus on?"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleExtractClauses} 
            disabled={loading || !selectedDocument}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Extracting Clauses...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Extract Clauses
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

      {extractedClauses && (
        <div className="space-y-4">
          {/* Summary */}
          {renderClausesSummary(extractedClauses.summary)}

          {/* Clause Types Breakdown */}
          {renderClauseTypesBreakdown(extractedClauses.clause_types_breakdown)}

          {/* Clause Details */}
          {renderClauseDetails(extractedClauses.clauses)}

          {/* Recommendations */}
          {extractedClauses.recommendations && extractedClauses.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {extractedClauses.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ClauseExtraction;
