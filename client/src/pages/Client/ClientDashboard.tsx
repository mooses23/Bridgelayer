
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, MessageSquare, DollarSign, Clock } from "lucide-react";

export default function ClientDashboard() {
  const caseInfo = {
    caseNumber: "2025-001",
    title: "Contract Review & Analysis",
    attorney: "Sarah Wilson",
    status: "Active",
    nextAppointment: "Jan 30, 2025 at 2:00 PM"
  };

  const recentDocuments = [
    {
      id: 1,
      name: "Initial Consultation Notes",
      type: "Meeting Notes",
      date: "Jan 20, 2025",
      status: "Final"
    },
    {
      id: 2,
      name: "Contract Amendment v2",
      type: "Contract",
      date: "Jan 18, 2025",
      status: "Draft"
    },
    {
      id: 3,
      name: "Legal Opinion Letter",
      type: "Letter",
      date: "Jan 15, 2025",
      status: "Final"
    }
  ];

  const invoices = [
    {
      id: "INV-001",
      description: "Legal Services - Contract Review",
      amount: 3500.00,
      date: "Jan 15, 2025",
      status: "Paid"
    },
    {
      id: "INV-002",
      description: "Legal Services - Amendment Drafting",
      amount: 1200.00,
      date: "Jan 22, 2025",
      status: "Pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Final": return "bg-blue-100 text-blue-800";
      case "Draft": return "bg-yellow-100 text-yellow-800";
      case "Paid": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600">Here's an overview of your case and recent activity</p>
      </div>

      {/* Case Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Case</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Case Number</p>
                <p className="text-lg font-semibold">{caseInfo.caseNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Matter</p>
                <p className="text-lg">{caseInfo.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Attorney</p>
                <p className="text-lg">{caseInfo.attorney}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge className={getStatusColor(caseInfo.status)}>
                  {caseInfo.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Next Appointment</p>
                <p className="text-lg">{caseInfo.nextAppointment}</p>
              </div>
              <Button className="w-full md:w-auto">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Attorney
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Documents</CardTitle>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Billing Summary</CardTitle>
            <Button variant="outline" size="sm">
              <DollarSign className="w-4 h-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{invoice.id}</p>
                    <p className="text-sm text-gray-600">{invoice.description}</p>
                    <p className="text-xs text-gray-500">{invoice.date}</p>
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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16">
              <div className="flex flex-col items-center space-y-1">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Schedule Meeting</span>
              </div>
            </Button>
            <Button variant="outline" className="h-16">
              <div className="flex flex-col items-center space-y-1">
                <FileText className="w-5 h-5" />
                <span className="text-sm">Upload Document</span>
              </div>
            </Button>
            <Button variant="outline" className="h-16">
              <div className="flex flex-col items-center space-y-1">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">Send Message</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
