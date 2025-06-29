import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  FileText, 
  Clock,
  DollarSign,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalFirms: number;
  activeUsers: number;
  documentsProcessed: number;
  revenueGenerated: number;
  systemUptime: string;
  averageSessionTime: string;
}

interface UsageMetric {
  name: string;
  value: number;
  change: number;
  period: string;
}

interface FirmUsage {
  firmName: string;
  users: number;
  documentsUploaded: number;
  aiQueriesCount: number;
  lastActive: string;
  planType: string;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    totalFirms: 156,
    activeUsers: 892,
    documentsProcessed: 12847,
    revenueGenerated: 245600,
    systemUptime: '99.9%',
    averageSessionTime: '45m'
  };

  const usageMetrics: UsageMetric[] = [
    { name: 'Daily Active Users', value: 324, change: 12.5, period: 'vs last week' },
    { name: 'Document Uploads', value: 1456, change: -3.2, period: 'vs last week' },
    { name: 'AI Queries', value: 8923, change: 18.7, period: 'vs last week' },
    { name: 'New Firms', value: 8, change: 25.0, period: 'vs last month' },
    { name: 'System Performance', value: 98.7, change: 1.2, period: '% uptime' },
    { name: 'Revenue Growth', value: 15.3, change: 5.1, period: '% monthly' }
  ];

  const firmUsageData: FirmUsage[] = [
    {
      firmName: 'Johnson & Associates',
      users: 12,
      documentsUploaded: 247,
      aiQueriesCount: 1823,
      lastActive: '2024-06-20',
      planType: 'Professional'
    },
    {
      firmName: 'Miller Law Group',
      users: 8,
      documentsUploaded: 156,
      aiQueriesCount: 934,
      lastActive: '2024-06-19',
      planType: 'Enterprise'
    },
    {
      firmName: 'Smith Legal Services',
      users: 5,
      documentsUploaded: 89,
      aiQueriesCount: 456,
      lastActive: '2024-06-18',
      planType: 'Starter'
    }
  ];

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? '↗' : '↘';
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800';
      case 'Professional': return 'bg-blue-100 text-blue-800';
      case 'Starter': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage Analytics</h1>
          <p className="mt-2 text-gray-600">
            Monitor platform performance, user engagement, and business metrics across all firms.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <Button variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Firms</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalFirms}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.activeUsers}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.documentsProcessed.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${analyticsData.revenueGenerated.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.systemUptime}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.averageSessionTime}</p>
              </div>
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usage" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Usage Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="firms" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Firm Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Revenue</span>
          </TabsTrigger>
        </TabsList>

        {/* Usage Metrics Tab */}
        <TabsContent value="usage" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usageMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{metric.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {metric.name.includes('Performance') || metric.name.includes('Revenue') 
                        ? `${metric.value}%` 
                        : metric.value.toLocaleString()}
                    </span>
                    <div className={`flex items-center space-x-1 ${getChangeColor(metric.change)}`}>
                      <span className="text-sm font-medium">
                        {getChangeIcon(metric.change)} {Math.abs(metric.change)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{metric.period}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Firm Analytics Tab */}
        <TabsContent value="firms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Firms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {firmUsageData.map((firm, index) => (
                  <div key={firm.firmName} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{firm.firmName}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{firm.users} users</span>
                          <span>{firm.documentsUploaded} docs</span>
                          <span>{firm.aiQueriesCount} AI queries</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPlanColor(firm.planType)}>
                        {firm.planType}
                      </Badge>
                      <span className="text-sm text-gray-500">{firm.lastActive}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Response Time</span>
                    <span className="text-sm text-gray-600">~145ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-gray-600">34%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '34%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-gray-600">67%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Authentication API</p>
                      <p className="text-sm text-gray-600">99.8% uptime</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Document Processing</p>
                      <p className="text-sm text-gray-600">98.2% uptime</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">AI/LLM Services</p>
                      <p className="text-sm text-gray-600">97.9% uptime</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Month</span>
                    <span className="text-lg font-bold text-green-600">$45,600</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Previous Month</span>
                    <span className="text-sm text-gray-600">$39,200</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Growth</span>
                    <span className="text-sm text-green-600">+16.3%</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Projected Annual Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$547,200</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                      <span className="text-sm">Enterprise</span>
                    </div>
                    <span className="text-sm font-medium">$28,500</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span className="text-sm">Professional</span>
                    </div>
                    <span className="text-sm font-medium">$14,300</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="text-sm">Starter</span>
                    </div>
                    <span className="text-sm font-medium">$2,800</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
