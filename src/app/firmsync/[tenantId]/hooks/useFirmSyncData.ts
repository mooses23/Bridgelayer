// src/app/firmsync/tenant/hooks/useFirmSyncData.ts
// Custom hook for managing FirmSync tenant-specific data and API calls

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Profile as SupabaseProfile, Tenant as SupabaseTenant } from '@/types/database';

type FirmProfile = {
  id: SupabaseTenant['id'];
  name: SupabaseTenant['name'];
  settings: SupabaseTenant['settings'];
  tenant_id: SupabaseTenant['id'];
};

type TenantUser = Pick<SupabaseProfile, 'id' | 'display_name' | 'email' | 'role'>;

interface WildcardTab {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  component: 'wildcard-one' | 'wildcard-two' | 'wildcard-three';
}

interface FirmSyncData {
  firm: FirmProfile | null;
  user: TenantUser | null;
  wildcardTabs: WildcardTab[];
  loading: boolean;
  error: string | null;
}

interface TenantClientRecord {
  id: string;
  tenant_id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  [key: string]: unknown;
}

interface TenantCaseRecord {
  id: string;
  tenant_id: string | number;
  title: string;
  status: string;
  [key: string]: unknown;
}

export function useFirmSyncData(tenantId: string): FirmSyncData {
  const [data, setData] = useState<FirmSyncData>({
    firm: null,
    user: null,
    wildcardTabs: [],
    loading: true,
    error: null
  });

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchData() {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const tenantIdNumber = Number(tenantId);
        if (Number.isNaN(tenantIdNumber)) {
          throw new Error('Invalid tenant identifier');
        }

        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No authenticated user');
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .eq('tenant_id', tenantIdNumber)
          .single();

        if (profileError) throw profileError;

        // Fetch tenant/firm information
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', tenantIdNumber)
          .single();

        if (tenantError) throw tenantError;

        // Mock wildcard tabs data (in real app, this would come from database)
        const mockWildcardTabs: WildcardTab[] = [
          {
            id: 'w1',
            name: 'Custom Integration A',
            url: 'https://example.com/integration-a',
            enabled: false,
            component: 'wildcard-one'
          },
          {
            id: 'w2',
            name: 'Document Portal',
            url: 'https://docs.example.com',
            enabled: true,
            component: 'wildcard-two'
          },
          {
            id: 'w3',
            name: 'Client Portal',
            url: 'https://client.example.com',
            enabled: false,
            component: 'wildcard-three'
          }
        ];

        setData({
          firm: {
            id: tenant.id,
            name: tenant.name,
            settings: tenant.settings || {},
            tenant_id: tenant.id
          },
          user: {
            id: profile.id,
            display_name: profile.display_name,
            email: profile.email,
            role: profile.role
          },
          wildcardTabs: mockWildcardTabs,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching FirmSync data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    }

    if (tenantId) {
      fetchData();
    }
  }, [tenantId, supabase]);

  return data;
}

// Hook for managing client data
export function useClients(tenantId: string) {
  const [clients, setClients] = useState<TenantClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const normalizedTenantId = Number.isNaN(Number(tenantId)) ? tenantId : Number(tenantId);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      // In real implementation, this would query the firmsync.clients table
      const { data, error: supabaseError } = await supabase
        .from('firmsync.clients')
        .select('*')
        .eq('tenant_id', normalizedTenantId);

      if (supabaseError) throw supabaseError;
      setClients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  }, [supabase, normalizedTenantId]);

  useEffect(() => {
    if (tenantId) {
      fetchClients();
    }
  }, [tenantId, fetchClients]);

  return { clients, loading, error, refetch: fetchClients };
}

// Hook for managing case data
export function useCases(tenantId: string) {
  const [cases, setCases] = useState<TenantCaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const normalizedTenantId = Number.isNaN(Number(tenantId)) ? tenantId : Number(tenantId);

  const fetchCases = useCallback(async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('firmsync.cases')
        .select('*')
        .eq('tenant_id', normalizedTenantId);

      if (supabaseError) throw supabaseError;
      setCases(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  }, [normalizedTenantId, supabase]);

  useEffect(() => {
    if (tenantId) {
      fetchCases();
    }
  }, [tenantId, fetchCases]);

  return { cases, loading, error, refetch: fetchCases };
}
