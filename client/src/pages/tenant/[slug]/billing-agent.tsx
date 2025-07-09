import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, FileText, TrendingUp, Plus } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery } from '@tanstack/react-query';
import AgentForm from '@/components/forms/AgentForm';
import { agentFormConfigs } from '@/components/forms/agentFormConfigs';

export default function AgentBillingPage() {
  const { tenant } = useTenant();
  const [activeForm, setActiveForm] = useState<string | null>(null);

  // Query existing data through agent
  const { data: billingData = [], isLoading } = useQuery({
    queryKey: ['billing', tenant?.id],
    queryFn: async () => {
      const response = await fetch('/api/agent/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          tenantId: tenant?.id,
          agentType: 'BILLING_AGENT',
          action: 'GET_BILLING_DATA'
        })
      });
      
      if (!response.ok) {
        // Fallback to mock data if agent is not available
        return {
          timeEntries: [
            {
              id: 1,
              attorney: 'Sarah Wilson',
              client: 'ABC Corporation',
              description: 'Contract review and analysis',
              hours: 3.5,
              rate: 450,
              date: 'Jan 22, 2025'
            }
          ],
          invoices: [
            {
              id: 'INV-001',
              client: 'ABC Corporation', 
              amount: 15750.00,
              status: 'Paid',
              date: 'Jan 15, 2025',
              dueDate: 'Jan 30, 2025'
            }
          ]
        };
      }
      
      return response.json();
    },
    enabled: !!tenant?.id
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFormSuccess = (data: any) => {
    setActiveForm(null);
    // Data will be automatically refetched due to query invalidation in AgentForm
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading billing data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage time entries, invoices, and billing through your billing agent
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setActiveForm('timeEntry')}>
            <Clock className="h-4 w-4 mr-2" />
            Log Time
          </Button>
          <Button onClick={() => setActiveForm('invoice')} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Agent Form Modal */}
      {activeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AgentForm
              config={agentFormConfigs[activeForm as keyof typeof agentFormConfigs]}
              onSuccess={handleFormSuccess}
              onCancel={() => setActiveForm(null)}
            />
          </div>
        </div>
      )}

      {/* Billing Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,430</div>
            <p className="text-xs text-muted-foreground">
              3 invoices pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142.5</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Hourly Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$425</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingData.invoices?.map((invoice: any) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{invoice.id}</span>
                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{invoice.client}</p>
                  <p className="text-xs text-muted-foreground">Due: {invoice.dueDate}</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">${invoice.amount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{invoice.date}</p>
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
            {billingData.timeEntries?.map((entry: any) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{entry.description}</div>
                  <p className="text-sm text-muted-foreground">{entry.client}</p>
                  <p className="text-xs text-muted-foreground">by {entry.attorney}</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">{entry.hours}h @ ${entry.rate}/hr</div>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                  <div className="text-sm font-medium text-green-600">
                    ${(entry.hours * entry.rate).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
