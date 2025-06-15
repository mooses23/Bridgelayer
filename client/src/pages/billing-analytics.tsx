import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  Brain,
  Calendar
} from "lucide-react";

interface ProfitabilityData {
  caseId: number;
  clientId: number;
  totalHours: number;
  totalBilled: number;
  invoiceCount: number;
}

interface HourlyRateData {
  userId: number;
  avgRate: number;
  totalHours: number;
  totalBilled: number;
}

interface SystemAlert {
  id: number;
  alertType: string;
  title: string;
  message: string;
  severity: string;
  createdAt: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function BillingAnalytics() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formType, setFormType] = useState("1099");
  const [contractorData, setContractorData] = useState({
    name: "",
    address: "",
    taxId: "",
    totalPaid: ""
  });
  const { toast } = useToast();

  // Fetch profitability analytics
  const { data: profitabilityData = [], isLoading: profitabilityLoading } = useQuery({
    queryKey: ["profitability-analytics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/billing/analytics/profitability");
      return response as ProfitabilityData[];
    }
  });

  // Fetch hourly rate analytics
  const { data: hourlyRateData = [], isLoading: hourlyRateLoading } = useQuery({
    queryKey: ["hourly-rate-analytics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/billing/analytics/hourly-rates");
      return response as HourlyRateData[];
    }
  });

  // Fetch system alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["system-alerts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/billing/alerts");
      return response as SystemAlert[];
    }
  });

  // Generate 1099 form mutation
  const generate1099Mutation = useMutation({
    mutationFn: async (data: { year: number; contractorData: any }) => {
      return apiRequest("POST", "/api/billing/generate-1099", data);
    },
    onSuccess: (response) => {
      toast({
        title: "1099 Form Generated",
        description: "Your tax form has been generated successfully.",
      });
      // In production, this would trigger a download
      console.log("Generated form:", response);
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate the form. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mark alert as read mutation
  const markAlertReadMutation = useMutation({
    mutationFn: async (alertId: number) => {
      return apiRequest("PATCH", `/api/billing/alerts/${alertId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-alerts"] });
    }
  });

  // Prepare chart data
  const profitabilityChartData = profitabilityData.map((item, index) => ({
    name: `Case ${item.caseId}`,
    billed: item.totalBilled / 100,
    hours: item.totalHours / 60,
    efficiency: (item.totalBilled / 100) / (item.totalHours / 60) || 0
  }));

  const hourlyRateChartData = hourlyRateData.map((item, index) => ({
    name: `User ${item.userId}`,
    avgRate: item.avgRate / 100,
    totalBilled: item.totalBilled / 100,
    hours: item.totalHours / 60
  }));

  const handleGenerate1099 = () => {
    generate1099Mutation.mutate({
      year: selectedYear,
      contractorData
    });
  };

  const getSeverityBadge = (severity: string) => {
    const configs = {
      critical: { variant: "destructive" as const, icon: AlertTriangle },
      warning: { variant: "secondary" as const, icon: AlertTriangle },
      info: { variant: "default" as const, icon: CheckCircle },
      error: { variant: "destructive" as const, icon: AlertTriangle }
    };
    
    const config = configs[severity as keyof typeof configs] || configs.info;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {severity}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing Analytics</h1>
          <p className="text-gray-600">Advanced reporting and insights for your firm</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Billed</p>
                <p className="text-2xl font-bold">
                  ${profitabilityData.reduce((sum, item) => sum + item.totalBilled, 0) / 100}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">
                  {(profitabilityData.reduce((sum, item) => sum + item.totalHours, 0) / 60).toFixed(1)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold">{profitabilityData.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rate</p>
                <p className="text-2xl font-bold">
                  ${hourlyRateData.length > 0 ? 
                    (hourlyRateData.reduce((sum, item) => sum + item.avgRate, 0) / hourlyRateData.length / 100).toFixed(0) : 
                    '0'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Case Profitability</CardTitle>
          </CardHeader>
          <CardContent>
            {profitabilityLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitabilityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any, name: string) => 
                    name === 'billed' ? [`$${value}`, 'Billed'] : 
                    name === 'hours' ? [`${value}h`, 'Hours'] :
                    [`$${value}/h`, 'Efficiency']
                  } />
                  <Bar dataKey="billed" fill="#0088FE" />
                  <Bar dataKey="efficiency" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Hourly Rates Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {hourlyRateLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyRateChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any, name: string) => 
                    name === 'avgRate' ? [`$${value}`, 'Avg Rate'] : 
                    name === 'totalBilled' ? [`$${value}`, 'Total Billed'] :
                    [`${value}h`, 'Hours Worked']
                  } />
                  <Line type="monotone" dataKey="avgRate" stroke="#8884D8" strokeWidth={2} />
                  <Line type="monotone" dataKey="hours" stroke="#82CA9D" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Form Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Form Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Form Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1099">1099-NEC (Contractor Payments)</SelectItem>
                  <SelectItem value="invoice_template">Invoice Template</SelectItem>
                  <SelectItem value="retainer_agreement">Retainer Agreement</SelectItem>
                  <SelectItem value="billing_summary">Billing Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tax Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formType === "1099" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Contractor Name</Label>
                  <Input
                    value={contractorData.name}
                    onChange={(e) => setContractorData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={contractorData.address}
                    onChange={(e) => setContractorData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID (SSN/EIN)</Label>
                  <Input
                    value={contractorData.taxId}
                    onChange={(e) => setContractorData(prev => ({ ...prev, taxId: e.target.value }))}
                    placeholder="123-45-6789"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Paid Amount</Label>
                  <Input
                    type="number"
                    value={contractorData.totalPaid}
                    onChange={(e) => setContractorData(prev => ({ ...prev, totalPaid: e.target.value }))}
                    placeholder="15000.00"
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={handleGenerate1099}
              disabled={generate1099Mutation.isPending}
              className="w-full"
            >
              {generate1099Mutation.isPending ? "Generating..." : `Generate ${formType.toUpperCase()}`}
            </Button>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">No active alerts</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{alert.title}</h4>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAlertReadMutation.mutate(alert.id)}
                        disabled={markAlertReadMutation.isPending}
                      >
                        Mark Read
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend (Placeholder for future implementation) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Revenue trend analysis will be available with more billing data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}