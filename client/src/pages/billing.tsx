import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Clock, 
  Plus, 
  FileText, 
  DollarSign, 
  Settings, 
  Upload,
  Edit,
  Trash2,
  Lock,
  GripVertical,
  Download,
  Eye,
  Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Form schemas
const timeLogSchema = z.object({
  clientId: z.string().optional(),
  caseId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  hours: z.string().min(1, "Hours is required"),
  customField: z.string().optional(),
  loggedAt: z.string().min(1, "Date is required")
});

const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional()
});

const caseSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  name: z.string().min(1, "Case name is required"),
  description: z.string().optional(),
  caseNumber: z.string().optional(),
  billingType: z.enum(["hourly", "flat", "contingency"]),
  hourlyRate: z.string().optional(),
  flatFee: z.string().optional(),
  contingencyRate: z.string().optional()
});

const billingSettingsSchema = z.object({
  defaultHourlyRate: z.string().min(1, "Default hourly rate is required"),
  defaultFlatRate: z.string().optional(),
  defaultContingencyRate: z.string().optional(),
  invoiceTerms: z.string().optional(),
  billingPlatform: z.string().optional(),
  billingPlatformUrl: z.string().optional(),
  lockTimeLogsAfterDays: z.string().optional(),
  hideAnalyticsTab: z.boolean().optional(),
  billingEnabled: z.boolean()
});

export default function Billing() {
  const [activeTab, setActiveTab] = useState("time-tracking");
  const [showTimeLogDialog, setShowTimeLogDialog] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showCaseDialog, setShowCaseDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editingTimeLog, setEditingTimeLog] = useState<any>(null);
  const [selectedTimeLogs, setSelectedTimeLogs] = useState<number[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch billing data
  const { data: billingSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/billing/settings"],
    queryFn: () => fetch("/api/billing/settings").then(res => res.json())
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/billing/clients"],
    queryFn: () => fetch("/api/billing/clients").then(res => res.json())
  });

  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ["/api/billing/cases"],
    queryFn: () => fetch("/api/billing/cases").then(res => res.json())
  });

  const { data: timeLogs, isLoading: timeLogsLoading } = useQuery({
    queryKey: ["/api/billing/time-logs"],
    queryFn: () => fetch("/api/billing/time-logs").then(res => res.json())
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/billing/invoices"],
    queryFn: () => fetch("/api/billing/invoices").then(res => res.json())
  });

  // Mutations
  const createTimeLogMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/billing/time-logs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing/time-logs"] });
      setShowTimeLogDialog(false);
      toast({ title: "Time log created successfully" });
    }
  });

  const createClientMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/billing/clients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing/clients"] });
      setShowClientDialog(false);
      toast({ title: "Client created successfully" });
    }
  });

  const createCaseMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/billing/cases", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing/cases"] });
      setShowCaseDialog(false);
      toast({ title: "Case created successfully" });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", "/api/billing/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing/settings"] });
      toast({ title: "Billing settings updated successfully" });
    }
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/billing/invoices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/time-logs"] });
      setSelectedTimeLogs([]);
      toast({ title: "Invoice created successfully" });
    }
  });

  // Forms
  const timeLogForm = useForm({
    resolver: zodResolver(timeLogSchema),
    defaultValues: {
      description: "",
      hours: "",
      customField: "",
      loggedAt: new Date().toISOString().split('T')[0]
    }
  });

  const clientForm = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: "", email: "", phone: "", address: "" }
  });

  const caseForm = useForm({
    resolver: zodResolver(caseSchema),
    defaultValues: { 
      clientId: "", 
      name: "", 
      description: "", 
      caseNumber: "", 
      billingType: "hourly" as const,
      hourlyRate: "",
      flatFee: "",
      contingencyRate: ""
    }
  });

  const settingsForm = useForm({
    resolver: zodResolver(billingSettingsSchema),
    defaultValues: {
      defaultHourlyRate: billingSettings?.defaultHourlyRate ? (billingSettings.defaultHourlyRate / 100).toString() : "250",
      defaultFlatRate: billingSettings?.defaultFlatRate ? (billingSettings.defaultFlatRate / 100).toString() : "5000",
      defaultContingencyRate: billingSettings?.defaultContingencyRate ? (billingSettings.defaultContingencyRate / 100).toString() : "33",
      invoiceTerms: billingSettings?.invoiceTerms || "Payment due within 30 days",
      billingPlatform: billingSettings?.billingPlatform || "",
      billingPlatformUrl: billingSettings?.billingPlatformUrl || "",
      lockTimeLogsAfterDays: billingSettings?.lockTimeLogsAfterDays?.toString() || "30",
      hideAnalyticsTab: billingSettings?.hideAnalyticsTab || false,
      billingEnabled: billingSettings?.billingEnabled || false
    }
  });

  // Helper functions
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const parseHours = (hoursStr: string) => {
    const [hours, minutes = "0"] = hoursStr.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  };

  const handleCreateInvoice = () => {
    if (selectedTimeLogs.length === 0) {
      toast({ title: "Please select time logs to include in the invoice", variant: "destructive" });
      return;
    }

    const selectedLogs = timeLogs?.filter((log: any) => selectedTimeLogs.includes(log.id));
    const clientId = selectedLogs[0]?.clientId;
    
    if (!clientId) {
      toast({ title: "Selected time logs must have a client assigned", variant: "destructive" });
      return;
    }

    // Check if all selected logs are for the same client
    const allSameClient = selectedLogs.every((log: any) => log.clientId === clientId);
    if (!allSameClient) {
      toast({ title: "All selected time logs must be for the same client", variant: "destructive" });
      return;
    }

    const subtotal = selectedLogs.reduce((total: number, log: any) => {
      const hours = log.hours / 60;
      const rate = log.billableRate || billingSettings?.defaultHourlyRate || 25000;
      return total + (hours * rate);
    }, 0);

    const invoiceData = {
      clientId,
      subtotal,
      total: subtotal,
      timeLogIds: selectedTimeLogs,
      status: "draft"
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  // Check if billing is enabled
  if (!billingSettings?.billingEnabled && !settingsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing & Time Tracking</h1>
            <p className="text-gray-600">Manage time tracking, invoicing, and billing for your firm</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Setup Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Billing features are not enabled for your firm. Please configure your billing settings to get started.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="billingPlatform">Billing Platform</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your billing platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="lawpay">LawPay</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="billingUrl">Billing Platform URL (Optional)</Label>
                <Input 
                  id="billingUrl"
                  placeholder="https://your-billing-platform.com/embed"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter an iframe or embed URL to display your existing billing interface
                </p>
              </div>

              <Button 
                onClick={() => setShowSettingsDialog(true)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configure Billing Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Time Tracking</h1>
          <p className="text-gray-600">Manage time tracking, invoicing, and billing for your firm</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowSettingsDialog(true)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button 
            onClick={() => setShowTimeLogDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Time
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
          <TabsTrigger value="clients-cases">Clients & Cases</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Time Tracking Tab */}
        <TabsContent value="time-tracking" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Recent Time Entries</h3>
              {selectedTimeLogs.length > 0 && (
                <Badge variant="secondary">
                  {selectedTimeLogs.length} selected
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {selectedTimeLogs.length > 0 && (
                <Button 
                  onClick={handleCreateInvoice}
                  className="flex items-center gap-2"
                  disabled={createInvoiceMutation.isPending}
                >
                  <FileText className="w-4 h-4" />
                  Create Invoice
                </Button>
              )}
              <Button 
                onClick={() => setShowTimeLogDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Log Time
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedTimeLogs.length === timeLogs?.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTimeLogs(timeLogs?.map((log: any) => log.id) || []);
                          } else {
                            setSelectedTimeLogs([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client/Case</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeLogs?.map((log: any) => {
                    const client = clients?.find((c: any) => c.id === log.clientId);
                    const case_ = cases?.find((c: any) => c.id === log.caseId);
                    const hours = log.hours / 60;
                    const rate = log.billableRate || billingSettings?.defaultHourlyRate || 25000;
                    const amount = hours * rate;

                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedTimeLogs.includes(log.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTimeLogs([...selectedTimeLogs, log.id]);
                              } else {
                                setSelectedTimeLogs(selectedTimeLogs.filter(id => id !== log.id));
                              }
                            }}
                            disabled={log.isLocked || log.invoiceId}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(log.loggedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{client?.name || "No Client"}</div>
                            {case_ && <div className="text-sm text-gray-500">{case_.name}</div>}
                          </div>
                        </TableCell>
                        <TableCell>{log.description}</TableCell>
                        <TableCell>{formatHours(log.hours)}</TableCell>
                        <TableCell>{formatCurrency(rate)}</TableCell>
                        <TableCell>{formatCurrency(amount)}</TableCell>
                        <TableCell>
                          {log.invoiceId ? (
                            <Badge variant="default">Billed</Badge>
                          ) : log.isLocked ? (
                            <Badge variant="secondary">Locked</Badge>
                          ) : (
                            <Badge variant="outline">Unbilled</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTimeLog(log);
                                setShowTimeLogDialog(true);
                              }}
                              disabled={log.isLocked}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            {log.isLocked && (
                              <Lock className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoicing Tab */}
        <TabsContent value="invoicing" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Invoices</h3>
            <Button 
              onClick={handleCreateInvoice}
              className="flex items-center gap-2"
              disabled={selectedTimeLogs.length === 0}
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices?.map((invoice: any) => {
                    const client = clients?.find((c: any) => c.id === invoice.clientId);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber || `INV-${invoice.id}`}
                        </TableCell>
                        <TableCell>{client?.name}</TableCell>
                        <TableCell>
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              invoice.status === 'paid' ? 'default' :
                              invoice.status === 'sent' ? 'secondary' :
                              invoice.status === 'overdue' ? 'destructive' : 'outline'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clients & Cases Tab */}
        <TabsContent value="clients-cases" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clients Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Clients</CardTitle>
                  <Button 
                    onClick={() => setShowClientDialog(true)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Client
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients?.map((client: any) => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        {client.email && <div className="text-sm text-gray-500">{client.email}</div>}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cases Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Cases</CardTitle>
                  <Button 
                    onClick={() => setShowCaseDialog(true)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Case
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cases?.map((case_: any) => {
                    const client = clients?.find((c: any) => c.id === case_.clientId);
                    return (
                      <div key={case_.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{case_.name}</div>
                          <div className="text-sm text-gray-500">{client?.name}</div>
                          <Badge variant="outline" className="mt-1">
                            {case_.billingType}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Billable Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeLogs ? formatHours(timeLogs.reduce((total: number, log: any) => total + log.hours, 0)) : "0:00"}
                </div>
                <p className="text-sm text-gray-500">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outstanding Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invoices ? 
                    formatCurrency(
                      invoices
                        .filter((inv: any) => inv.status !== 'paid')
                        .reduce((total: number, inv: any) => total + inv.total, 0)
                    ) : "$0.00"
                  }
                </div>
                <p className="text-sm text-gray-500">
                  {invoices?.filter((inv: any) => inv.status !== 'paid').length || 0} invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unbilled Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeLogs ? 
                    formatCurrency(
                      timeLogs
                        .filter((log: any) => !log.invoiceId)
                        .reduce((total: number, log: any) => {
                          const hours = log.hours / 60;
                          const rate = log.billableRate || billingSettings?.defaultHourlyRate || 25000;
                          return total + (hours * rate);
                        }, 0)
                    ) : "$0.00"
                  }
                </div>
                <p className="text-sm text-gray-500">Ready to bill</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Time Log Dialog */}
      <Dialog open={showTimeLogDialog} onOpenChange={setShowTimeLogDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTimeLog ? "Edit Time Log" : "Log Time"}</DialogTitle>
          </DialogHeader>
          <Form {...timeLogForm}>
            <form onSubmit={timeLogForm.handleSubmit((data) => {
              const hours = parseHours(data.hours);
              const logData = {
                ...data,
                hours,
                loggedAt: new Date(data.loggedAt),
                clientId: data.clientId ? parseInt(data.clientId) : null,
                caseId: data.caseId ? parseInt(data.caseId) : null
              };
              createTimeLogMutation.mutate(logData);
            })} className="space-y-4">
              <FormField
                control={timeLogForm.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client: any) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={timeLogForm.control}
                name="caseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a case" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cases?.map((case_: any) => (
                          <SelectItem key={case_.id} value={case_.id.toString()}>
                            {case_.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={timeLogForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describe the work performed..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={timeLogForm.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours (e.g., 2:30 for 2.5 hours)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1:30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={timeLogForm.control}
                name="customField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Field (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Additional information..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={timeLogForm.control}
                name="loggedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowTimeLogDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTimeLogMutation.isPending}
                >
                  {createTimeLogMutation.isPending ? "Saving..." : "Save Time Log"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Client Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <Form {...clientForm}>
            <form onSubmit={clientForm.handleSubmit((data) => {
              createClientMutation.mutate(data);
            })} className="space-y-4">
              <FormField
                control={clientForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Client name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={clientForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="client@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={clientForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={clientForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Client address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowClientDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createClientMutation.isPending}
                >
                  {createClientMutation.isPending ? "Creating..." : "Create Client"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Case Dialog */}
      <Dialog open={showCaseDialog} onOpenChange={setShowCaseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Case</DialogTitle>
          </DialogHeader>
          <Form {...caseForm}>
            <form onSubmit={caseForm.handleSubmit((data) => {
              const caseData = {
                ...data,
                clientId: parseInt(data.clientId),
                hourlyRate: data.hourlyRate ? Math.round(parseFloat(data.hourlyRate) * 100) : null,
                flatFee: data.flatFee ? Math.round(parseFloat(data.flatFee) * 100) : null,
                contingencyRate: data.contingencyRate ? Math.round(parseFloat(data.contingencyRate) * 100) : null
              };
              createCaseMutation.mutate(caseData);
            })} className="space-y-4">
              <FormField
                control={caseForm.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client: any) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={caseForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Case name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={caseForm.control}
                name="caseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Number (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Case number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={caseForm.control}
                name="billingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="flat">Flat Fee</SelectItem>
                        <SelectItem value="contingency">Contingency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {caseForm.watch("billingType") === "hourly" && (
                <FormField
                  control={caseForm.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="250.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {caseForm.watch("billingType") === "flat" && (
                <FormField
                  control={caseForm.control}
                  name="flatFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flat Fee</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="5000.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {caseForm.watch("billingType") === "contingency" && (
                <FormField
                  control={caseForm.control}
                  name="contingencyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contingency Rate (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="33" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={caseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Case description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCaseDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCaseMutation.isPending}
                >
                  {createCaseMutation.isPending ? "Creating..." : "Create Case"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Billing Settings</DialogTitle>
          </DialogHeader>
          <Form {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit((data) => {
              const settingsData = {
                ...data,
                defaultHourlyRate: Math.round(parseFloat(data.defaultHourlyRate) * 100),
                defaultFlatRate: data.defaultFlatRate ? Math.round(parseFloat(data.defaultFlatRate) * 100) : null,
                defaultContingencyRate: data.defaultContingencyRate ? Math.round(parseFloat(data.defaultContingencyRate) * 100) : null,
                lockTimeLogsAfterDays: data.lockTimeLogsAfterDays ? parseInt(data.lockTimeLogsAfterDays) : null
              };
              updateSettingsMutation.mutate(settingsData);
            })} className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Rate Structure</h4>
                
                <FormField
                  control={settingsForm.control}
                  name="defaultHourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="250.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="defaultFlatRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Flat Fee ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="5000.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="defaultContingencyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Contingency Rate (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="33" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Invoice Settings</h4>
                
                <FormField
                  control={settingsForm.control}
                  name="invoiceTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Invoice Terms</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Payment due within 30 days" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label>Firm Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </Button>
                    <span className="text-sm text-gray-500">
                      Upload your firm logo for invoices
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Billing Platform</h4>
                
                <FormField
                  control={settingsForm.control}
                  name="billingPlatform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Platform</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select billing platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="lawpay">LawPay</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="billingPlatformUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Platform URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://your-billing-platform.com/embed" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Access Controls</h4>
                
                <FormField
                  control={settingsForm.control}
                  name="lockTimeLogsAfterDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lock Time Logs After (Days)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="hideAnalyticsTab"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Hide Analytics Tab</FormLabel>
                        <div className="text-sm text-gray-500">
                          Hide the analytics tab for non-admin users
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="billingEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Billing Features</FormLabel>
                        <div className="text-sm text-gray-500">
                          Enable time tracking and billing for your firm
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowSettingsDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}