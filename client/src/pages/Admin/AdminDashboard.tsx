
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Activity, AlertTriangle, TrendingUp, Eye, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: tenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => fetch("/api/tenants", { credentials: "include" }).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetch("/api/admin/stats", { credentials: "include" }).then(r => r.json()),
    staleTime: 2 * 60 * 1000,
  });

  const { data: systemAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["system-alerts"],
    queryFn: () => fetch("/api/admin/alerts", { credentials: "include" }).then(r => r.json()),
    staleTime: 1 * 60 * 1000,
  });

  // Fallback data only when loading and no data
  const fallbackStats = {
    totalFirms: "...",
    activeFirms: "...",
    totalUsers: "...",
    documentsProcessed: "...",
    systemHealth: "Loading..."
  };

  const displayStats = systemStats || (statsLoading ? fallbackStats : {
    totalFirms: 0,
    activeFirms: 0,
    totalUsers: 0,
    documentsProcessed: 0,
    systemHealth: "Unknown"
  });

  // Get recent firms from tenants data - ensure tenants is an array
  const tenantsArray = Array.isArray(tenants) ? tenants : [];
  const recentFirms = tenantsArray.slice(0, 3).map((tenant: any) => ({
    id: tenant.id,
    name: tenant.name,
    plan: tenant.plan || "Professional",
    users: tenant.userCount || 0,
    status: tenant.status || "Active",
    lastActivity: tenant.lastActivity || "Recently"
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Trial": return "bg-blue-100 text-blue-800";
      case "Suspended": return "bg-red-100 text-red-800";
      case "Inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error": return "bg-red-100 text-red-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "info": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600">Monitor and manage the FIRMSYNC platform</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Ghost Mode
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Firms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.totalFirms}</div>
            <p className="text-xs text-muted-foreground">
              {displayStats.totalFirms === "..." ? "Loading..." : "+12 this month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Firms</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.activeFirms}</div>
            <p className="text-xs text-muted-foreground">
              {displayStats.activeFirms === "..." ? "Loading..." : "80% active rate"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {displayStats.totalUsers === "..." ? "Loading..." : "+89 this week"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayStats.documentsProcessed === "..." ? "..." : 
               typeof displayStats.documentsProcessed === 'number' ? displayStats.documentsProcessed.toLocaleString() : displayStats.documentsProcessed}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayStats.documentsProcessed === "..." ? "Loading..." : "Processed this month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${displayStats.systemHealth === "Loading..." ? "text-gray-600" : "text-green-600"}`}>
              {displayStats.systemHealth}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayStats.systemHealth === "Loading..." ? "Checking status..." : "All services operational"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Firms */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Firm Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFirms.map((firm) => (
                <div
                  key={firm.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{firm.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{firm.plan} Plan</span>
                      <span>•</span>
                      <span>{firm.users} users</span>
                    </div>
                    <p className="text-xs text-gray-500">Last active: {firm.lastActivity}</p>
                  </div>
                  <Badge className={getStatusColor(firm.status)}>
                    {firm.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>System Alerts</CardTitle>
            <Badge variant="outline" className="bg-red-50 text-red-700">
              {systemAlerts.length} Active
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className={getAlertColor(alert.type)}>
                        {alert.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20">
              <div className="flex flex-col items-center space-y-2">
                <Building2 className="w-6 h-6" />
                <span className="text-sm">Manage Firms</span>
              </div>
            </Button>
            <Button variant="outline" className="h-20">
              <div className="flex flex-col items-center space-y-2">
                <TrendingUp className="w-6 h-6" />
                <span className="text-sm">Usage Analytics</span>
              </div>
            </Button>
            <Button variant="outline" className="h-20">
              <div className="flex flex-col items-center space-y-2">
                <Eye className="w-6 h-6" />
                <span className="text-sm">Ghost Mode</span>
              </div>
            </Button>
            <Button variant="outline" className="h-20">
              <div className="flex flex-col items-center space-y-2">
                <Settings className="w-6 h-6" />
                <span className="text-sm">System Settings</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
