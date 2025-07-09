import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Calendar, 
  DollarSign,
  Plus,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function FirmDashboard() {
  // Mock data - would come from API based on firm context
  const firmData = {
    name: "Smith & Associates",
    recentMatters: [
      { id: 1, title: "Corporate Merger Review", client: "TechCorp Inc", status: "Active", dueDate: "2025-06-30" },
      { id: 2, title: "Employment Contract", client: "StartupXYZ", status: "Review", dueDate: "2025-06-25" },
      { id: 3, title: "Real Estate Closing", client: "John Smith", status: "Pending", dueDate: "2025-07-01" }
    ],
    upcomingDeadlines: [
      { id: 1, task: "File Motion to Dismiss", case: "State v. Johnson", due: "Tomorrow" },
      { id: 2, task: "Contract Review Due", case: "TechCorp Merger", due: "June 25" },
      { id: 3, task: "Deposition Prep", case: "Personal Injury", due: "June 28" }
    ],
    stats: {
      activeCases: 23,
      pendingTasks: 8,
      thisMonthBilling: 45000,
      documentsProcessed: 156
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to {firmData.name}</h1>
        <p className="opacity-90">Your legal practice management dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{firmData.stats.activeCases}</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{firmData.stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Billing</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${firmData.stats.thisMonthBilling.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{firmData.stats.documentsProcessed}</div>
            <p className="text-xs text-muted-foreground">Processed this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Matters</CardTitle>
              <CardDescription>Your most recent legal matters</CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Matter
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {firmData.recentMatters.map((matter) => (
                <div key={matter.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{matter.title}</p>
                    <p className="text-sm text-gray-600">{matter.client}</p>
                    <p className="text-xs text-gray-500">Due: {matter.dueDate}</p>
                  </div>
                  <Badge variant={matter.status === 'Active' ? 'default' : matter.status === 'Review' ? 'secondary' : 'outline'}>
                    {matter.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {firmData.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{deadline.task}</p>
                    <p className="text-sm text-gray-600">{deadline.case}</p>
                  </div>
                  <Badge variant={deadline.due === 'Tomorrow' ? 'destructive' : 'outline'}>
                    {deadline.due}
                  </Badge>
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
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm">New Client</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Upload Document</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Schedule Meeting</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span className="text-sm">Create Invoice</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
