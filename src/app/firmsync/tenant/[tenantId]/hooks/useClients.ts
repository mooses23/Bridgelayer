// src/app/firmsync/tenant/[tenantId]/hooks/useClients.ts
// Hook for fetching client data for a tenant

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Client {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive' | 'prospective' | 'archived';
  created_at: string;
  updated_at: string;
  last_contact?: string;
  tags?: string[];
  notes_count?: number;
  documents_count?: number;
  cases_count?: number;
  ai_summary?: string;
}

interface UseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addClient: (client: Partial<Client>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

export function useClients(tenantId: string): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('firmsync_clients')
        .select(`
          *,
          notes:firmsync_client_notes(count),
          documents:firmsync_client_documents(count),
          cases:firmsync_cases(count)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw new Error(`Failed to fetch clients: ${supabaseError.message}`);
      }

      // Transform the data to include counts
      const transformedClients = (data || []).map(client => ({
        ...client,
        notes_count: client.notes?.[0]?.count || 0,
        documents_count: client.documents?.[0]?.count || 0,
        cases_count: client.cases?.[0]?.count || 0,
      }));

      setClients(transformedClients);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      console.error('useClients fetchClients error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: Partial<Client>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('firmsync_clients')
        .insert({
          ...clientData,
          tenant_id: tenantId,
          id: crypto.randomUUID(),
        })
        .select()
        .single();

      if (supabaseError) {
        throw new Error(`Failed to add client: ${supabaseError.message}`);
      }

      setClients(prev => [data, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add client');
      console.error('useClients addClient error:', err);
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('firmsync_clients')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (supabaseError) {
        throw new Error(`Failed to update client: ${supabaseError.message}`);
      }

      setClients(prev => 
        prev.map(client => client.id === id ? { ...client, ...data } : client)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
      console.error('useClients updateClient error:', err);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('firmsync_clients')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (supabaseError) {
        throw new Error(`Failed to delete client: ${supabaseError.message}`);
      }

      setClients(prev => prev.filter(client => client.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
      console.error('useClients deleteClient error:', err);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchClients();
    }
  }, [tenantId]);

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    addClient,
    updateClient,
    deleteClient,
  };
}
