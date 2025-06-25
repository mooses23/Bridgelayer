import React, { useState, useEffect, useMemo } from 'react';
import {
  PeopleAlt as PeopleIcon,
  Person as UserIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { 
  CircularProgress, 
  TextField, 
  InputAdornment, 
  Pagination,
  Tooltip,
  IconButton,
  Chip,
  Alert,
  AlertTitle,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

// Types for API responses
interface AnalyticsData {
  totalTenants: number;
  activeUsers: number;
  monthlyRevenue: number;
}

interface SalesChaser {
  id: string;
  name: string;
  clientsBrought: number;
  revenueGenerated: number;
  commissionPercentage: number;
  commissionDue: number;
}

interface TenantGrowthData {
  month: string;
  tenants: number;
}

interface RevenueByChaser {
  name: string;
  revenue: number;
  percentage: number;
}

interface InactiveTenant {
  id: string;
  name: string;
  lastActivity: string;
  daysInactive: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

// Chart colors for consistency
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const OwnerDashboard: React.FC = () => {
  // State management
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [salesChasers, setSalesChasers] = useState<SalesChaser[]>([]);
  const [tenantGrowth, setTenantGrowth] = useState<TenantGrowthData[]>([]);
  const [revenueByChaser, setRevenueByChaser] = useState<RevenueByChaser[]>([]);
  const [inactiveTenants, setInactiveTenants] = useState<InactiveTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for enhanced features
  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filtered and paginated sales chasers
  const filteredSalesChasers = useMemo(() => {
    return salesChasers.filter(chaser => 
      chaser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chaser.clientsBrought.toString().includes(searchTerm)
    );
  }, [salesChasers, searchTerm]);

  const paginatedSalesChasers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSalesChasers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSalesChasers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSalesChasers.length / itemsPerPage);

  // Helper function to fetch data with error handling
  const fetchData = async <T,>(url: string, params?: Record<string, string>): Promise<T> => {
    try {
      const searchParams = new URLSearchParams(params);
      const fullUrl = params ? `${url}?${searchParams}` : url;
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data;
    } catch (err) {
      throw new Error(`Failed to fetch data from ${url}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Function to refresh data with current date range
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateParams = dateRange.start && dateRange.end ? {
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd')
      } : undefined;

      // Fetch analytics data (tenants, active users, revenue)
      const [tenantsResponse, usersResponse, revenueResponse] = await Promise.all([
        fetchData<{ total: number }>('/api/owner/analytics/tenants', dateParams),
        fetchData<{ active: number }>('/api/owner/analytics/active-users', dateParams),
        fetchData<{ revenue: number }>('/api/owner/analytics/revenue', dateParams),
      ]);

      setAnalyticsData({
        totalTenants: tenantsResponse.total,
        activeUsers: usersResponse.active,
        monthlyRevenue: revenueResponse.revenue,
      });

      // Fetch sales chasers data
      const salesChasersData = await fetchData<SalesChaser[]>('/api/owner/analytics/sales-chasers', dateParams);
      setSalesChasers(salesChasersData);

      // Fetch tenant growth data
      const tenantGrowthData = await fetchData<TenantGrowthData[]>('/api/owner/analytics/tenant-growth', dateParams);
      setTenantGrowth(tenantGrowthData);

      // Fetch revenue by chaser data
      const revenueByChaser = await fetchData<RevenueByChaser[]>('/api/owner/analytics/revenue-by-chaser', dateParams);
      setRevenueByChaser(revenueByChaser);

      // Fetch inactive tenants
      const inactiveTenantsData = await fetchData<InactiveTenant[]>('/api/owner/analytics/inactive-tenants');
      setInactiveTenants(inactiveTenantsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data on component mount and when date range changes
  useEffect(() => {
    refreshData();
  }, [dateRange]);

  // Enhanced analytics card component with tooltips
  const AnalyticsCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string;
    tooltip: string;
  }> = ({ title, value, icon, colorClass, tooltip }) => (
    <Tooltip title={tooltip} arrow>
      <Card className="h-full cursor-help">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className={`text-2xl font-bold ${colorClass}`}>
                {value}
              </p>
            </div>
            <div className={`${colorClass} opacity-60`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </Tooltip>
  );

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress size={60} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert severity="error" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <div>{error}</div>
        </Alert>
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Inactive Tenants Notification */}
        {inactiveTenants.length > 0 && (
          <Alert severity="warning" className="mb-4">
            <WarningIcon className="h-5 w-5" />
            <AlertTitle>Inactive Tenants Detected</AlertTitle>
            <div className="mt-2">
              <p className="text-sm mb-2">
                {inactiveTenants.length} tenant(s) have been inactive for more than 30 days:
              </p>
              <div className="flex flex-wrap gap-2">
                {inactiveTenants.slice(0, 3).map(tenant => (
                  <Chip 
                    key={tenant.id}
                    label={`${tenant.name} (${tenant.daysInactive} days)`}
                    size="small"
                    color="warning"
                  />
                ))}
                {inactiveTenants.length > 3 && (
                  <Chip 
                    label={`+${inactiveTenants.length - 3} more`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </div>
            </div>
          </Alert>
        )}

        {/* Header with Date Range Picker */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Platform Analytics
          </h1>
          
          <div className="flex items-center gap-4">
            <DatePicker
              label="Start Date"
              value={dateRange.start}
              onChange={(newValue) => setDateRange(prev => ({ ...prev, start: newValue }))}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date"
              value={dateRange.end}
              onChange={(newValue) => setDateRange(prev => ({ ...prev, end: newValue }))}
              slotProps={{ textField: { size: 'small' } }}
            />
            <Button 
              onClick={refreshData} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Apply Filter
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <AnalyticsCard
            title="Total Tenants"
            value={analyticsData?.totalTenants || 0}
            icon={<PeopleIcon style={{ fontSize: 32 }} />}
            colorClass="text-blue-600"
            tooltip="Total number of registered tenants on the platform"
          />
          <AnalyticsCard
            title="Active Users"
            value={analyticsData?.activeUsers || 0}
            icon={<UserIcon style={{ fontSize: 32 }} />}
            colorClass="text-green-600"
            tooltip="Number of users who have been active in the selected time period"
          />
          <AnalyticsCard
            title="Monthly Revenue"
            value={formatCurrency(analyticsData?.monthlyRevenue || 0)}
            icon={<MoneyIcon style={{ fontSize: 32 }} />}
            colorClass="text-amber-600"
            tooltip="Total revenue generated in the selected time period"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tenant Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant Growth Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tenantGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar 
                      dataKey="tenants" 
                      fill="#3b82f6"
                      name="Number of Tenants"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {tenantGrowth.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    No tenant growth data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Sales Chaser Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution by Sales Chaser</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByChaser}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {revenueByChaser.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {revenueByChaser.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    No revenue distribution data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sales Chasers Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Sales Chasers Performance</CardTitle>
              <TextField
                size="small"
                placeholder="Search by name or client count..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                className="md:w-80"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Clients Brought</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Revenue Generated</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Commission %</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Commission Due</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSalesChasers.map((chaser) => (
                    <tr key={chaser.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{chaser.name}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="secondary">{chaser.clientsBrought}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(chaser.revenueGenerated)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatPercentage(chaser.commissionPercentage)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {formatCurrency(chaser.commissionDue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* No results message */}
              {filteredSalesChasers.length === 0 && salesChasers.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    No sales chasers found matching "{searchTerm}"
                  </p>
                </div>
              )}
              
              {/* No data message */}
              {salesChasers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    No sales chasers data available
                  </p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(event, value) => setCurrentPage(value)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </div>
            )}
            
            {/* Results summary */}
            {filteredSalesChasers.length > 0 && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Showing {Math.min(filteredSalesChasers.length, itemsPerPage)} of {filteredSalesChasers.length} results
                {searchTerm && ` for "${searchTerm}"`}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LocalizationProvider>
  );
};

export default OwnerDashboard;
