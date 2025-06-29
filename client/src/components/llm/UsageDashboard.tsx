import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  Clock, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  Users,
  Calendar
} from 'lucide-react';
import llmApi from '@/lib/llmApi';
import { useQuery } from '@tanstack/react-query';

interface UsageStats {
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  averageResponseTime: number;
  monthlyBudget?: number;
  currentMonthSpend: number;
  topFunctions: Array<{
    functionName: string;
    requests: number;
    cost: number;
  }>;
  dailyUsage: Array<{
    date: string;
    requests: number;
    cost: number;
    tokens: number;
  }>;
  userActivity: Array<{
    userId: number;
    userName: string;
    requests: number;
    cost: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function UsageDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: usageStats, isLoading, error, refetch } = useQuery<UsageStats>({
    queryKey: ['llm-usage-stats', timeRange],
    queryFn: () => llmApi.getFirmUsageStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const budgetUsagePercentage = usageStats?.monthlyBudget 
    ? (usageStats.currentMonthSpend / usageStats.monthlyBudget) * 100 
    : 0;

  const getBudgetAlertLevel = () => {
    if (budgetUsagePercentage >= 90) return 'destructive';
    if (budgetUsagePercentage >= 75) return 'default';
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load usage statistics. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Alert */}
      {usageStats?.monthlyBudget && getBudgetAlertLevel() && (
        <Alert variant={getBudgetAlertLevel()}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {budgetUsagePercentage >= 90 
              ? `Budget Alert: You've used ${budgetUsagePercentage.toFixed(1)}% of your monthly LLM budget.`
              : `Budget Warning: You've used ${budgetUsagePercentage.toFixed(1)}% of your monthly LLM budget.`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{usageStats?.totalRequests?.toLocaleString() || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">${usageStats?.totalCost?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                <p className="text-2xl font-bold">{usageStats?.totalTokens?.toLocaleString() || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">{usageStats?.averageResponseTime?.toFixed(1) || 0}s</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Usage */}
      {usageStats?.monthlyBudget && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monthly Budget Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Current Month Spend</span>
                <span className="font-medium">
                  ${usageStats.currentMonthSpend.toFixed(2)} / ${usageStats.monthlyBudget.toFixed(2)}
                </span>
              </div>
              <Progress 
                value={budgetUsagePercentage} 
                className="h-3"
              />
              <div className="text-xs text-gray-500">
                {budgetUsagePercentage.toFixed(1)}% of monthly budget used
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
            <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
          </TabsList>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Refresh Data
          </Button>
        </div>

        <TabsContent value={timeRange} className="space-y-6 mt-6">
          {/* Daily Usage Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageStats?.dailyUsage || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="requests" fill="#8884d8" name="Requests" />
                  <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#82ca9d" name="Cost ($)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Function Usage Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Functions by Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageStats?.topFunctions || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="functionName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usageStats?.topFunctions || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ functionName, cost }) => `${functionName}: $${cost.toFixed(2)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cost"
                    >
                      {(usageStats?.topFunctions || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* User Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats?.userActivity?.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.userName}</p>
                      <p className="text-sm text-gray-500">{user.requests} requests</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${user.cost.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">total cost</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
