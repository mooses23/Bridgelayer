// src/app/firmsync/[tenantId]/paralegal-plus/components/DocumentReviewTab.tsx
// AI-powered document review and compliance checking with filters

'use client';

import { FilterDropdown } from './FilterDropdown';
import { DocumentCard } from './DocumentCard';
import { SAMPLE_REVIEWS, STATUS_STYLES, STATUS_LABELS } from './templates';
import type { DocumentFilters } from '../hooks/useParalegalFeatures';

interface DocumentReviewTabProps {
  filters: DocumentFilters;
  onFilterChange: (key: keyof DocumentFilters, value: string) => void;
  legalTypes: readonly { readonly value: string; readonly label: string }[];
  locations: readonly { readonly value: string; readonly label: string }[];
  docTypes: readonly { readonly value: string; readonly label: string }[];
}

export function DocumentReviewTab({
  filters,
  onFilterChange,
  legalTypes,
  locations,
  docTypes,
}: DocumentReviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Filters</h3>
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

      {/* Document Upload & Review Interface */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upload Document for Review</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            + Upload Document
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

        {/* Drag & Drop Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your document here, or click to browse
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports PDF, DOCX, TXT (Max 10MB)
          </p>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Document Reviews</h3>
        
        <div className="space-y-3">
          {SAMPLE_REVIEWS.map((review) => (
            <DocumentCard
              key={review.id}
              title={review.filename}
              description={review.description}
              tags={[
                { label: review.category, value: review.category },
                { label: review.jurisdiction, value: review.jurisdiction },
                { label: review.timestamp, value: review.timestamp }
              ]}
              statusBadge={{
                label: STATUS_LABELS[review.status],
                className: STATUS_STYLES[review.status]
              }}
              actionLabel={review.status === 'issues-found' ? 'View Issues' : 'View Report'}
              onAction={() => {
                // TODO: Implement view report/issues functionality
                console.log('View details for:', review.id);
              }}
            />
          ))}
        </div>
      </div>

      {/* AI Review Assistant */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Review Assistant</h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[200px]">
          <p className="text-sm text-gray-600">
            I can review your documents for compliance, risks, and legal issues. Upload a document or ask me questions about specific clauses.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about document compliance, risks, or specific clauses..."
            className="flex-1 border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            Ask AI
          </button>
        </div>
      </div>
    </div>
  );
}
