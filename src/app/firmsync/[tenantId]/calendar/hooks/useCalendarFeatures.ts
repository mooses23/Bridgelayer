// src/app/firmsync/[tenantId]/calendar/hooks/useCalendarFeatures.ts
// Hook for fetching tenant-specific calendar feature toggles

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

interface CalendarFeatures {
  appointments: boolean;
  deadlines: boolean;
  courtDates: boolean;
  meetings: boolean;
  reminders: boolean;
  googleCalendarSync: boolean;
  outlookSync: boolean;
  aiScheduling: boolean;
  conflictDetection: boolean;
  recurringEvents: boolean;
}

interface UseCalendarFeaturesReturn {
  features: CalendarFeatures | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCalendarFeatures(tenantId: string): UseCalendarFeaturesReturn {
  const [features, setFeatures] = useState<CalendarFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchCalendarFeatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('firmsync_tenant')
        .select('calendar_features')
        .eq('tenant_id', tenantId)
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Default features if none configured
      const defaultFeatures: CalendarFeatures = {
        appointments: true,
        deadlines: true,
        courtDates: true,
        meetings: true,
        reminders: true,
        googleCalendarSync: false,
        outlookSync: false,
        aiScheduling: false,
        conflictDetection: true,
        recurringEvents: true,
      };

      setFeatures(data?.calendar_features || defaultFeatures);
    } catch (err) {
      console.error('Error fetching calendar features:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar features');
    } finally {
      setLoading(false);
    }
  }, [supabase, tenantId]);

  useEffect(() => {
    if (tenantId) {
      fetchCalendarFeatures();
    }
  }, [tenantId, fetchCalendarFeatures]);

  return {
    features,
    loading,
    error,
    refetch: fetchCalendarFeatures
  };
}
