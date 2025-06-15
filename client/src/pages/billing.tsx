import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  Clock, 
  DollarSign, 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  CreditCard,
  Settings,
  Timer,
  Calendar as CalendarIcon,
  Play,
  Pause,
  Square,
  Users,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Time tracking form schema
const timeEntrySchema = z.object({
  description: z.string().min(1, "Description is required"),
  hours: z.string().min(1, "Hours required"),
  clientId: z.string().optional(),
  caseId: z.string().optional(),
  customField: z.string().optional(),
  entryDate: z.date(),
});

// Invoice creation schema
const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  caseId: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
  dueDate: z.date(),
});

type TimeEntry = {
  id: number;
  description: string;
  hours: number;
  hourlyRate: number;
  clientId?: number;
  caseId?: number;
  customField?: string;
  entryDate: string;
  isLocked: boolean;
  invoiceId?: number;
  createdAt: string;
  client?: { firstName: string; lastName: string; };
  case?: { name: string; };
};

type Invoice = {
  id: number;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  client: { firstName: string; lastName: string; };
  case?: { name: string; };
  lineItems: InvoiceLineItem[];
};

type InvoiceLineItem = {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

type Client = {
  id: number;
  firstName: string;
  lastName: string;
};

type Case = {
  id: number;
  name: string;
  clientId: number;
};

// Timer component for active time tracking
function TimeTracker() {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [description, setDescription] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedCase, setSelectedCase] = useState<string>("");
  const { toast } = useToast();

  // Fetch clients and cases
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: cases = [] } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  const saveTimeMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/time-entries", data),
    onSuccess: () => {
      toast({ title: "Time entry saved successfully" });
      setSeconds(0);
      setDescription("");
      setSelectedClient("");
      setSelectedCase("");
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    setIsRunning(false);
    if (seconds > 0 && description) {
      const hours = seconds / 3600;
      saveTimeMutation.mutate({
        description,
        hours: Math.round(hours * 100), // Store as hundredths
        clientId: selectedClient ? parseInt(selectedClient) : undefined,
        caseId: selectedCase ? parseInt(selectedCase) : undefined,
        entryDate: new Date(),
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold mb-4">
            {formatTime(seconds)}
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleStart}
              disabled={isRunning}
              variant={isRunning ? "secondary" : "default"}
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
            <Button
              onClick={handlePause}
              disabled={!isRunning}
              variant="outline"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button
              onClick={handleStop}
              disabled={seconds === 0}
              variant="destructive"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop & Save
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Client</label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.firstName} {client.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Case</label>
            <Select value={selectedCase} onValueChange={setSelectedCase}>
              <SelectTrigger>
                <SelectValue placeholder="Select case" />
              </SelectTrigger>
              <SelectContent>
                {cases
                  .filter(c => !selectedClient || c.clientId.toString() === selectedClient)
                  .map((case_) => (
                    <SelectItem key={case_.id} value={case_.id.toString()}>
                      {case_.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Manual time entry form
function ManualTimeEntry() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof timeEntrySchema>>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      description: "",
      hours: "",
      entryDate: new Date(),
    },
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: cases = [] } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  const createTimeMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/time-entries", data),
    onSuccess: () => {
      toast({ title: "Time entry created successfully" });
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
    },
  });

  const onSubmit = (data: z.infer<typeof timeEntrySchema>) => {
    const hours = parseFloat(data.hours) * 100; // Convert to hundredths
    createTimeMutation.mutate({
      ...data,
      hours,
      clientId: data.clientId ? parseInt(data.clientId) : undefined,
      caseId: data.caseId ? parseInt(data.caseId) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Time Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Manual Time Entry</DialogTitle>
          <DialogDescription>
            Create a time entry for work already completed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Describe the work performed" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.25" placeholder="2.5" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Select date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.firstName} {client.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="caseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select case" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cases
                          .filter(c => !form.watch("clientId") || c.clientId.toString() === form.watch("clientId"))
                          .map((case_) => (
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
            </div>

            <FormField
              control={form.control}
              name="customField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Additional notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTimeMutation.isPending}>
                {createTimeMutation.isPending ? "Creating..." : "Create Entry"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Time entries list
function TimeEntriesList() {
  const { data: timeEntries = [], isLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });

  const lockMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PUT", `/api/time-entries/${id}/lock`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
    },
  });

  if (isLoading) {
    return <div>Loading time entries...</div>;
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatHours = (hundredths: number) => {
    return (hundredths / 100).toFixed(2);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Time Entries</CardTitle>
        <ManualTimeEntry />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Case</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  {format(new Date(entry.entryDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>
                  {entry.client ? `${entry.client.firstName} ${entry.client.lastName}` : "-"}
                </TableCell>
                <TableCell>{entry.case?.name || "-"}</TableCell>
                <TableCell>{formatHours(entry.hours)}</TableCell>
                <TableCell>{formatCurrency(entry.hourlyRate)}</TableCell>
                <TableCell>
                  {formatCurrency((entry.hours / 100) * entry.hourlyRate)}
                </TableCell>
                <TableCell>
                  {entry.isLocked ? (
                    <Badge variant="secondary">Locked</Badge>
                  ) : entry.invoiceId ? (
                    <Badge variant="outline">Billed</Badge>
                  ) : (
                    <Badge variant="default">Unbilled</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {!entry.isLocked && !entry.invoiceId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => lockMutation.mutate(entry.id)}
                    >
                      Lock
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Invoice creation and management
function InvoiceManagement() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: cases = [] } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/invoices", data),
    onSuccess: () => {
      setCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
  });

  const downloadInvoiceMutation = useMutation({
    mutationFn: (id: number) => apiRequest("GET", `/api/invoices/${id}/pdf`),
    onSuccess: (response) => {
      // Handle PDF download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${selectedInvoice?.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div>Loading invoices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Invoice Management</h3>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Generate an invoice from unbilled time entries.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createInvoiceMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.firstName} {client.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select case" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cases
                            .filter(c => !form.watch("clientId") || c.clientId.toString() === form.watch("clientId"))
                            .map((case_) => (
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
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full justify-start">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : "Select date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Payment terms and conditions" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Internal notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createInvoiceMutation.isPending}>
                    {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    {invoice.client.firstName} {invoice.client.lastName}
                  </TableCell>
                  <TableCell>{invoice.case?.name || "-"}</TableCell>
                  <TableCell>{formatCurrency(invoice.total)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadInvoiceMutation.mutate(invoice.id)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Preview Dialog */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Bill To:</h4>
                  <p>{selectedInvoice.client.firstName} {selectedInvoice.client.lastName}</p>
                  {selectedInvoice.case && <p>Re: {selectedInvoice.case.name}</p>}
                </div>
                <div className="text-right">
                  <p><strong>Invoice Date:</strong> {format(new Date(selectedInvoice.issueDate), "MMM d, yyyy")}</p>
                  <p><strong>Due Date:</strong> {format(new Date(selectedInvoice.dueDate), "MMM d, yyyy")}</p>
                  <p><strong>Status:</strong> 
                    <Badge className={`ml-2 ${getStatusColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </Badge>
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4">Line Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{(item.quantity / 100).toFixed(2)}</TableCell>
                        <TableCell>{formatCurrency(item.rate)}</TableCell>
                        <TableCell>{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div className="text-right space-y-2">
                <p><strong>Subtotal:</strong> {formatCurrency(selectedInvoice.subtotal)}</p>
                {selectedInvoice.taxAmount > 0 && (
                  <p><strong>Tax:</strong> {formatCurrency(selectedInvoice.taxAmount)}</p>
                )}
                <p className="text-lg"><strong>Total:</strong> {formatCurrency(selectedInvoice.total)}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Payment processing component
function PaymentProcessing() {
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  
  const { data: unpaidInvoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices", "unpaid"],
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: (data: { invoiceId: number; amount: number }) => 
      apiRequest("POST", "/api/create-payment-intent", data),
    onSuccess: (response: any) => {
      setClientSecret(response.clientSecret);
    },
  });

  const handleCreatePayment = () => {
    if (selectedInvoice && paymentAmount) {
      createPaymentIntentMutation.mutate({
        invoiceId: parseInt(selectedInvoice),
        amount: parseFloat(paymentAmount) * 100, // Convert to cents
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Select Invoice</label>
            <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
              <SelectTrigger>
                <SelectValue placeholder="Choose invoice to process payment" />
              </SelectTrigger>
              <SelectContent>
                {unpaidInvoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id.toString()}>
                    #{invoice.invoiceNumber} - {invoice.client.firstName} {invoice.client.lastName} - ${(invoice.total / 100).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Payment Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={handleCreatePayment}
          disabled={!selectedInvoice || !paymentAmount || createPaymentIntentMutation.isPending}
        >
          {createPaymentIntentMutation.isPending ? "Processing..." : "Create Payment"}
        </Button>

        {clientSecret && (
          <div className="border rounded-lg p-4">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm clientSecret={clientSecret} />
            </Elements>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Stripe payment form component
function PaymentForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/billing",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Payment has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe}>
        Process Payment
      </Button>
    </form>
  );
}

// Admin settings and controls
function AdminSettings() {
  const [billingSettings, setBillingSettings] = useState({
    paymentsEnabled: false,
    defaultPaymentTerms: 30,
    autoLockDays: 30,
    taxRate: 0,
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/billing/settings"],
    onSuccess: (data: any) => setBillingSettings(data),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", "/api/billing/settings", data),
    onSuccess: () => {
      toast({ title: "Settings updated successfully" });
    },
  });

  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Billing Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Online Payments</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBillingSettings(prev => ({
                  ...prev,
                  paymentsEnabled: !prev.paymentsEnabled
                }))}
              >
                {billingSettings.paymentsEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
            
            <div>
              <label className="text-sm font-medium">Default Payment Terms (days)</label>
              <Input
                type="number"
                value={billingSettings.defaultPaymentTerms}
                onChange={(e) => setBillingSettings(prev => ({
                  ...prev,
                  defaultPaymentTerms: parseInt(e.target.value)
                }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Auto-Lock Time Entries (days)</label>
              <Input
                type="number"
                value={billingSettings.autoLockDays}
                onChange={(e) => setBillingSettings(prev => ({
                  ...prev,
                  autoLockDays: parseInt(e.target.value)
                }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Tax Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={billingSettings.taxRate}
                onChange={(e) => setBillingSettings(prev => ({
                  ...prev,
                  taxRate: parseFloat(e.target.value)
                }))}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Payment Integration</h4>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Stripe integration is configured and ready to process payments.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">Stripe Connected</Badge>
                <Badge variant="secondary">Test Mode</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Export Time Entries
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Generate Financial Report
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Bulk Lock Time Entries
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => updateSettingsMutation.mutate(billingSettings)}
            disabled={updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main billing component
export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Time Tracking</h1>
        <p className="text-muted-foreground">
          Manage time entries, create invoices, and process payments
        </p>
      </div>

      <Tabs defaultValue="time-tracking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="time-tracking" className="space-y-6">
          <TimeTracker />
          <TimeEntriesList />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <InvoiceManagement />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentProcessing />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Billable Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">247.5</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,485</div>
                <p className="text-xs text-muted-foreground">8 invoices pending</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly billing performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Revenue chart placeholder - Integration with recharts pending
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}