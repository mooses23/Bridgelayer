// src/app/firmsync/[tenantId]/cases/components/CaseListPanel.tsx
// Sidebar listing of cases with filters and CTA

'use client';

import type { CaseRecord, CaseStatus } from '../hooks/useCases';

type CaseFilterStatus = CaseStatus | 'all';

interface CaseListPanelProps {
  cases: CaseRecord[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: CaseFilterStatus;
  onStatusChange: (value: CaseFilterStatus) => void;
  previewMode: boolean;
  onCreateCase: () => void;
}

export function CaseListPanel({
  cases,
  selectedCaseId,
  onSelectCase,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  previewMode,
  onCreateCase,
}: CaseListPanelProps) {
  return (
    <aside className="bg-white border border-gray-200 rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Case Files</h3>
          <p className="text-sm text-gray-500">{cases.length} records</p>
        </div>
        <button
          onClick={onCreateCase}
          disabled={previewMode}
          className={`px-3 py-1.5 text-sm rounded-md font-medium ${
            previewMode
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          + New
        </button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search cases, clients..."
            className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value as CaseFilterStatus)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="intake">Intake</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="on_hold">On Hold</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="mt-4 space-y-3 overflow-y-auto">
        {cases.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-8">
            No cases match this filter
          </div>
        ) : (
          cases.map((caseRecord) => {
            const completion = caseRecord.tasks_total ? Math.round(((caseRecord.tasks_completed ?? 0) / caseRecord.tasks_total) * 100) : 0;

            return (
              <button
                key={caseRecord.id}
                onClick={() => onSelectCase(caseRecord.id)}
                className={`w-full text-left border rounded-lg p-3 transition-colors ${
                  selectedCaseId === caseRecord.id
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 truncate">{caseRecord.title}</p>
                  <span className="text-xs text-gray-500">{caseRecord.case_number}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{caseRecord.client_name}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span className="capitalize">{caseRecord.status.replace('_', ' ')}</span>
                  <span>{completion}% tasks</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
