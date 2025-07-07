import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FeatureToggle from "@/components/FeatureToggle";
import { useTenant } from "@/contexts/TenantContext";
import { useQuery } from "@tanstack/react-query";
import apiService from "@/services/api.service";

export default function DashboardPage() {
  const { tenant, hasFeature } = useTenant();
  
  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-summary", tenant?.slug],
    queryFn: async () => {
      const response = await apiService.get(`/tenant/${tenant?.slug}/dashboard`);
      return response.data;
    },
    enabled: !!tenant?.slug
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your firm dashboard
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : summary?.totalCases ?? "24"}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.casesChange ?? "+12% from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : summary?.activeClients ?? "18"}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.clientsChange ?? "+2 new this week"}
            </p>
          </CardContent>
        </Card>

        <FeatureToggle feature="documentsEnabled">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Documents Reviewed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : summary?.documentsReviewed ?? "156"}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary?.documentsToday ?? "+8 today"}
              </p>
            </CardContent>
          </Card>
        </FeatureToggle>

        <FeatureToggle feature="billingEnabled">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Billable Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : summary?.billableHours ?? "142.5"}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary?.billablePeriod ?? "This month"}
              </p>
            </CardContent>
          </Card>
        </FeatureToggle>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Contract review completed</span>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">New client intake</span>
                <span className="text-xs text-muted-foreground">4 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Document uploaded</span>
                <span className="text-xs text-muted-foreground">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Smith vs. Johnson - Discovery due</span>
                <span className="text-xs text-muted-foreground">Tomorrow</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Contract amendment review</span>
                <span className="text-xs text-muted-foreground">3 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Client meeting preparation</span>
                <span className="text-xs text-muted-foreground">1 week</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}