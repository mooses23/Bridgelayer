import React from 'react';
import { SessionProvider } from '@/contexts/SessionContext';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantProvider } from '@/context/TenantContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import RoleRouter from '@/components/RoleRouter';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <ErrorBoundary>
                <TenantProvider>
                  <ErrorBoundary>
                    <RoleRouter />
                    <Toaster position="top-right" />
                  </ErrorBoundary>
                </TenantProvider>
              </ErrorBoundary>
            </QueryClientProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </SessionProvider>
    </ErrorBoundary>
  );
}