// src/app/firmsync/tenant/hooks/useFirmSyncData.ts
// Custom hook for managing FirmSync tenant-specific data and API calls

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface FirmProfile {
  id: string;
  name: string;
  settings: Record<string, any>;
  tenant_id: number;
}

interface TenantUser {
  id: string;
  display_name: string;
  email: string;
  role: 'tenant_admin' | 'tenant_user';
}

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

export function useFirmSyncData(tenantId: string): FirmSyncData {
  const [data, setData] = useState<FirmSyncData>({
    firm: null,
    user: null,
    wildcardTabs: [],
    loading: true,
    error: null
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

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
          .eq('tenant_id', tenantId)
          .single();

        if (profileError) throw profileError;

        // Fetch tenant/firm information
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', tenantId)
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
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchClients = async () => {
    try {
      setLoading(true);
      // In real implementation, this would query the firmsync.clients table
      const { data, error } = await supabase
        .from('firmsync.clients')
        .select('*')
        .eq('tenant_id', tenantId);

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [tenantId, supabase]);

  return { clients, loading, error, refetch: fetchClients };
}

// Hook for managing case data
export function useCases(tenantId: string) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchCases() {
      try {
        // In real implementation, this would query the firmsync.cases table
        const { data, error } = await supabase
          .from('firmsync.cases')
          .select('*')
          .eq('tenant_id', tenantId);

        if (error) throw error;
        setCases(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cases');
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, [tenantId, supabase]);

  return { cases, loading, error, refetch: () => fetchCases() };
}
