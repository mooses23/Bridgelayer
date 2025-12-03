// src/app/firmsync/[tenantId]/clients/hooks/useClientFeatures.ts
// Hook for fetching tenant-specific client feature toggles

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ClientFeatures {
  contactsInfo: boolean;
  intakeForm: boolean;
  linkedCases: boolean;
  notesSection: boolean;
  documentUploads: boolean;
  aiSummarization: boolean;
  autoTagging: boolean;
  webhookTriggers: boolean;
  smartReminders: boolean;
  conflictChecking: boolean;
}

interface UseClientFeaturesReturn {
  features: ClientFeatures | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClientFeatures(tenantId: string): UseClientFeaturesReturn {
  const [features, setFeatures] = useState<ClientFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchClientFeatures = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('firmsync_tenant')
        .select('client_features')
        .eq('tenant_id', tenantId)
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Default features if none configured
      const defaultFeatures: ClientFeatures = {
        contactsInfo: true,
        intakeForm: true,
        linkedCases: true,
        notesSection: true,
        documentUploads: true,
        aiSummarization: false,
        autoTagging: false,
        webhookTriggers: false,
        smartReminders: false,
        conflictChecking: true,
      };

      setFeatures(data?.client_features || defaultFeatures);
    } catch (err) {
      console.error('Error fetching client features:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch client features');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchClientFeatures();
    }
  }, [tenantId]);

  return {
    features,
    loading,
    error,
    refetch: fetchClientFeatures
  };
}
