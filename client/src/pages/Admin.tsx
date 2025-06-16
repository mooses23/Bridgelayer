import { useSession } from "@/contexts/SessionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Settings, Shield, Activity } from "lucide-react";

export default function Admin() {
  console.log("[Admin] loaded");
  const { user, logout } = useSession();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div id="admin-page" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome, {user?.firstName}! You have full system access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Firms</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">847</div>
                <p className="text-xs text-muted-foreground">+23 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Healthy
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No active alerts</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Firms</CardTitle>
                <CardDescription>Latest firm registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Miller & Associates", users: 12, status: "Active", date: "2 days ago" },
                    { name: "TechLaw Partners", users: 8, status: "Onboarding", date: "1 week ago" },
                    { name: "Corporate Legal Group", users: 25, status: "Active", date: "2 weeks ago" }
                  ].map((firm, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{firm.name}</p>
                        <p className="text-sm text-gray-600">{firm.users} users • {firm.date}</p>
                      </div>
                      <Badge variant={firm.status === "Active" ? "default" : "secondary"}>
                        {firm.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Activity</CardTitle>
                <CardDescription>Platform usage overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Documents Processed</span>
                    <span className="text-sm text-gray-600">1,247 today</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Analyses Run</span>
                    <span className="text-sm text-gray-600">823 today</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Sessions</span>
                    <span className="text-sm text-gray-600">456 active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-sm text-gray-600">87.3 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex space-x-4">
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline">
              <Building className="w-4 h-4 mr-2" />
              Firm Management
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}