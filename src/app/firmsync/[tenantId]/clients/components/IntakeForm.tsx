// src/app/firmsync/tenant/[tenantId]/clients/components/IntakeForm.tsx
// Client intake form with AI-powered analysis

'use client';

import { useState } from 'react';

interface IntakeFormData {
  legal_issue: string;
  case_type: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  budget_range: string;
  preferred_contact: 'email' | 'phone' | 'in_person';
  additional_notes: string;
  documents_attached: boolean;
}

interface IntakeFormProps {
  clientId: string;
  onSubmit: (data: IntakeFormData) => void;
  aiAnalysisEnabled?: boolean;
}

export function IntakeForm({ clientId, onSubmit, aiAnalysisEnabled = false }: IntakeFormProps) {
  const [formData, setFormData] = useState<IntakeFormData>({
    legal_issue: '',
    case_type: '',
    urgency: 'medium',
    budget_range: '',
    preferred_contact: 'email',
    additional_notes: '',
    documents_attached: false,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    recommended_case_type?: string;
    urgency_assessment?: string;
    next_steps?: string[];
    estimated_timeline?: string;
  } | null>(null);

  const handleInputChange = <K extends keyof IntakeFormData>(field: K, value: IntakeFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Trigger AI analysis on key fields if enabled
    if (aiAnalysisEnabled && (field === 'legal_issue' || field === 'additional_notes')) {
      debounceAiAnalysis();
    }
  };

  const debounceAiAnalysis = () => {
    // TODO: Implement debounced AI analysis
    // This would call an AI service to analyze the intake and provide suggestions
    setIsAnalyzing(true);
    setTimeout(() => {
      setAiSuggestions({
        recommended_case_type: 'Personal Injury',
        urgency_assessment: 'Medium priority - statute of limitations allows time for preparation',
        next_steps: [
          'Schedule initial consultation',
          'Request medical records',
          'Contact insurance companies',
          'Document incident details'
        ],
        estimated_timeline: '3-6 months'
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getUrgencyColor = (urgency: IntakeFormData['urgency']) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6" data-client-id={clientId}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Client Intake Form</h3>
        <p className="text-sm text-gray-600 mt-1">
          Gather essential information about the client&apos;s legal needs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Legal Issue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Legal Issue *
          </label>
          <textarea
            value={formData.legal_issue}
            onChange={(e) => handleInputChange('legal_issue', e.target.value)}
            placeholder="Describe the legal issue or situation..."
            rows={4}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Case Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Case Type</label>
            <select
              value={formData.case_type}
              onChange={(e) => handleInputChange('case_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select case type</option>
              <option value="personal_injury">Personal Injury</option>
              <option value="family_law">Family Law</option>
              <option value="criminal_defense">Criminal Defense</option>
              <option value="business_law">Business Law</option>
              <option value="real_estate">Real Estate</option>
              <option value="estate_planning">Estate Planning</option>
              <option value="employment">Employment Law</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
            <select
              value={formData.urgency}
              onChange={(e) => handleInputChange('urgency', e.target.value as IntakeFormData['urgency'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <div className={`mt-2 inline-flex items-center px-3 py-1 text-xs font-medium border rounded-full ${getUrgencyColor(formData.urgency)}`}>
              Current urgency: {formData.urgency}
            </div>
          </div>
        </div>

        {/* Budget & Contact Preference */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
            <select
              value={formData.budget_range}
              onChange={(e) => handleInputChange('budget_range', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select budget range</option>
              <option value="under_1k">Under $1,000</option>
              <option value="1k_5k">$1,000 - $5,000</option>
              <option value="5k_10k">$5,000 - $10,000</option>
              <option value="10k_25k">$10,000 - $25,000</option>
              <option value="25k_plus">$25,000+</option>
              <option value="contingency">Contingency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact</label>
            <select
              value={formData.preferred_contact}
              onChange={(e) => handleInputChange('preferred_contact', e.target.value as IntakeFormData['preferred_contact'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="in_person">In Person</option>
            </select>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.additional_notes}
            onChange={(e) => handleInputChange('additional_notes', e.target.value)}
            placeholder="Any additional details, timeline considerations, or special circumstances..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Documents Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="documents_attached"
            checked={formData.documents_attached}
            onChange={(e) => handleInputChange('documents_attached', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="documents_attached" className="ml-2 text-sm text-gray-700">
            Client has documents to upload related to this matter
          </label>
        </div>

        {/* AI Analysis Section */}
        {aiAnalysisEnabled && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              AI Analysis
              {isAnalyzing && (
                <div className="ml-2 animate-spin">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm6 14a6 6 0 110-12 6 6 0 010 12z" />
                  </svg>
                </div>
              )}
            </h4>

            {aiSuggestions ? (
              <div className="space-y-3">
                {aiSuggestions.recommended_case_type && (
                  <div>
                    <span className="text-xs font-medium text-blue-800">Recommended Case Type:</span>
                    <p className="text-sm text-blue-700">{aiSuggestions.recommended_case_type}</p>
                  </div>
                )}
                
                {aiSuggestions.urgency_assessment && (
                  <div>
                    <span className="text-xs font-medium text-blue-800">Urgency Assessment:</span>
                    <p className="text-sm text-blue-700">{aiSuggestions.urgency_assessment}</p>
                  </div>
                )}

                {aiSuggestions.next_steps && (
                  <div>
                    <span className="text-xs font-medium text-blue-800">Suggested Next Steps:</span>
                    <ul className="text-sm text-blue-700 list-disc list-inside mt-1">
                      {aiSuggestions.next_steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSuggestions.estimated_timeline && (
                  <div>
                    <span className="text-xs font-medium text-blue-800">Estimated Timeline:</span>
                    <p className="text-sm text-blue-700">{aiSuggestions.estimated_timeline}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-blue-700">
                {isAnalyzing ? 'Analyzing intake information...' : 'Complete the form to see AI-powered suggestions'}
              </p>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            Submit Intake Form
          </button>
        </div>
      </form>
    </div>
  );
}
