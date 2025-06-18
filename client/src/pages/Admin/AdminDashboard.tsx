import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Activity, AlertTriangle, TrendingUp, Eye, Settings, FileText, CheckCircle, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function AdminDashboard() {
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

  const safeSystemAlerts = Array.isArray(systemAlerts) ? systemAlerts : [];
  
  const displayStats = systemStats || {
    totalFirms: 0,
    activeFirms: 0,
    totalUsers: 0,
    documentsProcessed: 0,
    systemHealth: "Unknown"
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST", 
        credentials: "include" 
      });
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
          <p className="mt-2 text-gray-600">Monitor and manage the FIRMSYNC platform</p>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="mr-2" size={16} />
          Logout
        </Button>
      </div>

      {/* System Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Firms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : displayStats.totalFirms}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Firms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : displayStats.activeFirms}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : displayStats.totalUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Documents Processed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : displayStats.documentsProcessed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Firms & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2" size={20} />
              Recent Firms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenantsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading firms...</div>
              ) : recentFirms.length > 0 ? (
                recentFirms.map((firm) => (
                  <div key={firm.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{firm.name}</p>
                      <p className="text-sm text-gray-500">{firm.users} users • {firm.plan}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(firm.status)}>{firm.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p>No firms found</p>
                </div>
              )}
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
              {safeSystemAlerts.length > 0 ? (
                safeSystemAlerts.map((alert: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert?.message || 'System alert'}</p>
                      <p className="text-xs text-gray-500">{alert?.time || 'Recent'}</p>
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
              onClick={() => setLocation('/admin/usage')}
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