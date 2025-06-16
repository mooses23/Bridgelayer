import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Activity, AlertTriangle, TrendingUp, Eye, Settings, FileText, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";

export default function AdminDashboard() {
  console.log("[AdminDashboard] LIVE");
  const [, setLocation] = useLocation();
  
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

  const { data: systemAlerts = [] } = useQuery({
    queryKey: ['/api/admin/alerts'],
    queryFn: () => fetch("/api/admin/alerts", { credentials: "include" }).then(r => r.json()),
    staleTime: 1 * 60 * 1000,
  });

  // Ensure systemAlerts is always an array
  const safeSystemAlerts = Array.isArray(systemAlerts) ? systemAlerts : [];

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="outline" className="text-green-600">
          System Healthy
        </Badge>
      </div>

      {/* System Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Firms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats?.totalFirms || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats?.documentsProcessed || 0}</div>
            <p className="text-xs text-muted-foreground">
              +1,209 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2" size={20} />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium">New firm registered</p>
                  <p className="text-xs text-gray-500">Wilson & Associates joined the platform</p>
                  <p className="text-xs text-gray-400">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium">System update deployed</p>
                  <p className="text-xs text-gray-500">Version 2.1.4 with security patches</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium">High API usage alert</p>
                  <p className="text-xs text-gray-500">Johnson Law exceeded API limits</p>
                  <p className="text-xs text-gray-400">4 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2" size={20} />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.length > 0 ? (
                systemAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert?.message || 'Unknown alert'}</p>
                      <p className="text-xs text-gray-500">{alert?.time || 'Unknown time'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                  <p>No active alerts</p>
                  <p className="text-xs">All systems operating normally</p>
                </div>
              )}
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
              <Button 
                variant="outline" 
                className="h-20 hover:bg-gray-50 transition-colors"
                onClick={() => setLocation('/admin/firms')}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Building2 className="w-6 h-6" />
                  <span className="text-sm">Manage Firms</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 hover:bg-gray-50 transition-colors"
                onClick={() => setLocation('/admin/analytics')}
              >
                <div className="flex flex-col items-center space-y-2">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm">Usage Analytics</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 hover:bg-gray-50 transition-colors"
                onClick={() => setLocation('/admin/ghost')}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Eye className="w-6 h-6" />
                  <span className="text-sm">Ghost Mode</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 hover:bg-gray-50 transition-colors"
                onClick={() => setLocation('/admin/settings')}
              >
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