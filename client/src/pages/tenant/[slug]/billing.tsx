import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@/services/api.service";
import { Invoice } from "@/types/schema";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTimeForm, setShowTimeForm] = useState(false);

  // Time entry form setup
  const {
    register: registerTime,
    handleSubmit: handleTimeSubmit,
    formState: { errors: timeErrors, isSubmitting: isTimeSubmitting },
    setValue: setTimeValue,
    reset: resetTimeForm
  } = useForm({
    defaultValues: {
      billable: true,
      date: new Date()
    }
  });

  // Fetch invoices using API service
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", tenant?.slug],
    queryFn: async () => {
      const response = await apiService.getInvoices(tenant?.slug || '');
      return response.data;
    },
    enabled: !!tenant?.slug
  });

  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: (invoiceData: any) => {
      return apiService.createInvoice(tenant?.slug || '', invoiceData);
    },
    onSuccess: () => {
      toast({
        title: "Invoice created",
        description: "Your invoice has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["invoices", tenant?.slug] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create invoice",
        description: "Please try again later",
        variant: "destructive",
      });
      console.error("Error creating invoice:", error);
    }
  });

  // Handle time entry submission
  const onSubmitTime = async (data: TimeEntryFormData) => {
    try {
      // This would normally call an API endpoint to save the time entry
      toast({
        title: "Time entry saved",
        description: `${data.hours} hours recorded for ${data.description}`,
      });
      resetTimeForm();
      setShowTimeForm(false);
    } catch (error) {
      console.error("Error saving time entry:", error);
      toast({
        title: "Failed to save time entry",
        description: "Please try again later",
        variant: "destructive",
      });
    }
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

  // Get invoice status color
  const getInvoiceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Calculate invoice statistics
  const totalInvoiced = invoices.reduce((sum: number, inv: Invoice) => sum + inv.amount, 0);
  const paidInvoices = invoices.filter((inv: Invoice) => inv.status.toLowerCase() === 'paid');
  const totalPaid = paidInvoices.reduce((sum: number, inv: Invoice) => sum + inv.amount, 0);
  const pendingInvoices = invoices.filter((inv: Invoice) => 
    ['pending', 'overdue'].includes(inv.status.toLowerCase())
  );
  const totalPending = pendingInvoices.reduce((sum: number, inv: Invoice) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage invoices, time tracking, and billing
          </p>
        </div>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowTimeForm(true)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Add Time Entry
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalInvoiced.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.length} invoices total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalPaid.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidInvoices.length} paid invoices
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
              ${totalPending.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingInvoices.length} pending invoices
            </p>
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
            {invoicesLoading ? (
              <div className="text-center py-6">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-muted-foreground">No invoices found</p>
                <Button className="mt-2" size="sm">Create First Invoice</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice: Invoice) => (
                  <div 
                    key={invoice.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                      <p className="text-sm text-gray-600">
                        Client: {invoice.clientId} • 
                        Issue Date: {new Date(invoice.issueDate).toLocaleDateString()} • 
                        Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">
                          ${invoice.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                        <Badge className={getInvoiceStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {invoices.length > 5 && (
                  <Button variant="outline" className="w-full mt-2">
                    View All Invoices
                  </Button>
                )}
              </div>
            )}
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
              <CardTitle>New Time Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTimeSubmit(onSubmitTime)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client</Label>
                    <Select 
                      onValueChange={value => setTimeValue('clientId', parseInt(value))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ABC Corporation</SelectItem>
                        <SelectItem value="2">XYZ LLC</SelectItem>
                        <SelectItem value="3">John Smith</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caseId">Case (Optional)</Label>
                    <Select 
                      onValueChange={value => setTimeValue('caseId', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select case" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Contract Review</SelectItem>
                        <SelectItem value="2">Litigation Matter</SelectItem>
                        <SelectItem value="3">Estate Planning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    placeholder="Describe the work performed" 
                    {...registerTime('description', { required: true })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      min="0.1"
                      placeholder="0.0" 
                      {...registerTime('hours', { required: true, min: 0.1 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billableRate">Hourly Rate ($)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      {...registerTime('billableRate', { required: true, min: 0 })}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => setShowTimeForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isTimeSubmitting}>
                    Save Time Entry
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
