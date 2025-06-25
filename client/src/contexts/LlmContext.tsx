import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import llmApi from '@/lib/llmApi';
import type { LlmSettings } from '@/lib/llmApi';

interface LlmContextValue {
  settings: LlmSettings | null;
  usage: { currentMonthUsage: number; monthlyTokenLimit: number } | null;
  insights: Record<string, any> | null;
  isLoadingSettings: boolean;
  isLoadingUsage: boolean;
  isLoadingInsights: boolean;
  saveApiKey: (key: string) => void;
  refetchSettings: () => void;
  refetchUsage: () => void;
  refetchInsights: (tab: string, id?: number) => void;
}

const LlmContext = createContext<LlmContextValue | undefined>(undefined);

export const LlmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading: isLoadingSettings } = useQuery<LlmSettings | null>({
    queryKey: ['llmSettings'],
    queryFn: llmApi.getFirmSettings,
  });

  const { data: usage, isLoading: isLoadingUsage } = useQuery<{
    currentMonthUsage: number;
    monthlyTokenLimit: number;
  } | null>({
    queryKey: ['firmUsageStats'],
    queryFn: llmApi.getFirmUsageStats,
  });

  const saveMutation = useMutation({
    mutationFn: llmApi.setFirmApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llmSettings'] });
      queryClient.invalidateQueries({ queryKey: ['firmUsageStats'] });
    }
  });

  const { mutate: saveApiKey } = saveMutation;

  const { data: insights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ['llmInsights'],
    queryFn: () => llmApi.getInsights('dashboard'),
    enabled: false
  });

  const refetchInsights = (tab: string, id?: number) => {
    queryClient.fetchQuery({
      queryKey: ['insights', tab, id], 
      queryFn: () => llmApi.getInsights(tab, id)
    });
  };

  return (
    <LlmContext.Provider
      value={{
        settings: settings || null,
        usage: usage || null,
        insights: insights || null,
        isLoadingSettings,
        isLoadingUsage,
        isLoadingInsights,
        saveApiKey,
        refetchSettings: () => queryClient.invalidateQueries({ queryKey: ['llmSettings'] }),
        refetchUsage: () => queryClient.invalidateQueries({ queryKey: ['firmUsageStats'] }),
        refetchInsights,
      }}
    >
      {children}
    </LlmContext.Provider>
  );
};

export function useLlm() {
  const context = useContext(LlmContext);
  if (!context) {
    throw new Error('useLlm must be used within an LlmProvider');
  }
  return context;
}
