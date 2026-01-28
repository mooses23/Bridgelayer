// src/app/firmsync/[tenantId]/paralegal-plus/ParalegalWorkspace.tsx
// AI-powered paralegal assistance workspace with Research, Drafting, Analysis, and Document Review

'use client';

import { useState } from 'react';

import { ResearchTab } from './components/ResearchTab';
import { DraftingTab } from './components/DraftingTab';
import { AnalysisTab } from './components/AnalysisTab';
import { DocumentReviewTab } from './components/DocumentReviewTab';

interface ParalegalWorkspaceProps {
  tenantId: string;
  previewMode?: boolean;
}

type TabType = 'research' | 'drafting' | 'analysis' | 'document-review';

export default function ParalegalWorkspace({ tenantId, previewMode = false }: ParalegalWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>('research');

  const tabs = [
    { id: 'research' as const, label: 'Research', icon: '🔍' },
    { id: 'drafting' as const, label: 'Drafting', icon: '✍️' },
    { id: 'analysis' as const, label: 'Analysis', icon: '📊' },
    { id: 'document-review' as const, label: 'Document Review', icon: '📄' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <p className="text-sm text-gray-500">AI-Powered Legal Assistance</p>
            <h1 className="text-3xl font-semibold text-gray-900">Paralegal+</h1>
            <p className="text-gray-600">Research, drafting, analysis, and document review powered by AI</p>
            {previewMode && (
              <p className="text-sm text-amber-600 mt-2">Preview mode: AI features are read-only.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'research' && <ResearchTab tenantId={tenantId} previewMode={previewMode} />}
        {activeTab === 'drafting' && <DraftingTab tenantId={tenantId} previewMode={previewMode} />}
        {activeTab === 'analysis' && <AnalysisTab tenantId={tenantId} previewMode={previewMode} />}
        {activeTab === 'document-review' && <DocumentReviewTab tenantId={tenantId} previewMode={previewMode} />}
      </main>
    </div>
  );
}
