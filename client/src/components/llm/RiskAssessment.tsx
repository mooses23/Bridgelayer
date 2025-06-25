import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, TrendingUp, TrendingDown, Clock, Shield } from 'lucide-react';
import llmApi from '@/lib/llmApi';

interface RiskAssessmentProps {
  firmId: number;
  userId: number;
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ firmId, userId }) => {
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [selectedRiskTypes, setSelectedRiskTypes] = useState<string[]>([]);
  const [customRiskType, setCustomRiskType] = useState('');
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commonRiskTypes = [
    'Financial Risk', 'Legal Liability', 'Regulatory Risk', 'Operational Risk',
    'Reputational Risk', 'Credit Risk', 'Market Risk', 'Liquidity Risk',
    'Cybersecurity Risk', 'Data Privacy Risk', 'Intellectual Property Risk',
    'Contract Risk', 'Force Majeure', 'Environmental Risk'
  ];

  const handleRiskTypeChange = (riskType: string, checked: boolean) => {
    if (checked) {
      setSelectedRiskTypes([...selectedRiskTypes, riskType]);
    } else {
      setSelectedRiskTypes(selectedRiskTypes.filter(r => r !== riskType));
    }
  };

  const addCustomRiskType = () => {
    if (customRiskType.trim() && !selectedRiskTypes.includes(customRiskType.trim())) {
      setSelectedRiskTypes([...selectedRiskTypes, customRiskType.trim()]);
      setCustomRiskType('');
    }
  };

  const handleRiskAssessment = async () => {
    if (!selectedDocument) {
      setError('Please select a document to assess');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await llmApi.getRiskAssessment(
        firmId, 
        userId, 
        selectedDocument, 
        selectedRiskTypes.length > 0 ? selectedRiskTypes : undefined,
        userQuery
      );
      setRiskAssessment(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform risk assessment');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
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

  const renderRiskMatrix = (risks: any[]) => {
    if (!risks || risks.length === 0) return null;

    const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
    const probability = ['Low', 'Medium', 'High'];

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-xs font-medium">Probability</div>
            {riskLevels.map(level => (
              <div key={level} className="text-xs font-medium text-center">{level}</div>
            ))}
            
            {probability.map(prob => (
              <React.Fragment key={prob}>
                <div className="text-xs font-medium">{prob}</div>
                {riskLevels.map(impact => {
                  const risksInCell = risks.filter(r => 
                    r.probability?.toLowerCase() === prob.toLowerCase() && 
                    r.impact?.toLowerCase() === impact.toLowerCase()
                  );
                  return (
                    <div key={`${prob}-${impact}`} 
                         className={`p-2 border rounded text-xs min-h-[60px] ${
                           risksInCell.length > 0 ? getRiskLevelColor(impact).bg : 'bg-gray-50'
                         }`}>
                      {risksInCell.map((risk, idx) => (
                        <div key={idx} className="truncate">{risk.type}</div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRiskDetails = (risks: any[]) => {
    if (!risks || risks.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {risks.map((risk, index) => {
              const colorConfig = getRiskLevelColor(risk.level || risk.severity || 'medium');
              return (
                <div key={index} className={`border rounded-lg p-4 ${colorConfig.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{risk.type}</h4>
                    <Badge variant={colorConfig.badge as any}>
                      {risk.level || risk.severity || 'Medium'} Risk
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    {risk.probability && (
                      <div>
                        <span className="text-xs font-medium">Probability:</span>
                        <div className="text-sm">{risk.probability}</div>
                      </div>
                    )}
                    {risk.impact && (
                      <div>
                        <span className="text-xs font-medium">Impact:</span>
                        <div className="text-sm">{risk.impact}</div>
                      </div>
                    )}
                    {risk.timeline && (
                      <div>
                        <span className="text-xs font-medium">Timeline:</span>
                        <div className="text-sm">{risk.timeline}</div>
                      </div>
                    )}
                  </div>

                  {risk.potential_consequences && (
                    <div className="mb-3">
                      <span className="text-xs font-medium">Potential Consequences:</span>
                      <p className="text-sm mt-1">{risk.potential_consequences}</p>
                    </div>
                  )}

                  {risk.mitigation_strategies && risk.mitigation_strategies.length > 0 && (
                    <div>
                      <span className="text-xs font-medium">Mitigation Strategies:</span>
                      <ul className="mt-1 space-y-1">
                        {risk.mitigation_strategies.map((strategy: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {strategy}
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

  const renderRiskSummary = (summary: any) => {
    if (!summary) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Risk Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">
                {summary.high_risk_count || 0}
              </div>
              <div className="text-sm text-red-700">High Risk Issues</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">
                {summary.medium_risk_count || 0}
              </div>
              <div className="text-sm text-yellow-700">Medium Risk Issues</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {summary.low_risk_count || 0}
              </div>
              <div className="text-sm text-green-700">Low Risk Issues</div>
            </div>
          </div>

          {summary.overall_risk_level && (
            <div className="text-center">
              <span className="text-sm text-gray-600">Overall Risk Level: </span>
              <Badge variant={getRiskLevelColor(summary.overall_risk_level).badge as any}>
                {summary.overall_risk_level}
              </Badge>
            </div>
          )}

          {summary.description && (
            <p className="text-sm mt-4 leading-relaxed">{summary.description}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
          <p className="text-sm text-gray-600">
            Legal risk identification and mitigation strategies
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
              Risk Types to Assess
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {commonRiskTypes.map((riskType) => (
                <div key={riskType} className="flex items-center space-x-2">
                  <Checkbox
                    id={riskType}
                    checked={selectedRiskTypes.includes(riskType)}
                    onCheckedChange={(checked) => handleRiskTypeChange(riskType, checked as boolean)}
                  />
                  <label htmlFor={riskType} className="text-sm">
                    {riskType}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom risk type"
                value={customRiskType}
                onChange={(e) => setCustomRiskType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomRiskType()}
              />
              <Button variant="outline" onClick={addCustomRiskType}>
                Add
              </Button>
            </div>

            {selectedRiskTypes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedRiskTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="cursor-pointer"
                         onClick={() => handleRiskTypeChange(type, false)}>
                    {type} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Risk Assessment Focus (optional)
            </label>
            <Textarea
              placeholder="What specific risk areas would you like to focus on?"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleRiskAssessment} 
            disabled={loading || !selectedDocument}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Assessing Risks...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Assess Risks
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

      {riskAssessment && (
        <div className="space-y-4">
          {/* Risk Summary */}
          {renderRiskSummary(riskAssessment.summary)}

          {/* Risk Matrix */}
          {renderRiskMatrix(riskAssessment.risks)}

          {/* Risk Details */}
          {renderRiskDetails(riskAssessment.risks)}

          {/* Recommendations */}
          {riskAssessment.recommendations && riskAssessment.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Risk Mitigation Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {riskAssessment.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
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

export default RiskAssessment;
