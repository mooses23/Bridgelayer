import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import EmptyState from "@/components/ui/empty-state";
import ApiClient from "@/lib/apiClient";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Database, 
  HardDrive, 
  RefreshCw, 
  Server,
  TrendingUp,
  Zap
} from "lucide-react";

interface SystemHealth {
  status: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    external: number;
  };
  logs: {
    total: number;
    lastHour: number;
    lastDay: number;
    errorCount: number;
    warnCount: number;
    sources: string[];
  };
  timestamp: string;
  version: string;
  nodeVersion: string;
  environment: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: any;
  source: string;
}

export default function SystemHealthPage() {
  const [logLevel, setLogLevel] = useState<string>('all');
  const [logSource, setLogSource] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Enable automatic JWT token refresh for persistent authentication
  useTokenRefresh();

  // Fetch system health data
  const { 
    data: healthData, 
    isLoading: healthLoading, 
    refetch: refetchHealth 
  } = useQuery<SystemHealth>({
    queryKey: ['admin', 'system-health'],
    queryFn: () => ApiClient.get('/api/admin/system-health').then(res => res.json()),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch application logs
  const { 
    data: logsData, 
    isLoading: logsLoading, 
    refetch: refetchLogs 
  } = useQuery<LogEntry[]>({
    queryKey: ['admin', 'logs', logLevel, logSource],
    queryFn: () => {
      const params = new URLSearchParams();
      if (logLevel !== 'all') params.append('level', logLevel);
      if (logSource !== 'all') params.append('source', logSource);
      params.append('limit', '100');

      return ApiClient.get(`/api/admin/logs?${params}`).then(res => res.json());
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warn': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'debug': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Ensure logsData is always an array
  const safeLogs = Array.isArray(logsData) ? logsData : [];

  const filteredLogs = Array.isArray(logsData) ? logsData.filter(
    (log) =>
      searchTerm === "" ||
      log?.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log?.source?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (healthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Monitor system performance, logs, and application health
          </p>
        </div>
        <Button onClick={() => { refetchHealth(); refetchLogs(); }} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`w-5 h-5 ${getStatusColor(healthData?.status || 'unknown')}`} />
                  <p className="text-2xl font-bold capitalize">{healthData?.status || 'Unknown'}</p>
                </div>
              </div>
              <Server className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{formatUptime(healthData?.uptime || 0)}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                <p className="text-2xl font-bold">
                  {healthData?.memory?.used || 'N/A'}MB / {healthData?.memory?.total || 'N/A'}MB
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <div className="flex items-center space-x-2">
                  {(healthData?.logs?.errorCount || 0) > 0 ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <p className="text-2xl font-bold">{healthData?.logs?.errorCount || 0}</p>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Environment</Label>
                <p className="font-semibold capitalize">{healthData?.environment}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Version</Label>
                <p className="font-semibold">{healthData?.version}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Node.js</Label>
                <p className="font-semibold">{healthData?.nodeVersion}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                <p className="font-semibold">
                  {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleString() : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Log Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Total Logs</Label>
                <p className="text-2xl font-bold">{healthData?.logs?.total || 0}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Hour</Label>
                <p className="text-2xl font-bold">{healthData?.logs?.lastHour || 0}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Warnings</Label>
                <p className="text-2xl font-bold text-yellow-600">{healthData?.logs?.warnCount || 0}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Errors</Label>
                <p className="text-2xl font-bold text-red-600">{healthData?.logs?.errorCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Application Logs</span>
          </CardTitle>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={logLevel} onValueChange={setLogLevel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Log Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            <Select value={logSource} onValueChange={setLogSource}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {healthData?.logs?.sources?.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                )) || null}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : filteredLogs.length === 0 ? (
            <EmptyState
              title="No logs found"
              description="No logs match your current filters"
            />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <Badge className={getLevelColor(log.level)}>
                    {log.level.toUpperCase()}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{log.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {log.source}
                      </Badge>
                      {log.metadata && (
                        <p className="text-xs text-muted-foreground">
                          {JSON.stringify(log.metadata).slice(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}