import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Firm, FirmFilters, FirmListResponse } from '@/types/firm';

const fetchFirms = async (filters: FirmFilters): Promise<FirmListResponse> => {
  const params = new URLSearchParams({
    page: filters.page.toString(),
    pageSize: filters.pageSize.toString(),
    ...(filters.search && { search: filters.search }),
    ...(filters.status?.length && { status: filters.status.join(',') }),
    ...(filters.practiceArea?.length && { practiceArea: filters.practiceArea.join(',') })
  });

  const response = await fetch(`/api/admin/firms?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch firms');
  }
  return response.json();
};

const updateFirm = async (firm: Partial<Firm> & { id: string }): Promise<Firm> => {
  const response = await fetch(`/api/admin/firms/${firm.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(firm),
  });
  if (!response.ok) {
    throw new Error('Failed to update firm');
  }
  return response.json();
};

const resetFirm = async (firmId: string): Promise<void> => {
  const response = await fetch(`/api/admin/firms/${firmId}/reset`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to reset firm');
  }
};

export function useFirms(filters: FirmFilters) {
  return useQuery<FirmListResponse, Error>({
    queryKey: ['firms', filters],
    queryFn: () => fetchFirms(filters),
    keepPreviousData: true, // Important for smooth pagination
  });
}

export function useUpdateFirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFirm,
    onSuccess: (updatedFirm) => {
      // Update the firm in the cache
      queryClient.setQueriesData({ queryKey: ['firms'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          firms: old.firms.map((firm: Firm) =>
            firm.id === updatedFirm.id ? updatedFirm : firm
          ),
        };
      });
    },
  });
}

export function useResetFirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetFirm,
    onSuccess: (_, firmId) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['firms'] });
    },
  });
}
