// src/app/firmsync/[tenantId]/paralegal-plus/components/ResearchTab.tsx
// Legal research and case law analysis

'use client';

export function ResearchTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Research</h3>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Legal Research Assistant</h4>
          <p className="text-gray-600 mb-4">
            Comprehensive legal research and case law analysis features will be available here
          </p>
          <p className="text-sm text-gray-500">
            Coming soon: Case law search, statute analysis, and legal precedent findings
          </p>
        </div>
      </div>
    </div>
  );
}
