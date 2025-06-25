import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminHome from '../Home';
import { useSystemStatus, useRealtimeMetrics, SystemStatus } from '@/hooks/useSystemStatus';
import { UseQueryResult } from '@tanstack/react-query';

const mockData: SystemStatus = {
  activeFirms: 24,
  totalUsers: 1429,
  apiHealth: {
    status: 'healthy',
    responseTime: 150,
    errorRate: 0.01,
    lastChecked: new Date().toISOString(),
  },
  recentActivities: [
    {
      id: '1',
      type: 'firm.created',
      description: 'New firm onboarded: Smith & Associates',
      timestamp: new Date().toISOString(),
      status: 'success'
    }
  ],
  alerts: [
    {
      id: '1',
      severity: 'warning',
      message: 'High API latency detected',
      timestamp: new Date().toISOString(),
    }
  ],
  performanceMetrics: {
    apiResponseTimes: [
      { timestamp: new Date().toISOString(), value: 150 }
    ],
    errorRates: [
      { timestamp: new Date().toISOString(), value: 0.01 }
    ]
  }
};

// Mock the custom hooks with correct typing
const createQueryResult = (overrides = {}): UseQueryResult<SystemStatus, Error> => ({
  data: mockData,
  dataUpdatedAt: Date.now(),
  error: null,
  errorUpdateCount: 0,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  fetchStatus: 'idle',
  isError: false,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  isLoading: false,
  isLoadingError: false,
  isPaused: false,
  isPlaceholderData: false,
  isRefetchError: false,
  isRefetching: false,
  isStale: false,
  isSuccess: true,
  status: 'success',
  refetch: () => Promise.resolve({ data: mockData, isSuccess: true, status: 'success' } as any),
  ...overrides
}) as UseQueryResult<SystemStatus, Error>;

const mockRealtimeMetrics = {
  data: {
    apiHealth: mockData.apiHealth,
    performanceMetrics: mockData.performanceMetrics
  },
  lastUpdate: new Date().toISOString(),
  isError: false
};

vi.mock('@/hooks/useSystemStatus', () => ({
  useSystemStatus: vi.fn(() => createQueryResult()),
  useRealtimeMetrics: vi.fn(() => mockRealtimeMetrics)
}));

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  LineChart: vi.fn(() => null),
  Line: vi.fn(() => null),
  XAxis: vi.fn(() => null),
  YAxis: vi.fn(() => null),
  CartesianGrid: vi.fn(() => null),
  ResponsiveContainer: vi.fn(({ children }) => children),
  Tooltip: vi.fn(() => null)
}));

describe('AdminHome', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('renders loading state', () => {
    vi.mocked(useSystemStatus).mockReturnValue(createQueryResult({ isLoading: true }));
    
    render(
      <QueryClientProvider client={queryClient}>
        <AdminHome />
      </QueryClientProvider>
    );
    
    expect(screen.getAllByTestId('status-card-skeleton')).toHaveLength(4);
  });

  it('renders error state', () => {
    const error = new Error('Failed to load data');
    vi.mocked(useSystemStatus).mockReturnValue(createQueryResult({ 
      isError: true,
      error
    }));
    
    render(
      <QueryClientProvider client={queryClient}>
        <AdminHome />
      </QueryClientProvider>
    );
    
    expect(screen.getByText(/Failed to load data/)).toBeInTheDocument();
  });

  it('renders system status cards with correct data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminHome />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('24')).toBeInTheDocument(); // Active Firms
      expect(screen.getByText('1,429')).toBeInTheDocument(); // Total Users
      expect(screen.getByText('healthy')).toBeInTheDocument(); // API Health
      expect(screen.getByText('0.01%')).toBeInTheDocument(); // Error Rate
    });
  });

  it('renders recent activities', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminHome />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('New firm onboarded: Smith & Associates')).toBeInTheDocument();
    });
  });

  it('renders system alerts when present', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminHome />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('High API latency detected')).toBeInTheDocument();
    });
  });

  it('updates with realtime metrics', async () => {
    const updatedMetrics = {
      apiHealth: {
        ...mockData.apiHealth,
        responseTime: 200
      },
      performanceMetrics: mockData.performanceMetrics
    };

    vi.mocked(useRealtimeMetrics).mockReturnValue({
      ...mockRealtimeMetrics,
      data: updatedMetrics,
      lastUpdate: new Date().toISOString()
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AdminHome />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('200ms avg response')).toBeInTheDocument();
    });
  });

  it('renders quick action buttons', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminHome />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Firm')).toBeInTheDocument();
      expect(screen.getByText('View Logs')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Configure')).toBeInTheDocument();
    });
  });
});
