import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FirmsPage from '../Firms';
import { useFirms, useUpdateFirm, useResetFirm } from '@/hooks/useFirms';

// Mock the hooks
vi.mock('@/hooks/useFirms', () => ({
  useFirms: vi.fn(),
  useUpdateFirm: vi.fn(),
  useResetFirm: vi.fn(),
}));

// Mock data
const mockFirms = {
  firms: [
    {
      id: '1',
      name: 'Test Firm',
      status: 'active',
      practiceArea: 'corporate',
      userCount: 10,
      createdAt: '2025-06-25T00:00:00Z',
      lastActive: '2025-06-25T00:00:00Z',
      metrics: {
        apiUsage: 100,
        errorRate: 0.01,
        activeUsers: 5,
      },
      onboarding: {
        progress: 100,
        currentStep: 'completed',
        completedSteps: ['setup', 'config', 'verify'],
      },
    },
  ],
  total: 1,
  page: 1,
  pageSize: 12,
};

describe('FirmsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.mocked(useFirms).mockReturnValue({
      data: mockFirms,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useUpdateFirm).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    } as any);

    vi.mocked(useResetFirm).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    } as any);
  });

  it('renders firm cards with correct data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FirmsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Test Firm')).toBeInTheDocument();
    expect(screen.getByText('corporate')).toBeInTheDocument();
    expect(screen.getByText('10 users')).toBeInTheDocument();
  });

  it('handles search input', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FirmsPage />
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText('Search firms...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 300));

    expect(useFirms).toHaveBeenCalledWith(expect.objectContaining({
      search: 'test',
    }));
  });

  it('handles status filter', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FirmsPage />
      </QueryClientProvider>
    );

    const statusSelect = screen.getByText('Status');
    fireEvent.click(statusSelect);

    const activeOption = screen.getByText('Active');
    fireEvent.click(activeOption);

    expect(useFirms).toHaveBeenCalledWith(expect.objectContaining({
      status: ['active'],
    }));
  });

  it('handles practice area filter', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FirmsPage />
      </QueryClientProvider>
    );

    const practiceSelect = screen.getByText('Practice Area');
    fireEvent.click(practiceSelect);

    const corporateOption = screen.getByText('Corporate');
    fireEvent.click(corporateOption);

    expect(useFirms).toHaveBeenCalledWith(expect.objectContaining({
      practiceArea: ['corporate'],
    }));
  });

  it('handles pagination', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FirmsPage />
      </QueryClientProvider>
    );

    const nextButton = screen.getByText('Next page');
    fireEvent.click(nextButton);

    expect(useFirms).toHaveBeenCalledWith(expect.objectContaining({
      page: 2,
    }));
  });

  it('shows error state', async () => {
    vi.mocked(useFirms).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load firms'),
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <FirmsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Failed to load firms')).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    vi.mocked(useFirms).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <FirmsPage />
      </QueryClientProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
