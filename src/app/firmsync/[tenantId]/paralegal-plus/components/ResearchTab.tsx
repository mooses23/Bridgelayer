// src/app/firmsync/[tenantId]/paralegal-plus/components/ResearchTab.tsx
// Legal research and case law analysis

'use client';

import { useState } from 'react';

interface ResearchTabProps {
  tenantId: string;
  previewMode?: boolean;
}

export function ResearchTab({ tenantId, previewMode = false }: ResearchTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    title: string;
    citation: string;
    jurisdiction: string;
    date: string;
    relevance: number;
    summary: string;
  }>>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewMode || !searchQuery.trim()) return;

    // Mock search results - in production, this would call an AI research API
    const mockResults = [
      {
        id: '1',
        title: 'Smith v. Johnson',
        citation: '123 F.3d 456 (9th Cir. 2023)',
        jurisdiction: '9th Circuit',
        date: '2023-05-15',
        relevance: 95,
        summary: 'Establishes precedent for contract interpretation in commercial disputes involving third-party beneficiaries.',
      },
      {
        id: '2',
        title: 'Brown v. Board of Commerce',
        citation: '456 F.Supp.3d 789 (S.D.N.Y. 2023)',
        jurisdiction: 'S.D.N.Y.',
        date: '2023-03-22',
        relevance: 88,
        summary: 'Addresses the standards for preliminary injunctions in business tort cases.',
      },
      {
        id: '3',
        title: 'Davis Corp. v. Wilson LLC',
        citation: '789 F.3d 234 (2nd Cir. 2022)',
        jurisdiction: '2nd Circuit',
        date: '2022-11-10',
        relevance: 82,
        summary: 'Clarifies the application of the business judgment rule in corporate governance disputes.',
      },
    ];

    setSearchResults(mockResults);
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Legal Research</h2>
        <p className="text-gray-600 mb-6">
          Search case law, statutes, and legal precedents using AI-powered research tools
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="research-query" className="block text-sm font-medium text-gray-700 mb-2">
              Research Query
            </label>
            <textarea
              id="research-query"
              rows={3}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your legal research query (e.g., 'contract law third party beneficiary rights')"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={previewMode}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={previewMode || !searchQuery.trim()}
              className={`px-6 py-2 rounded-md font-medium ${
                previewMode || !searchQuery.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Search Cases
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Search Results ({searchResults.length})
          </h3>

          <div className="space-y-4">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{result.title}</h4>
                    <p className="text-sm text-gray-600">{result.citation}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.relevance >= 90
                          ? 'bg-green-100 text-green-800'
                          : result.relevance >= 80
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {result.relevance}% relevant
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span>📍 {result.jurisdiction}</span>
                  <span>📅 {new Date(result.date).toLocaleDateString()}</span>
                </div>

                <p className="text-gray-700 text-sm">{result.summary}</p>

                <div className="mt-3 flex space-x-3">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View Full Case
                  </button>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Add to Brief
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                    Save for Later
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Research Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-blue-600 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Case Summaries</h4>
          <p className="text-sm text-gray-600">AI-generated case summaries and key holdings</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-blue-600 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Statute Lookup</h4>
          <p className="text-sm text-gray-600">Search federal and state statutes</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-blue-600 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Shepardize</h4>
          <p className="text-sm text-gray-600">Check case validity and citation history</p>
        </div>
      </div>
    </div>
  );
}
