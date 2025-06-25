import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Clock, TrendingUp, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import llmApi from '@/lib/llmApi';

interface CaseStrategyProps {
  firmId: number;
  userId: number;
}

const CaseStrategy: React.FC<CaseStrategyProps> = ({ firmId, userId }) => {
  const [caseId, setCaseId] = useState<number | null>(null);
  const [strategyType, setStrategyType] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [caseStrategy, setCaseStrategy] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strategyTypes = [
    'Litigation Strategy', 'Settlement Strategy', 'Discovery Strategy', 'Motion Strategy',
    'Trial Strategy', 'Appeal Strategy', 'Negotiation Strategy', 'Risk Assessment',
    'Case Positioning', 'Damages Analysis', 'Witness Strategy', 'Evidence Strategy'
  ];

  const handleGenerateStrategy = async () => {
    if (!caseId) {
      setError('Please enter a case ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await llmApi.getCaseStrategy(
        firmId, 
        userId, 
        caseId,
        strategyType || undefined,
        userQuery
      );
      setCaseStrategy(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate case strategy');
    } finally {
      setLoading(false);
    }
  };

  const renderStrategySummary = (summary: any) => {
    if (!summary) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strategic Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.case_assessment && (
              <div>
                <h4 className="font-semibold mb-2">Case Assessment</h4>
                <p className="text-sm leading-relaxed">{summary.case_assessment}</p>
              </div>
            )}

            {summary.primary_objectives && summary.primary_objectives.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Primary Objectives</h4>
                <ul className="space-y-1">
                  {summary.primary_objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.recommended_approach && (
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-semibold mb-2">Recommended Approach</h4>
                <p className="text-sm">{summary.recommended_approach}</p>
              </div>
            )}

            {summary.success_probability && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {summary.success_probability}%
                  </div>
                  <div className="text-sm text-green-700">Success Probability</div>
                </div>
                {summary.estimated_duration && (
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {summary.estimated_duration}
                    </div>
                    <div className="text-sm text-blue-700">Est. Duration</div>
                  </div>
                )}
                {summary.estimated_cost && (
                  <div className="text-center p-3 bg-yellow-50 rounded">
                    <div className="text-2xl font-bold text-yellow-600">
                      {summary.estimated_cost}
                    </div>
                    <div className="text-sm text-yellow-700">Est. Cost</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStrengthsWeaknesses = (analysis: any) => {
    if (!analysis) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Strengths */}
        {analysis.strengths && analysis.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Case Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.strengths.map((strength: any, index: number) => (
                  <li key={index} className="border rounded p-3 bg-green-50">
                    <div className="font-medium">{strength.title || strength}</div>
                    {strength.description && (
                      <p className="text-sm text-gray-600 mt-1">{strength.description}</p>
                    )}
                    {strength.impact && (
                      <div className="mt-2">
                        <Badge variant="secondary">Impact: {strength.impact}</Badge>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Weaknesses */}
        {analysis.weaknesses && analysis.weaknesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Case Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.weaknesses.map((weakness: any, index: number) => (
                  <li key={index} className="border rounded p-3 bg-red-50">
                    <div className="font-medium">{weakness.title || weakness}</div>
                    {weakness.description && (
                      <p className="text-sm text-gray-600 mt-1">{weakness.description}</p>
                    )}
                    {weakness.mitigation && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <strong>Mitigation:</strong> {weakness.mitigation}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderActionPlan = (actionPlan: any[]) => {
    if (!actionPlan || actionPlan.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Strategic Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actionPlan.map((phase: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{phase.phase || `Phase ${index + 1}`}</h4>
                  <div className="flex gap-2">
                    {phase.priority && (
                      <Badge variant={phase.priority === 'high' ? 'destructive' : 
                                    phase.priority === 'medium' ? 'default' : 'secondary'}>
                        {phase.priority} priority
                      </Badge>
                    )}
                    {phase.timeline && (
                      <Badge variant="outline">{phase.timeline}</Badge>
                    )}
                  </div>
                </div>

                {phase.description && (
                  <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                )}

                {phase.actions && phase.actions.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Actions:</h5>
                    <ul className="space-y-1">
                      {phase.actions.map((action: string, actionIndex: number) => (
                        <li key={actionIndex} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span className="text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {phase.deliverables && phase.deliverables.length > 0 && (
                  <div className="mt-3">
                    <h5 className="font-medium mb-2">Expected Deliverables:</h5>
                    <div className="flex flex-wrap gap-1">
                      {phase.deliverables.map((deliverable: string, delIndex: number) => (
                        <Badge key={delIndex} variant="outline">{deliverable}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {phase.resources_needed && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                    <strong>Resources Needed:</strong> {phase.resources_needed}
                  </div>
                )}
              </div>
            ))}
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
            <AlertTriangle className="h-5 w-5" />
            Strategic Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {risks.map((risk: any, index: number) => (
              <div key={index} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{risk.type}</h5>
                  <Badge variant={risk.level === 'high' ? 'destructive' : 
                                 risk.level === 'medium' ? 'default' : 'secondary'}>
                    {risk.level} risk
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                {risk.impact && (
                  <div className="text-sm mb-2">
                    <strong>Potential Impact:</strong> {risk.impact}
                  </div>
                )}
                {risk.mitigation_strategy && (
                  <div className="text-sm p-2 bg-blue-50 rounded">
                    <strong>Mitigation Strategy:</strong> {risk.mitigation_strategy}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOpposingStrategy = (opposing: any) => {
    if (!opposing) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Opposing Party Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {opposing.likely_strategy && (
              <div>
                <h5 className="font-medium mb-2">Likely Opposing Strategy</h5>
                <p className="text-sm">{opposing.likely_strategy}</p>
              </div>
            )}

            {opposing.strengths && opposing.strengths.length > 0 && (
              <div>
                <h5 className="font-medium mb-2">Opposing Strengths</h5>
                <ul className="space-y-1">
                  {opposing.strengths.map((strength: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {opposing.weaknesses && opposing.weaknesses.length > 0 && (
              <div>
                <h5 className="font-medium mb-2">Opposing Weaknesses</h5>
                <ul className="space-y-1">
                  {opposing.weaknesses.map((weakness: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {opposing.counter_strategies && opposing.counter_strategies.length > 0 && (
              <div className="bg-blue-50 p-3 rounded">
                <h5 className="font-medium mb-2">Counter-Strategies</h5>
                <ul className="space-y-1">
                  {opposing.counter_strategies.map((strategy: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {strategy}
                    </li>
                  ))}
                </ul>
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
          <CardTitle>Case Strategy</CardTitle>
          <p className="text-sm text-gray-600">
            Strategic case analysis and planning assistance
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Case ID</label>
            <Input
              type="number"
              placeholder="Enter case ID"
              value={caseId || ''}
              onChange={(e) => setCaseId(e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Strategy Type (optional)</label>
            <Select value={strategyType} onValueChange={setStrategyType}>
              <SelectTrigger>
                <SelectValue placeholder="Select strategy type" />
              </SelectTrigger>
              <SelectContent>
                {strategyTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Strategic Focus (optional)
            </label>
            <Textarea
              placeholder="What specific strategic aspects would you like to focus on? (e.g., settlement vs litigation, specific legal theories, timeline considerations)"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerateStrategy} 
            disabled={loading || !caseId}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Generating Strategy...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Generate Strategy
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

      {caseStrategy && (
        <div className="space-y-4">
          {/* Strategic Summary */}
          {renderStrategySummary(caseStrategy.summary)}

          {/* Strengths & Weaknesses */}
          {renderStrengthsWeaknesses(caseStrategy.analysis)}

          {/* Action Plan */}
          {renderActionPlan(caseStrategy.action_plan)}

          {/* Risk Analysis */}
          {renderRiskAnalysis(caseStrategy.risks)}

          {/* Opposing Party Analysis */}
          {renderOpposingStrategy(caseStrategy.opposing_party)}

          {/* Recommendations */}
          {caseStrategy.recommendations && caseStrategy.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Strategic Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {caseStrategy.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
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

export default CaseStrategy;
