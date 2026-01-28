// src/app/firmsync/[tenantId]/cases/CasesWorkspace.tsx
// Shared workspace for managing tenant cases with live + preview parity

'use client';

import { useEffect, useMemo, useState } from 'react';

import { CaseMetrics } from './components/CaseMetrics';
import { CaseListPanel } from './components/CaseListPanel';
import { CaseOverviewPanel } from './components/CaseOverviewPanel';
import { useCases, type CasePriority, type CaseRecord } from './hooks/useCases';
import { useCaseInsights } from './hooks/useCaseInsights';

interface CasesWorkspaceProps {
  tenantId: string;
  previewMode?: boolean;
}

type StatusFilter = 'all' | CaseRecord['status'];
interface NewCaseFormPayload {
  title: string;
  case_type: string;
  client_name: string;
  priority: CasePriority;
}

export default function CasesWorkspace({ tenantId, previewMode = false }: CasesWorkspaceProps) {
  const { cases, loading, error, addCase, updateCase } = useCases(tenantId);
  const insights = useCaseInsights(cases);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);

  useEffect(() => {
    if (!selectedCaseId && cases.length) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId]);

  const filteredCases = useMemo(() => {
    return cases.filter((caseRecord) => {
      const matchesStatus = statusFilter === 'all' || caseRecord.status === statusFilter;
      const searchTarget = `${caseRecord.title} ${caseRecord.client_name} ${caseRecord.case_number}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [cases, searchQuery, statusFilter]);

  const selectedCase = filteredCases.find((record) => record.id === selectedCaseId) ?? cases.find((record) => record.id === selectedCaseId) ?? null;

  const handleCreateCase = async (formPayload: NewCaseFormPayload) => {
    if (previewMode) {
      return;
    }

    await addCase(formPayload);
    setShowNewCaseForm(false);
  };

  const handleStatusChange = async (status: CaseRecord['status']) => {
    if (!selectedCase || previewMode) {
      return;
    }
    await updateCase(selectedCase.id, { status });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading case workspace…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-red-200 text-red-700 px-6 py-5 rounded-lg max-w-lg text-center">
          <p className="font-semibold mb-2">Unable to load cases</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Matter operations</p>
            <h1 className="text-3xl font-semibold text-gray-900">Cases</h1>
            <p className="text-gray-600">Track matter progress, tasks, and AI signals</p>
            {previewMode && <p className="text-sm text-amber-600 mt-2">Preview mode: updates are disabled.</p>}
          </div>
          <button
            type="button"
            onClick={() => setShowNewCaseForm(true)}
            disabled={previewMode}
            className={`px-4 py-2 rounded-md font-medium ${
              previewMode ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Create case
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <CaseMetrics insights={insights} />

        {showNewCaseForm && (
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">New Case</h2>
              <button type="button" onClick={() => setShowNewCaseForm(false)} className="text-sm text-gray-500 hover:text-gray-700">
                Close
              </button>
            </div>
            <NewCaseForm
              onSubmit={handleCreateCase}
              previewMode={previewMode}
            />
          </section>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <CaseListPanel
              cases={filteredCases}
              selectedCaseId={selectedCaseId}
              onSelectCase={setSelectedCaseId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              previewMode={previewMode}
              onCreateCase={() => setShowNewCaseForm(true)}
            />
          </div>

          <div className="col-span-12 lg:col-span-8">
            <CaseOverviewPanel
              caseRecord={selectedCase}
              previewMode={previewMode}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

interface NewCaseFormProps {
  onSubmit: (payload: NewCaseFormPayload) => void | Promise<void>;
  previewMode: boolean;
}

function NewCaseForm({ onSubmit, previewMode }: NewCaseFormProps) {
  const [formState, setFormState] = useState<NewCaseFormPayload>({
    title: '',
    case_type: 'Civil Litigation',
    client_name: '',
    priority: 'medium',
  });

  const updateField = <Key extends keyof NewCaseFormPayload>(key: Key, value: NewCaseFormPayload[Key]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (previewMode) {
          return;
        }
        await onSubmit(formState);
        setFormState({ title: '', case_type: 'Civil Litigation', client_name: '', priority: 'medium' });
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Case title</label>
        <input
          type="text"
          value={formState.title}
          onChange={(event) => updateField('title', event.target.value)}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
        <input
          type="text"
          value={formState.client_name}
          onChange={(event) => updateField('client_name', event.target.value)}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Case type</label>
        <input
          type="text"
          value={formState.case_type}
          onChange={(event) => updateField('case_type', event.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select
          value={formState.priority}
          onChange={(event) => updateField('priority', event.target.value as CasePriority)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div className="md:col-span-2 flex justify-end space-x-3">
        <button
          type="submit"
          disabled={previewMode}
          className={`px-4 py-2 rounded-md font-medium ${
            previewMode ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Add case
        </button>
      </div>
    </form>
  );
}
