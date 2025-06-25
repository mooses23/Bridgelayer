import { create } from 'zustand';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

// Types
export type SystemStatus = {
  activeFirms: number;
  totalUsers: number;
  apiHealth: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    errorRate: number;
    lastChecked: string;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
  }>;
  alerts: Array<{
    id: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
  performanceMetrics: {
    apiResponseTimes: Array<{ timestamp: string; value: number }>;
    errorRates: Array<{ timestamp: string; value: number }>;
  };
};

// API Functions
const fetchSystemStatus = async (): Promise<SystemStatus> => {
  const response = await fetch('/api/admin/system/status');
  if (!response.ok) {
    throw new Error('Failed to fetch system status');
  }
  return response.json();
};

const fetchRealtimeMetrics = async (): Promise<Pick<SystemStatus, 'apiHealth' | 'performanceMetrics'>> => {
  const response = await fetch('/api/admin/system/metrics/realtime');
  if (!response.ok) {
    throw new Error('Failed to fetch realtime metrics');
  }
  return response.json();
};

// Store for realtime updates
type MetricsStore = {
  lastUpdate: string | null;
  metrics: Pick<SystemStatus, 'apiHealth' | 'performanceMetrics'> | null;
  setMetrics: (metrics: Pick<SystemStatus, 'apiHealth' | 'performanceMetrics'>) => void;
};

export const useMetricsStore = create<MetricsStore>((set) => ({
  lastUpdate: null,
  metrics: null,
  setMetrics: (metrics) => set({ metrics, lastUpdate: new Date().toISOString() }),
}));

// Hook for fetching system status
export const useSystemStatus = () => {
  return useQuery<SystemStatus, Error>({
    queryKey: ['systemStatus'],
    queryFn: fetchSystemStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};

// WebSocket connection with reconnection logic
const createWebSocketConnection = (
  url: string,
  onMessage: (data: any) => void,
  onError: (error: Event) => void
) => {
  let ws: WebSocket | null = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const baseDelay = 1000; // Start with 1 second delay

  const connect = () => {
    ws = new WebSocket(url);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
        reconnectAttempts = 0; // Reset on successful connection
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      onError(error);
    };

    ws.onclose = () => {
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
        setTimeout(() => {
          reconnectAttempts++;
          connect();
        }, delay);
      }
    };
  };

  connect();

  return () => {
    if (ws) {
      ws.close();
    }
  };
};

// Hook for real-time metrics updates
export const useRealtimeMetrics = () => {
  const queryClient = useQueryClient();
  const setMetrics = useMetricsStore((state) => state.setMetrics);
  const initialDataRef = useRef(false);

  // Fetch initial data
  useEffect(() => {
    if (!initialDataRef.current) {
      fetchRealtimeMetrics()
        .then(data => {
          setMetrics(data);
          initialDataRef.current = true;
        })
        .catch(console.error);
    }
  }, [setMetrics]);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    const handleMessage = (metrics: Pick<SystemStatus, 'apiHealth' | 'performanceMetrics'>) => {
      setMetrics(metrics);
      
      // Update the system status query data with new metrics
      queryClient.setQueryData<SystemStatus>(['systemStatus'], (old) => {
        if (!old) return old;
        return {
          ...old,
          apiHealth: metrics.apiHealth,
          performanceMetrics: metrics.performanceMetrics,
        };
      });
    };

    const handleError = (error: Event) => {
      console.error('WebSocket error:', error);
      // Optionally trigger a refetch of the data via HTTP
      queryClient.invalidateQueries({ queryKey: ['systemStatus'] });
    };

    const cleanup = createWebSocketConnection(
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
      handleMessage,
      handleError
    );

    return () => {
      cleanup();
    };
  }, [queryClient, setMetrics]);

  return useMetricsStore((state) => ({
    data: state.metrics,
    lastUpdate: state.lastUpdate,
    isError: false,
  }));
};
