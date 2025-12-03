// src/app/firmsync/[tenantId]/cases/components/CaseMetrics.tsx
// Displays summary cards for case KPIs

'use client';

import type { CaseInsight } from '../hooks/useCaseInsights';

interface CaseMetricsProps {
  insights: CaseInsight[];
}

export function CaseMetrics({ insights }: CaseMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {insights.map((insight) => (
        <div key={insight.label} className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">{insight.label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{insight.value}</p>
          {insight.helper && <p className="text-xs text-gray-500 mt-1">{insight.helper}</p>}
        </div>
      ))}
    </div>
  );
}
