import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import llmApi from '@/lib/llmApi';

interface ComplianceCheckProps {
  firmId: number;
  userId: number;
}

const ComplianceCheck: React.FC<ComplianceCheckProps> = ({ firmId, userId }) => {
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [selectedRegulations, setSelectedRegulations] = useState<string[]>([]);
  const [customRegulation, setCustomRegulation] = useState('');
  const [complianceResults, setComplianceResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commonRegulations = [
    'GDPR', 'CCPA', 'HIPAA', 'SOX', 'PCI DSS', 'FERPA', 'ADA', 'TCPA',
    'Fair Credit Reporting Act', 'Truth in Lending Act', 'Fair Debt Collection Practices Act',
    'Securities Exchange Act', 'Investment Advisers Act', 'ERISA'
  ];

  const handleRegulationChange = (regulation: string, checked: boolean) => {
    if (checked) {
      setSelectedRegulations([...selectedRegulations, regulation]);
    } else {
      setSelectedRegulations(selectedRegulations.filter(r => r !== regulation));
    }
  };

  const addCustomRegulation = () => {
    if (customRegulation.trim() && !selectedRegulations.includes(customRegulation.trim())) {
      setSelectedRegulations([...selectedRegulations, customRegulation.trim()]);
      setCustomRegulation('');
    }
  };

  const handleComplianceCheck = async () => {
    if (!selectedDocument) {
      setError('Please select a document to check');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await llmApi.getComplianceCheck(
        firmId, 
        userId, 
        selectedDocument, 
        selectedRegulations.length > 0 ? selectedRegulations : undefined,
        userQuery
      );
      setComplianceResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform compliance check');
    } finally {
      setLoading(false);
    }
  };

  const renderComplianceStatus = (status: string) => {
    const statusConfig = {
      compliant: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', badge: 'secondary' },
      non_compliant: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', badge: 'destructive' },
      partial: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50', badge: 'default' },
      unknown: { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-50', badge: 'outline' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unknown;
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 p-2 rounded ${config.bg}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
        <Badge variant={config.badge as any}>
          {status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>
    );
  };

  const renderComplianceIssues = (issues: any[]) => {
    if (!issues || issues.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Compliance Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{issue.regulation}</h4>
                  <Badge variant={issue.severity === 'high' ? 'destructive' : 
                                 issue.severity === 'medium' ? 'default' : 'secondary'}>
                    {issue.severity} severity
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                <div className="text-xs text-gray-500 mb-2">
                  <strong>Section:</strong> {issue.section || 'Not specified'}
                </div>
                {issue.recommendation && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <strong>Recommendation:</strong> {issue.recommendation}
                  </div>
                )}
                {issue.citation && (
                  <div className="mt-2 text-xs text-gray-500">
                    <strong>Legal Reference:</strong> {issue.citation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderComplianceScore = (score: any) => {
    if (!score) return null;

    const getScoreColor = (value: number) => {
      if (value >= 90) return 'text-green-600';
      if (value >= 70) return 'text-yellow-600';
      return 'text-red-600';
    };

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall}%
            </div>
            <p className="text-sm text-gray-600 mt-2">Overall Compliance Score</p>
          </div>
          
          {score.breakdown && (
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold">Breakdown by Category</h4>
              {Object.entries(score.breakdown).map(([category, value]: [string, any]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <span className={`text-sm font-medium ${getScoreColor(value)}`}>
                    {value}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Check</CardTitle>
          <p className="text-sm text-gray-600">
            Regulatory compliance verification and audit
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
              Regulations to Check
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {commonRegulations.map((regulation) => (
                <div key={regulation} className="flex items-center space-x-2">
                  <Checkbox
                    id={regulation}
                    checked={selectedRegulations.includes(regulation)}
                    onCheckedChange={(checked) => handleRegulationChange(regulation, checked as boolean)}
                  />
                  <label htmlFor={regulation} className="text-sm">
                    {regulation}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom regulation"
                value={customRegulation}
                onChange={(e) => setCustomRegulation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomRegulation()}
              />
              <Button variant="outline" onClick={addCustomRegulation}>
                Add
              </Button>
            </div>

            {selectedRegulations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedRegulations.map((reg) => (
                  <Badge key={reg} variant="secondary" className="cursor-pointer"
                         onClick={() => handleRegulationChange(reg, false)}>
                    {reg} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Specific Compliance Focus (optional)
            </label>
            <Textarea
              placeholder="What specific compliance areas would you like to focus on?"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleComplianceCheck} 
            disabled={loading || !selectedDocument}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Checking Compliance...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Check Compliance
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

      {complianceResults && (
        <div className="space-y-4">
          {/* Overall Status */}
          {complianceResults.overall_status && (
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                {renderComplianceStatus(complianceResults.overall_status)}
                {complianceResults.summary && (
                  <p className="text-sm mt-3 leading-relaxed">{complianceResults.summary}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Compliance Score */}
          {renderComplianceScore(complianceResults.compliance_score)}

          {/* Issues */}
          {renderComplianceIssues(complianceResults.issues)}

          {/* Recommendations */}
          {complianceResults.recommendations && complianceResults.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {complianceResults.recommendations.map((rec: string, index: number) => (
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

export default ComplianceCheck;
