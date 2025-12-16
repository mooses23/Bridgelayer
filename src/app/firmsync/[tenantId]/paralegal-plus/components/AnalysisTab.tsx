// src/app/firmsync/[tenantId]/paralegal-plus/components/AnalysisTab.tsx
// Legal analysis and strategy tools

'use client';

import { useState } from 'react';

interface AnalysisTabProps {
  tenantId: string;
  previewMode?: boolean;
}

type AnalysisType = 'case-strength' | 'risk-assessment' | 'timeline' | 'cost-benefit';

export function AnalysisTab({ tenantId, previewMode = false }: AnalysisTabProps) {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('case-strength');
  const [caseDetails, setCaseDetails] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analysisTypes = [
    {
      type: 'case-strength' as const,
      label: 'Case Strength',
      icon: '💪',
      description: 'Evaluate likelihood of success',
    },
    {
      type: 'risk-assessment' as const,
      label: 'Risk Assessment',
      icon: '⚠️',
      description: 'Identify potential risks and exposures',
    },
    {
      type: 'timeline' as const,
      label: 'Timeline Analysis',
      icon: '📅',
      description: 'Project case timeline and milestones',
    },
    {
      type: 'cost-benefit' as const,
      label: 'Cost-Benefit',
      icon: '💰',
      description: 'Analyze financial considerations',
    },
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewMode || !caseDetails.trim()) return;

    setIsAnalyzing(true);

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock analysis results
    const mockResults = {
      'case-strength': {
        overallScore: 75,
        strengths: [
          'Strong documentary evidence supporting plaintiff\'s claims',
          'Favorable precedent in jurisdiction',
          'Credible witnesses with consistent testimony',
        ],
        weaknesses: [
          'Statute of limitations concerns on one count',
          'Defendant has significant financial resources for litigation',
          'Some factual disputes requiring expert testimony',
        ],
        recommendation: 'The case has good prospects for success, particularly on the primary claims. Consider settlement negotiations while maintaining litigation readiness.',
      },
      'risk-assessment': {
        riskLevel: 'Medium',
        risks: [
          {
            category: 'Legal',
            description: 'Potential counterclaims from defendant',
            severity: 'High',
            mitigation: 'Prepare defensive strategy and gather supporting evidence',
          },
          {
            category: 'Financial',
            description: 'Extended litigation costs if case goes to trial',
            severity: 'Medium',
            mitigation: 'Consider cost-sharing arrangements or litigation funding',
          },
          {
            category: 'Reputational',
            description: 'Public nature of proceedings may affect client',
            severity: 'Low',
            mitigation: 'Media strategy and protective orders as needed',
          },
        ],
      },
      'timeline': {
        estimatedDuration: '18-24 months',
        phases: [
          { phase: 'Filing & Service', duration: '1-2 months', status: 'upcoming' },
          { phase: 'Discovery', duration: '6-8 months', status: 'upcoming' },
          { phase: 'Motion Practice', duration: '3-4 months', status: 'upcoming' },
          { phase: 'Trial Preparation', duration: '3-4 months', status: 'upcoming' },
          { phase: 'Trial', duration: '2-3 weeks', status: 'upcoming' },
          { phase: 'Post-Trial Motions', duration: '2-3 months', status: 'upcoming' },
        ],
      },
      'cost-benefit': {
        estimatedCosts: {
          attorneyFees: '$150,000 - $250,000',
          expertWitnesses: '$25,000 - $50,000',
          courtCosts: '$5,000 - $10,000',
          total: '$180,000 - $310,000',
        },
        potentialRecovery: {
          damages: '$500,000 - $1,000,000',
          probability: '70%',
          expectedValue: '$350,000 - $700,000',
        },
        recommendation: 'Expected value exceeds estimated costs. Litigation is economically justified, but settlement in the $400,000-$600,000 range would be favorable.',
      },
    };

    setAnalysisResult(mockResults[analysisType]);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      {/* Analysis Type Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Legal Analysis</h2>
        <p className="text-gray-600 mb-6">
          Use AI to analyze case strength, assess risks, project timelines, and evaluate costs
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {analysisTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => {
                setAnalysisType(type.type);
                setAnalysisResult(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                analysisType === type.type
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={previewMode}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="font-semibold text-sm text-gray-900">{type.label}</div>
              <div className="text-xs text-gray-500 mt-1">{type.description}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label htmlFor="case-details" className="block text-sm font-medium text-gray-700 mb-2">
              Case Details
            </label>
            <textarea
              id="case-details"
              rows={6}
              value={caseDetails}
              onChange={(e) => setCaseDetails(e.target.value)}
              placeholder="Provide relevant case details, facts, legal issues, and any specific concerns..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={previewMode || isAnalyzing}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={previewMode || !caseDetails.trim() || isAnalyzing}
              className={`px-6 py-2 rounded-md font-medium ${
                previewMode || !caseDetails.trim() || isAnalyzing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Run Analysis'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>

          {analysisType === 'case-strength' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="font-medium text-gray-900">Overall Case Strength</span>
                <div className="flex items-center">
                  <div className="w-32 h-4 bg-gray-200 rounded-full mr-3">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${analysisResult.overallScore}%` }}
                    ></div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{analysisResult.overallScore}%</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Strengths</h4>
                <ul className="space-y-2">
                  {analysisResult.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Weaknesses</h4>
                <ul className="space-y-2">
                  {analysisResult.weaknesses.map((weakness: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-amber-600 mr-2">⚠</span>
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Recommendation</h4>
                <p className="text-gray-700">{analysisResult.recommendation}</p>
              </div>
            </div>
          )}

          {analysisType === 'risk-assessment' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="font-semibold text-gray-900">Overall Risk Level: </span>
                <span className="text-amber-700 font-medium">{analysisResult.riskLevel}</span>
              </div>

              <div className="space-y-3">
                {analysisResult.risks.map((risk: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{risk.category} Risk</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          risk.severity === 'High'
                            ? 'bg-red-100 text-red-800'
                            : risk.severity === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {risk.severity}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{risk.description}</p>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">Mitigation: </span>
                      <span className="text-gray-600">{risk.mitigation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisType === 'timeline' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <span className="font-semibold text-gray-900">Estimated Duration: </span>
                <span className="text-blue-700 font-medium">{analysisResult.estimatedDuration}</span>
              </div>

              <div className="space-y-3">
                {analysisResult.phases.map((phase: any, index: number) => (
                  <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{phase.phase}</p>
                      <p className="text-sm text-gray-600">{phase.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisType === 'cost-benefit' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Estimated Costs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attorney Fees:</span>
                      <span className="font-medium">{analysisResult.estimatedCosts.attorneyFees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expert Witnesses:</span>
                      <span className="font-medium">{analysisResult.estimatedCosts.expertWitnesses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Court Costs:</span>
                      <span className="font-medium">{analysisResult.estimatedCosts.courtCosts}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-semibold text-red-600">{analysisResult.estimatedCosts.total}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Potential Recovery</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Damages:</span>
                      <span className="font-medium">{analysisResult.potentialRecovery.damages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Probability:</span>
                      <span className="font-medium">{analysisResult.potentialRecovery.probability}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Expected Value:</span>
                      <span className="font-semibold text-green-600">{analysisResult.potentialRecovery.expectedValue}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Recommendation</h4>
                <p className="text-gray-700">{analysisResult.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
