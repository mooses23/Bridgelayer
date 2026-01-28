// src/app/firmsync/[tenantId]/cases/hooks/useCaseInsights.ts
// Lightweight hook that derives metrics for dashboards

'use client';

import { useMemo } from 'react';
import type { CaseRecord } from './useCases';

export interface CaseInsight {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'flat';
  helper?: string;
}

export function useCaseInsights(cases: CaseRecord[]): CaseInsight[] {
  return useMemo(() => {
    if (!cases.length) {
      return [
        { label: 'Active Cases', value: 0 },
        { label: 'Upcoming Deadlines', value: 0 },
        { label: 'High Priority', value: 0 },
        { label: 'Average Risk', value: '—' },
      ];
    }

    const activeCases = cases.filter((record) => record.status === 'active').length;
    const highPriority = cases.filter((record) => record.priority === 'high' || record.priority === 'critical').length;
    const deadlines = cases.reduce((total, record) => total + (record.deadlines_upcoming ?? 0), 0);
    const riskScores = cases
      .map((record) => record.risk_score)
      .filter((score): score is number => typeof score === 'number');

    const averageRisk = riskScores.length
      ? Math.round(riskScores.reduce((total, score) => total + score, 0) / riskScores.length)
      : null;

    return [
      { label: 'Active Cases', value: activeCases, helper: `${cases.length} total` },
      { label: 'Upcoming Deadlines', value: deadlines, helper: 'Next 14 days' },
      { label: 'High Priority', value: highPriority, helper: 'Critical attention' },
      { label: 'Average Risk', value: averageRisk ?? '—', helper: 'AI signal' },
    ];
  }, [cases]);
}
