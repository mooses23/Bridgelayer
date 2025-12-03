// src/app/firmsync/tenant/[tenantId]/clients/components/LinkedCasesList.tsx
// List of cases linked to the client with AI recommendations

'use client';

import { useState } from 'react';

interface LinkedCase {
  id: string;
  case_number: string;
  title: string;
  case_type: string;
  status: 'open' | 'closed' | 'pending' | 'archived';
  created_at: string;
  last_activity: string;
  attorney_assigned?: string;
  next_deadline?: string;
  ai_risk_score?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface LinkedCasesListProps {
  clientId: string;
  cases: LinkedCase[];
  onCaseClick: (caseId: string) => void;
  aiRecommendationsEnabled?: boolean;
}

export function LinkedCasesList({ 
  clientId, 
  cases, 
  onCaseClick, 
  aiRecommendationsEnabled = false 
}: LinkedCasesListProps) {
  const [showRecommendations, setShowRecommendations] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Mock AI recommendations
  const aiRecommendations = [
    {
      type: 'deadline_alert',
      message: 'Discovery deadline approaching in Case #2024-001 (3 days)',
      urgency: 'high' as const
    },
    {
      type: 'similar_case',
      message: 'Similar case pattern detected - consider precedent from Case #2023-445',
      urgency: 'medium' as const
    },
    {
      type: 'resource_optimization',
      message: 'Cases #2024-001 and #2024-003 could benefit from coordinated strategy',
      urgency: 'low' as const
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Linked Cases</h3>
          <p className="text-sm text-gray-600 mt-1">
            {cases.length} {cases.length === 1 ? 'case' : 'cases'} associated with this client
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {aiRecommendationsEnabled && (
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className={`text-sm font-medium px-3 py-1.5 rounded-md border transition-colors ${
                showRecommendations
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              AI Insights
            </button>
          )}
          
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-200 rounded-md hover:bg-blue-50">
            + New Case
          </button>
        </div>
      </div>

      {/* AI Recommendations Panel */}
      {aiRecommendationsEnabled && showRecommendations && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            AI Case Recommendations
          </h4>
          <div className="space-y-2">
            {aiRecommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-md border text-sm ${
                  rec.urgency === 'high'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : rec.urgency === 'medium'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : 'bg-green-50 border-green-200 text-green-800'
                }`}
              >
                <div className="flex items-start">
                  <span className={`inline-block w-2 h-2 rounded-full mt-1.5 mr-2 ${
                    rec.urgency === 'high' ? 'bg-red-400' : 
                    rec.urgency === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} />
                  {rec.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-2">No cases linked to this client yet</p>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Create first case
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((case_) => (
            <div
              key={case_.id}
              onClick={() => onCaseClick(case_.id)}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{case_.title}</h4>
                    <span className="text-sm text-gray-500">#{case_.case_number}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(case_.status)}`}>
                      {case_.status.charAt(0).toUpperCase() + case_.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span>Type: {case_.case_type}</span>
                    {case_.attorney_assigned && (
                      <span>Attorney: {case_.attorney_assigned}</span>
                    )}
                    <span>Created: {new Date(case_.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(case_.priority)}`}>
                      {case_.priority.charAt(0).toUpperCase() + case_.priority.slice(1)} Priority
                    </span>
                    
                    {case_.next_deadline && (
                      <span className="text-xs text-gray-500">
                        Next deadline: {new Date(case_.next_deadline).toLocaleDateString()}
                      </span>
                    )}

                    {case_.ai_risk_score !== undefined && aiRecommendationsEnabled && (
                      <span className={`text-xs font-medium ${getRiskScoreColor(case_.ai_risk_score)}`}>
                        Risk Score: {case_.ai_risk_score}/100
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {case_.priority === 'critical' && (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {cases.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Last activity: {cases[0]?.last_activity ? new Date(cases[0].last_activity).toLocaleDateString() : 'N/A'}
            </span>
            <div className="flex space-x-3">
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                View All Cases
              </button>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
