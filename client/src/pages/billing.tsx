import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Plus, 
  FileText, 
  DollarSign, 
  Calendar,
  User,
  BarChart3
} from "lucide-react";

export default function Billing() {
  const [selectedTab, setSelectedTab] = useState("time-tracking");

  // Sample data
  const timeEntries = [
    {
      id: 1,
      date: "2024-06-15",
      client: "John Smith",
      matter: "Employment Contract Review",
      hours: 2.5,
      rate: 350,
      description: "Reviewed employment agreement and identified key terms"
    },
    {
      id: 2,
      date: "2024-06-15",
      client: "Sarah Johnson", 
      matter: "NDA Analysis",
      hours: 1.5,
      rate: 300,
      description: "AI-assisted analysis of non-disclosure agreement"
    },
    {
      id: 3,
      date: "2024-06-14",
      client: "Michael Brown",
      matter: "Settlement Agreement",
      hours: 3.0,
      rate: 400,
      description: "Draft settlement terms and legal review"
    }
  ];

  const invoices = [
    {
      id: "INV-001",
      client: "John Smith",
      amount: 875.00,
      status: "paid",
      dueDate: "2024-06-30",
      items: 1
    },
    {
      id: "INV-002", 
      client: "Sarah Johnson",
      amount: 450.00,
      status: "pending",
      dueDate: "2024-07-15",
      items: 2
    },
    {
      id: "INV-003",
      client: "Michael Brown", 
      amount: 1200.00,
      status: "overdue",
      dueDate: "2024-06-01",
      items: 3
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalBillableHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalRevenue = timeEntries.reduce((sum, entry) => sum + (entry.hours * entry.rate), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Time Tracking</h1>
          <p className="text-gray-600">Manage time entries, invoices, and billing analytics</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Time Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBillableHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Billable amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Currently billing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$350</div>
            <p className="text-xs text-muted-foreground">Per hour</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="time-tracking" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="time-tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{entry.matter}</h4>
                        <p className="text-sm text-gray-600">{entry.client}</p>
                        <p className="text-sm text-gray-500">{entry.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{entry.hours}h</p>
                      <p className="text-sm text-gray-600">${(entry.hours * entry.rate).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{entry.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{invoice.id}</h4>
                        <p className="text-sm text-gray-600">{invoice.client}</p>
                        <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${invoice.amount.toLocaleString()}</p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                      <p className="text-xs text-gray-500">{invoice.items} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Hours:</span>
                    <span className="font-semibold">{totalBillableHours.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span className="font-semibold">${totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cases Worked:</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Rate:</span>
                    <span className="font-semibold">${Math.round(totalRevenue / totalBillableHours)}/hr</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>John Smith</span>
                    <span>$875</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sarah Johnson</span>
                    <span>$450</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Michael Brown</span>
                    <span>$1,200</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultRate">Default Hourly Rate</Label>
                  <Input id="defaultRate" placeholder="$350" />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" placeholder="USD" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input id="invoicePrefix" placeholder="INV-" />
                </div>
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
                  <Input id="paymentTerms" placeholder="30" />
                </div>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}