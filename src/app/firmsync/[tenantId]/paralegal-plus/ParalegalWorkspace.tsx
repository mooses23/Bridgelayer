// src/app/firmsync/[tenantId]/paralegal-plus/ParalegalWorkspace.tsx
// AI-powered paralegal assistance workspace with 4 tabs

'use client';

import { useState } from 'react';
import { useParalegalFeatures } from './hooks/useParalegalFeatures';
import { DocumentGeneratorTab } from './components/DocumentGeneratorTab';
import { DocumentReviewTab } from './components/DocumentReviewTab';
import { ResearchTab } from './components/ResearchTab';
import { AnalysisTab } from './components/AnalysisTab';

type TabType = 'research' | 'drafting' | 'analysis' | 'review';

export function ParalegalWorkspace() {
  const [activeTab, setActiveTab] = useState<TabType>('drafting');
  const {
    filters,
    updateFilter,
    resetFilters,
    legalTypes,
    locations,
    docTypes,
  } = useParalegalFeatures();

  const tabs = [
    { id: 'research' as TabType, label: 'Research', icon: '📚' },
    { id: 'drafting' as TabType, label: 'Drafting', icon: '✍️' },
    { id: 'analysis' as TabType, label: 'Analysis', icon: '📊' },
    { id: 'review' as TabType, label: 'Document Review', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Paralegal+</h1>
          <p className="text-gray-600 mt-2">AI-powered legal assistance and document automation</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Filter Reset Button - Only show on tabs with filters */}
          {(activeTab === 'drafting' || activeTab === 'review') && 
           (filters.legalType !== 'all' || filters.location !== 'all' || filters.docType !== 'all') && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'research' && <ResearchTab />}
            
            {activeTab === 'drafting' && (
              <DocumentGeneratorTab
                filters={filters}
                onFilterChange={updateFilter}
                legalTypes={legalTypes}
                locations={locations}
                docTypes={docTypes}
              />
            )}
            
            {activeTab === 'analysis' && <AnalysisTab />}
            
            {activeTab === 'review' && (
              <DocumentReviewTab
                filters={filters}
                onFilterChange={updateFilter}
                legalTypes={legalTypes}
                locations={locations}
                docTypes={docTypes}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
