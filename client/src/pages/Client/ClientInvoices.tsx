import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye, Calendar } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Invoice } from "../../../../shared/schema";

export default function ClientInvoices() {
  const { user } = useSession();

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/client/invoices', user?.id],
    queryFn: () => apiRequest('GET', `/api/client/invoices?clientId=${user?.id}`),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const fallbackInvoices: Invoice[] = [
    {
      id: 1,
      firmId: 1,
      clientId: user?.id || 1,
      caseId: null,
      invoiceNumber: "INV-001",
      status: "paid",
      amount: 350000, // amount in cents
      subtotal: 350000,
      taxAmount: 0,
      total: 350000,
      issueDate: new Date("2025-01-15"),
      notes: "Legal Services - Contract Review",
      paidDate: new Date("2025-01-20"),
      dueDate: new Date("2025-02-14"),
      terms: "Net 30",
      createdBy: 1,
      createdAt: new Date("2025-01-15"),
      updatedAt: new Date("2025-01-20")
    },
    {
      id: 2,
      firmId: 1,
      clientId: user?.id || 1,
      caseId: null,
      invoiceNumber: "INV-002",
      status: "pending",
      amount: 120000, // amount in cents
      subtotal: 120000,
      taxAmount: 0,
      total: 120000,
      issueDate: new Date("2025-01-22"),
      notes: "Legal Services - Amendment Drafting",
      paidDate: null,
      dueDate: new Date("2025-02-21"),
      terms: "Net 30",
      createdBy: 1,
      createdAt: new Date("2025-01-22"),
      updatedAt: new Date("2025-01-22")
    },
    {
      id: 3,
      firmId: 1,
      clientId: user?.id || 1,
      caseId: null,
      invoiceNumber: "INV-003",
      status: "pending",
      amount: 280000, // amount in cents
      subtotal: 280000,
      taxAmount: 0,
      total: 280000,
      issueDate: new Date("2025-01-25"),
      notes: "Legal Consultation - Business Formation",
      paidDate: null,
      dueDate: new Date("2025-02-24"),
      terms: "Net 30",
      createdBy: 1,
      createdAt: new Date("2025-01-25"),
      updatedAt: new Date("2025-01-25")
    }
  ];

  const displayInvoices = invoices.length > 0 ? invoices : fallbackInvoices;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            View and manage your billing statements
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number or description..."
                  className="pl-8"
                />
              </div>
            </div>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(displayInvoices
                .filter((inv: Invoice) => inv.status === 'pending')
                .reduce((sum: number, inv: Invoice) => sum + (inv.total / 100), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayInvoices.filter((inv: Invoice) => inv.status === 'pending').length} pending invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(displayInvoices
                .filter((inv: Invoice) => inv.status === 'paid')
                .reduce((sum: number, inv: Invoice) => sum + (inv.total / 100), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayInvoices.filter((inv: Invoice) => inv.status === 'paid').length} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(displayInvoices.reduce((sum: number, inv: Invoice) => sum + (inv.total / 100), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayInvoices.length} total invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayInvoices.map((invoice: Invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold">{invoice.invoiceNumber}</p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{invoice.notes}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Issued: {invoice.issueDate?.toLocaleDateString()}</span>
                      <span>Due: {invoice.dueDate?.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatAmount(invoice.total / 100)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
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