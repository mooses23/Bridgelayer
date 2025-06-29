import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileText, CheckCircle, Clock, DollarSign } from 'lucide-react';
import llmApi from '@/lib/llmApi';

interface ContractAnalysisProps {
  firmId: number;
  userId: number;
}

const ContractAnalysis: React.FC<ContractAnalysisProps> = ({ firmId, userId }) => {
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedDocument) {
      setError('Please select a document to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await llmApi.getContractAnalysis(firmId, userId, selectedDocument, userQuery);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze contract');
    } finally {
      setLoading(false);
    }
  };

  const renderContractTerms = (terms: any[]) => {
    if (!terms || terms.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Key Contract Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {terms.map((term, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{term.term_type}</h4>
                  <Badge variant={term.risk_level === 'high' ? 'destructive' : 
                                 term.risk_level === 'medium' ? 'default' : 'secondary'}>
                    {term.risk_level} risk
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{term.description}</p>
                <div className="text-xs text-gray-500">
                  <strong>Location:</strong> {term.location || 'Page/Section not specified'}
                </div>
                {term.concerns && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                    <strong>Concerns:</strong> {term.concerns}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFinancialTerms = (financial: any) => {
    if (!financial) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financial.payment_terms && (
              <div>
                <h4 className="font-semibold mb-2">Payment Terms</h4>
                <p className="text-sm">{financial.payment_terms}</p>
              </div>
            )}
            {financial.termination_costs && (
              <div>
                <h4 className="font-semibold mb-2">Termination Costs</h4>
                <p className="text-sm">{financial.termination_costs}</p>
              </div>
            )}
            {financial.penalties && (
              <div>
                <h4 className="font-semibold mb-2">Penalties & Fees</h4>
                <p className="text-sm">{financial.penalties}</p>
              </div>
            )}
            {financial.total_value && (
              <div>
                <h4 className="font-semibold mb-2">Contract Value</h4>
                <p className="text-sm font-medium text-green-600">{financial.total_value}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRiskAnalysis = (risks: any[]) => {
    if (!risks || risks.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {risks.map((risk, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertCircle className={`h-4 w-4 mt-0.5 ${
                  risk.severity === 'high' ? 'text-red-500' :
                  risk.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium">{risk.type}</h5>
                    <Badge variant={risk.severity === 'high' ? 'destructive' : 
                                   risk.severity === 'medium' ? 'default' : 'secondary'}>
                      {risk.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                  {risk.mitigation && (
                    <div className="text-sm">
                      <strong>Mitigation:</strong> {risk.mitigation}
                    </div>
                  )}
                </div>
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
          <CardTitle>Contract Analysis</CardTitle>
          <p className="text-sm text-gray-600">
            Specialized contract review and term extraction
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
              Analysis Focus (optional)
            </label>
            <Textarea
              placeholder="What specific aspects of the contract would you like to analyze? (e.g., liability clauses, payment terms, termination conditions)"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !selectedDocument}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Contract...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Analyze Contract
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

      {analysis && (
        <div className="space-y-4">
          {/* Summary */}
          {analysis.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Contract Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{analysis.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Contract Terms */}
          {renderContractTerms(analysis.contract_terms)}

          {/* Financial Analysis */}
          {renderFinancialTerms(analysis.financial_analysis)}

          {/* Risk Analysis */}
          {renderRiskAnalysis(analysis.risks)}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
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

export default ContractAnalysis;
