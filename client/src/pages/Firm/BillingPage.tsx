
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Clock, FileText, TrendingUp, Plus, Download } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useSession } from "@/contexts/SessionContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timeEntrySchema, invoiceSchema } from "@shared/validation";

interface TimeEntryFormData {
  clientId: number;
  caseId?: number | null;
  description: string;
  hours: number;
  billableRate: number;
  date: Date;
  billable: boolean;
}

export default function BillingPage() {
  const { tenant } = useTenant();
  const { user } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTimeForm, setShowTimeForm] = useState(false);

  // Time entry form validation
  const {
    register: registerTime,
    handleSubmit: handleTimeSubmit,
    formState: { errors: timeErrors, isSubmitting: isTimeSubmitting },
    setValue: setTimeValue,
    reset: resetTimeForm
  } = useForm({
    resolver: yupResolver(timeEntrySchema),
    defaultValues: {
      billable: true,
      date: new Date()
    }
  });

  const { data: firm } = useQuery({
    queryKey: ["firm", user?.firmId],
    queryFn: () => fetch(`/api/firm`, { credentials: "include" }).then(r => r.json()),
    enabled: !!user?.firmId
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", firm?.slug],
    queryFn: () => fetch(`/api/app/billing/${firm?.slug}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!firm?.slug
  });

  const { data: timeLogs, isLoading: timeLogsLoading } = useQuery({
    queryKey: ["timeLogs", firm?.slug],
    queryFn: () => fetch(`/api/app/time-entries/${firm?.slug}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!firm?.slug
  });

  const { data: billingSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["billingSummary", firm?.slug],
    queryFn: () => fetch(`/api/app/dashboard/${firm?.slug}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!firm?.slug
  });

  const addTimeMutation = useMutation({
    mutationFn: (entry: TimeEntryFormData) => 
      fetch("/api/app/time-entries", { 
        method: "POST", 
        credentials: "include", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ firmId: user?.firmId, ...entry }) 
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create time entry');
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Time entry created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["timeLogs", firm?.slug] });
      queryClient.invalidateQueries({ queryKey: ["billingSummary", firm?.slug] });
      resetTimeForm();
      setShowTimeForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create time entry",
        variant: "destructive"
      });
    }
  });

  const onTimeSubmit = (data: TimeEntryFormData) => {
    addTimeMutation.mutate(data);
  };

  // Fallback data for when API is not available
  const fallbackInvoices = [
    {
      id: "INV-001",
      client: "ABC Corporation",
      amount: 15750.00,
      status: "Paid",
      date: "Jan 15, 2025",
      dueDate: "Jan 30, 2025"
    },
    {
      id: "INV-002",
      client: "Tech Startup Inc",
      amount: 8900.00,
      status: "Pending",
      date: "Jan 18, 2025",
      dueDate: "Feb 2, 2025"
    },
    {
      id: "INV-003",
      client: "Property Holdings LLC",
      amount: 12300.00,
      status: "Overdue",
      date: "Dec 28, 2024",
      dueDate: "Jan 12, 2025"
    }
  ];

  const fallbackTimeEntries = [
    {
      id: 1,
      attorney: "Sarah Wilson",
      client: "ABC Corporation",
      description: "Contract review and analysis",
      hours: 3.5,
      rate: 450,
      date: "Jan 22, 2025"
    },
    {
      id: 2,
      attorney: "John Davis",
      client: "Tech Startup Inc",
      description: "Employment agreement drafting",
      hours: 2.0,
      rate: 375,
      date: "Jan 22, 2025"
    },
    {
      id: 3,
      attorney: "Emily Chen",
      client: "Property Holdings LLC",
      description: "Due diligence review",
      hours: 4.25,
      rate: 425,
      date: "Jan 21, 2025"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Time Tracking</h1>
          <p className="text-gray-600">Manage invoices, time entries, and billing analytics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : billingSummary?.totalRevenue ?? "$245,890"}
            </div>
            <p className="text-xs text-muted-foreground">
              {billingSummary?.revenueChange ?? "+12% from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : billingSummary?.outstanding ?? "$36,950"}
            </div>
            <p className="text-xs text-muted-foreground">
              {billingSummary?.overdueInvoices ?? "3 overdue invoices"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : billingSummary?.billableHours ?? "142.5"}
            </div>
            <p className="text-xs text-muted-foreground">
              {billingSummary?.hoursPeriod ?? "This month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$415</div>
            <p className="text-xs text-muted-foreground">Per hour</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(invoices || fallbackInvoices).map((invoice: any) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{invoice.id}</p>
                    <p className="text-sm text-gray-600">{invoice.client}</p>
                    <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Time Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(timeLogs || fallbackTimeEntries).map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="space-y-1 flex-1">
                    <p className="font-medium text-gray-900">{entry.attorney}</p>
                    <p className="text-sm text-gray-600">{entry.description}</p>
                    <p className="text-xs text-gray-500">{entry.client} • {entry.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold">{entry.hours}h</p>
                    <p className="text-sm text-gray-600">{formatCurrency(entry.hours * entry.rate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Entry Form */}
        {showTimeForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Time Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTimeSubmit(onTimeSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientId">Client *</Label>
                    <Input
                      id="clientId"
                      type="number"
                      {...registerTime("clientId", { valueAsNumber: true })}
                      placeholder="Client ID"
                    />
                    {timeErrors.clientId && (
                      <p className="text-sm text-red-600 mt-1">{timeErrors.clientId.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="caseId">Case ID (Optional)</Label>
                    <Input
                      id="caseId"
                      type="number"
                      {...registerTime("caseId", { valueAsNumber: true })}
                      placeholder="Case ID"
                    />
                    {timeErrors.caseId && (
                      <p className="text-sm text-red-600 mt-1">{timeErrors.caseId.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="hours">Hours *</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.25"
                      {...registerTime("hours", { valueAsNumber: true })}
                      placeholder="Hours worked"
                    />
                    {timeErrors.hours && (
                      <p className="text-sm text-red-600 mt-1">{timeErrors.hours.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="billableRate">Billable Rate *</Label>
                    <Input
                      id="billableRate"
                      type="number"
                      step="0.01"
                      {...registerTime("billableRate", { valueAsNumber: true })}
                      placeholder="Rate per hour"
                    />
                    {timeErrors.billableRate && (
                      <p className="text-sm text-red-600 mt-1">{timeErrors.billableRate.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      {...registerTime("date", { valueAsDate: true })}
                    />
                    {timeErrors.date && (
                      <p className="text-sm text-red-600 mt-1">{timeErrors.date.message}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="billable"
                      type="checkbox"
                      {...registerTime("billable")}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="billable">Billable</Label>
                    {timeErrors.billable && (
                      <p className="text-sm text-red-600 mt-1">{timeErrors.billable.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...registerTime("description")}
                    placeholder="Describe the work performed"
                    rows={3}
                  />
                  {timeErrors.description && (
                    <p className="text-sm text-red-600 mt-1">{timeErrors.description.message}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    disabled={isTimeSubmitting}
                    className="flex-1"
                  >
                    {isTimeSubmitting ? "Creating..." : "Create Time Entry"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowTimeForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Add Time Entry Button */}
      {!showTimeForm && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => setShowTimeForm(true)}
            size="lg"
            className="rounded-full shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Time
          </Button>
        </div>
      )}
    </div>
  );
}
