
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TenantProvider } from '@/contexts/TenantContext';
import { SessionProvider } from '@/contexts/SessionContext';

// Create a custom render function that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  tenant?: {
    id: string;
    name: string;
    features: Record<string, boolean>;
  };
  user?: {
    id: number;
    email: string;
    role: string;
    firmId: number;
  };
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    initialEntries = ['/'],
    tenant = {
      id: 'test-tenant',
      name: 'Test Law Firm',
      features: {
        documentsEnabled: true,
        billingEnabled: true,
        aiAnalysis: true,
      },
    },
    user = {
      id: 1,
      email: 'test@example.com',
      role: 'firm_admin',
      firmId: 1,
    },
    ...renderOptions
  } = options;

  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SessionProvider initialUser={user}>
          <TenantProvider initialTenant={tenant}>
            {children}
          </TenantProvider>
        </SessionProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Mock API responses
export const mockApiResponses = {
  tenant: {
    id: 'test-tenant',
    name: 'Test Law Firm',
    features: {
      documentsEnabled: true,
      billingEnabled: true,
      aiAnalysis: true,
    },
  },
  user: {
    id: 1,
    email: 'test@example.com',
    role: 'firm_admin',
    firmId: 1,
    firstName: 'Test',
    lastName: 'User',
  },
  documents: [
    {
      id: 1,
      name: 'test-document.pdf',
      type: 'NDA',
      status: 'reviewed',
      uploadedAt: '2025-01-20T10:00:00Z',
    },
  ],
  analysisResult: {
    summary: 'Test document analysis summary',
    keyPoints: ['Point 1', 'Point 2'],
    riskFlags: ['High risk clause found'],
    confidence: 0.85,
  },
};

// Mock fetch for testing
export const mockFetch = (responses: Record<string, any>) => {
  global.fetch = jest.fn((url: string) => {
    const urlPath = typeof url === 'string' ? url : url.toString();
    
    for (const [path, response] of Object.entries(responses)) {
      if (urlPath.includes(path)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response),
        } as Response);
      }
    }
    
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    } as Response);
  });
};

// Helper for testing error states
export const mockApiError = (status: number = 500, message: string = 'Internal Server Error') => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({ error: message }),
    } as Response)
  );
};

// Helper for testing loading states
export const mockApiDelay = (response: any, delay: number = 1000) => {
  global.fetch = jest.fn(() =>
    new Promise((resolve) =>
      setTimeout(() =>
        resolve({
          ok: true,
          json: () => Promise.resolve(response),
        } as Response), delay
      )
    )
  );
};

export * from '@testing-library/react';
export { renderWithProviders as render };
