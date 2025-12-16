// src/app/firmsync/[tenantId]/paralegal-plus/components/DocumentGeneratorTab.tsx
// AI-powered legal document generation with filters

'use client';

import { FilterDropdown } from './FilterDropdown';
import type { DocumentFilters } from '../hooks/useParalegalFeatures';

interface DocumentGeneratorTabProps {
  filters: DocumentFilters;
  onFilterChange: (key: keyof DocumentFilters, value: string) => void;
  legalTypes: { value: string; label: string }[];
  locations: { value: string; label: string }[];
  docTypes: { value: string; label: string }[];
}

export function DocumentGeneratorTab({
  filters,
  onFilterChange,
  legalTypes,
  locations,
  docTypes,
}: DocumentGeneratorTabProps) {
  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FilterDropdown
            label="Legal Type"
            value={filters.legalType}
            options={legalTypes}
            onChange={(value) => onFilterChange('legalType', value)}
            placeholder="All Legal Types"
          />
          <FilterDropdown
            label="Location/Jurisdiction"
            value={filters.location}
            options={locations}
            onChange={(value) => onFilterChange('location', value)}
            placeholder="All Locations"
          />
          <FilterDropdown
            label="Document Type"
            value={filters.docType}
            options={docTypes}
            onChange={(value) => onFilterChange('docType', value)}
            placeholder="All Document Types"
          />
        </div>
      </div>

      {/* Document Generation Interface */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Generate Document</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            + New Document
          </button>
        </div>

        {/* Active Filters Display */}
        {(filters.legalType !== 'all' || filters.location !== 'all' || filters.docType !== 'all') && (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.legalType !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {legalTypes.find(t => t.value === filters.legalType)?.label}
              </span>
            )}
            {filters.location !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                {locations.find(l => l.value === filters.location)?.label}
              </span>
            )}
            {filters.docType !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                {docTypes.find(d => d.value === filters.docType)?.label}
              </span>
            )}
          </div>
        )}

        {/* Document Templates */}
        <div className="space-y-3">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Settlement Agreement Template</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Standard settlement agreement with customizable terms
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">Contracts</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">California</span>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Use Template
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Motion to Dismiss</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Pre-formatted motion with legal citations and arguments
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">Litigation</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">Federal</span>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Use Template
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Demand Letter</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Professional demand letter for payment or action
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">Letter</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">All Jurisdictions</span>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Use Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Interface */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Document Assistant</h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[200px]">
          <p className="text-sm text-gray-600">
            Ask me to generate any legal document. I can help with contracts, motions, briefs, and more.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Describe the document you need..."
            className="flex-1 border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
