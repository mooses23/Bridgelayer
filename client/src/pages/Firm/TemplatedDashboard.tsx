import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Calendar, 
  Bell, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Settings,
  ExternalLink
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/context/TenantContext";
import { useSession } from "@/contexts/SessionContext";

// Widget Components
import NewMatterWidget from "@/components/dashboard/NewMatterWidget";
import RecentMattersWidget from "@/components/dashboard/RecentMattersWidget";
import UpcomingDeadlinesWidget from "@/components/dashboard/UpcomingDeadlinesWidget";
import NotificationsWidget from "@/components/dashboard/NotificationsWidget";
import CaseStatusChartWidget from "@/components/dashboard/CaseStatusChartWidget";
import FormsAccessWidget from "@/components/dashboard/FormsAccessWidget";
import IntegrationsWidget from "@/components/dashboard/IntegrationsWidget";

export default function TemplatedDashboard() {
  const { tenant } = useTenant();
  const { user } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch dashboard configuration and data
  const { data: dashboardConfig, isLoading: configLoading } = useQuery({
    queryKey: ["dashboard-config", tenant?.id],
    queryFn: () => fetch(`/api/dashboard-config?tenant=${tenant?.id}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!tenant?.id
  });

  const { data: dashboardData, isLoading: dataLoading } = useQuery({
    queryKey: ["dashboard-data", tenant?.id],
    queryFn: () => fetch(`/api/dashboard-data?tenant=${tenant?.id}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!tenant?.id
  });

  if (configLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isWidgetEnabled = (widgetName: string) => {
    return dashboardConfig?.enabledWidgets?.includes(widgetName) ?? true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Firm Logo */}
            <div className="flex items-center space-x-4">
              {tenant?.logoUrl ? (
                <img 
                  src={tenant.logoUrl} 
                  alt={`${tenant.name} logo`}
                  className="h-8 w-auto"
                />
              ) : (
                <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {tenant?.name?.charAt(0) || 'F'}
                  </span>
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900">
                {tenant?.name || "Law Firm"}
              </h1>
            </div>

            {/* Global Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search matters, clients, documents..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Right side: Notifications, User Menu, FirmSync Logo */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {dashboardData?.unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {dashboardData.unreadNotifications}
                  </Badge>
                )}
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Powered by</span>
                <span className="font-bold text-blue-600">FIRMSYNC</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Top-Level Widgets */}
          <div className="lg:col-span-2 space-y-6">
            {/* New Matter Widget */}
            {isWidgetEnabled('newMatter') && (
              <NewMatterWidget />
            )}

            {/* Recent Matters Widget */}
            {isWidgetEnabled('recentMatters') && (
              <RecentMattersWidget matters={dashboardData?.recentMatters || []} />
            )}

            {/* Upcoming Deadlines Widget */}
            {isWidgetEnabled('upcomingDeadlines') && (
              <UpcomingDeadlinesWidget deadlines={dashboardData?.upcomingDeadlines || []} />
            )}

            {/* Notifications Widget */}
            {isWidgetEnabled('notifications') && (
              <NotificationsWidget notifications={dashboardData?.notifications || []} />
            )}
          </div>

          {/* Right Column - Secondary Widgets */}
          <div className="space-y-6">
            {/* Case Status Chart Widget */}
            {isWidgetEnabled('caseStatusChart') && (
              <CaseStatusChartWidget caseStats={dashboardData?.caseStats || {}} />
            )}

            {/* Forms Access Widget */}
            {isWidgetEnabled('formsAccess') && (
              <FormsAccessWidget topForms={dashboardConfig?.topForms || []} />
            )}

            {/* Integrations Widget */}
            {isWidgetEnabled('integrations') && (
              <IntegrationsWidget integrations={dashboardData?.integrations || []} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>FirmSync v1.0</span>
              <Button variant="link" size="sm" className="text-gray-500 hover:text-gray-700">
                Help
              </Button>
              <Button variant="link" size="sm" className="text-gray-500 hover:text-gray-700">
                Privacy
              </Button>
            </div>
            <div className="text-right">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}