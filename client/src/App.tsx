import React from 'react';
import { SessionProvider } from '@/contexts/SessionContext';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantProvider } from '@/context/TenantContext';
import RoleRouter from '@/components/RoleRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
  },
});

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TenantProvider>
            <RoleRouter />
          </TenantProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </SessionProvider>
  );
}