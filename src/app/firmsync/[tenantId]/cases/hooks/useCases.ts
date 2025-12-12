// src/app/firmsync/[tenantId]/cases/hooks/useCases.ts
// Hook for retrieving and managing tenant cases

'use client';

import { useCallback, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export type CasePriority = 'low' | 'medium' | 'high' | 'critical';
export type CaseStatus = 'intake' | 'active' | 'pending' | 'on_hold' | 'closed';

export interface CaseRecord {
  id: string;
  tenant_id: string;
  case_number: string;
  title: string;
  case_type: string;
  status: CaseStatus;
  stage?: string;
  client_name: string;
  lead_attorney?: string;
  co_counsel?: string;
  opened_at: string;
  updated_at: string;
  priority: CasePriority;
  tasks_completed?: number;
  tasks_total?: number;
  deadlines_upcoming?: number;
  risk_score?: number;
  description?: string;
}

interface UseCasesReturn {
  cases: CaseRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addCase: (payload: Pick<CaseRecord, 'title' | 'case_type' | 'client_name' | 'priority'>) => Promise<void>;
  updateCase: (id: string, updates: Partial<CaseRecord>) => Promise<void>;
}

export function useCases(tenantId: string): UseCasesReturn {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchCases = useCallback(async () => {
    if (!tenantId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('firmsync_cases')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('updated_at', { ascending: false });

      if (supabaseError) {
        throw new Error(`Failed to fetch cases: ${supabaseError.message}`);
      }

      setCases(
        (data || []).map((record) => ({
          ...record,
          stage: record.stage || 'Discovery',
          tasks_completed: record.tasks_completed ?? 0,
          tasks_total: record.tasks_total ?? 0,
          deadlines_upcoming: record.deadlines_upcoming ?? 0,
          risk_score: record.risk_score ?? 35,
        })) as CaseRecord[]
      );
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Failed to fetch cases';
      setError(message);
      console.error('useCases fetchCases error:', fetchError);
    } finally {
      setLoading(false);
    }
  }, [supabase, tenantId]);

  const addCase = useCallback(
    async (payload: Pick<CaseRecord, 'title' | 'case_type' | 'client_name' | 'priority'>) => {
      if (!tenantId) {
        return;
      }

      try {
        const insertPayload = {
          ...payload,
          tenant_id: tenantId,
          id: crypto.randomUUID(),
          case_number: `FS-${Date.now()}`,
          status: 'intake' as CaseStatus,
          opened_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } satisfies Partial<CaseRecord>;

        const { data, error: supabaseError } = await supabase
          .from('firmsync_cases')
          .insert(insertPayload)
          .select()
          .single();

        if (supabaseError) {
          throw new Error(`Failed to add case: ${supabaseError.message}`);
        }

        setCases((prev) => [data as CaseRecord, ...prev]);
      } catch (insertError) {
        const message = insertError instanceof Error ? insertError.message : 'Failed to add case';
        setError(message);
        console.error('useCases addCase error:', insertError);
      }
    },
    [supabase, tenantId]
  );

  const updateCase = useCallback(
    async (id: string, updates: Partial<CaseRecord>) => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('firmsync_cases')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('tenant_id', tenantId)
          .select()
          .single();

        if (supabaseError) {
          throw new Error(`Failed to update case: ${supabaseError.message}`);
        }

        setCases((prev) => prev.map((record) => (record.id === id ? (data as CaseRecord) : record)));
      } catch (updateError) {
        const message = updateError instanceof Error ? updateError.message : 'Failed to update case';
        setError(message);
        console.error('useCases updateCase error:', updateError);
      }
    },
    [supabase, tenantId]
  );

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return {
    cases,
    loading,
    error,
    refetch: fetchCases,
    addCase,
    updateCase,
  };
}
