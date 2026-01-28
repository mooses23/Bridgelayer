// src/app/firmsync/[tenantId]/cases/components/CaseOverviewPanel.tsx
// Detail view for a single case, including metadata, tasks, and activity

'use client';

import type { CaseRecord, CaseStatus } from '../hooks/useCases';

interface CaseOverviewPanelProps {
  caseRecord: CaseRecord | null;
  previewMode: boolean;
  onStatusChange: (status: CaseStatus) => void;
}

const statusOptions: CaseStatus[] = ['intake', 'active', 'pending', 'on_hold', 'closed'];

export function CaseOverviewPanel({ caseRecord, previewMode, onStatusChange }: CaseOverviewPanelProps) {
  if (!caseRecord) {
    return (
      <section className="bg-white border border-dashed border-gray-300 rounded-xl h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Select a case</h3>
          <p className="text-sm text-gray-500">Choose a case from the sidebar to view matter details, documents, and AI insights.</p>
        </div>
      </section>
    );
  }

  const completion = caseRecord.tasks_total ? Math.round(((caseRecord.tasks_completed ?? 0) / caseRecord.tasks_total) * 100) : 0;

  const activityTimeline = [
    { label: 'Latest Filing', value: 'Motion to Compel', timestamp: '3 hours ago' },
    { label: 'Last Meeting', value: 'Strategy sync with client', timestamp: 'Yesterday' },
    { label: 'Upcoming Deadline', value: 'Discovery responses due', timestamp: 'Feb 12' },
  ];

  const tasks = [
    { label: 'Draft witness list', done: completion > 60 },
    { label: 'Upload expert report', done: completion > 30 },
    { label: 'Review opposing counsel motion', done: false },
  ];

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Case #{caseRecord.case_number}</p>
          <h2 className="text-2xl font-semibold text-gray-900">{caseRecord.title}</h2>
          <p className="text-sm text-gray-600">Client: {caseRecord.client_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={caseRecord.status}
            disabled={previewMode}
            onChange={(event) => onStatusChange(event.target.value as CaseStatus)}
            className={`px-3 py-1.5 rounded-md border text-sm ${previewMode ? 'bg-gray-100 text-gray-400' : 'bg-white border-gray-200'}`}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
          <span
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              caseRecord.priority === 'critical'
                ? 'bg-red-100 text-red-700'
                : caseRecord.priority === 'high'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {caseRecord.priority.charAt(0).toUpperCase() + caseRecord.priority.slice(1)} priority
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-gray-500">Lead Attorney</p>
          <p className="text-base font-semibold text-gray-900">{caseRecord.lead_attorney ?? 'Unassigned'}</p>
          <p className="text-sm text-gray-500 mt-4">Stage</p>
          <p className="text-base text-gray-900">{caseRecord.stage ?? 'Discovery'}</p>
          <p className="text-sm text-gray-500 mt-4">Opened</p>
          <p className="text-base text-gray-900">{new Date(caseRecord.opened_at).toLocaleDateString()}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-gray-500">Progress</p>
          <div className="mt-2">
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${completion}%` }} />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {caseRecord.tasks_completed ?? 0}/{caseRecord.tasks_total ?? 0} tasks complete
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-4">Upcoming deadlines</p>
          <p className="text-base text-gray-900">{caseRecord.deadlines_upcoming ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Tasks</h3>
            <button
              type="button"
              disabled={previewMode}
              className={`text-sm font-medium ${previewMode ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700'}`}
            >
              + Add task
            </button>
          </div>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.label} className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.done}
                  readOnly
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{task.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Recent activity</h3>
          <ul className="space-y-3">
            {activityTimeline.map((activity) => (
              <li key={activity.label} className="relative pl-4">
                <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-blue-500" aria-hidden />
                <p className="text-sm font-medium text-gray-900">{activity.value}</p>
                <p className="text-xs text-gray-500">{activity.label} · {activity.timestamp}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
