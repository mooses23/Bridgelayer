
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, FileText, Plus } from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { useQuery } from "@tanstack/react-query";

export default function CasesPage() {
  const { tenant } = useTenant();
  
  const { data: cases, isLoading } = useQuery({
    queryKey: ["cases", tenant?.id],
    queryFn: () => fetch(`/api/cases?tenant=${tenant?.id}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!tenant?.id
  });

  const { data: casesSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["cases-summary", tenant?.id],
    queryFn: () => fetch(`/api/cases-summary?tenant=${tenant?.id}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!tenant?.id
  });

  // Fallback data structure for when API is not available
  const fallbackCases = [
    {
      id: 1,
      title: "Smith vs. Johnson",
      type: "Civil Litigation",
      status: "Active",
      priority: "High",
      attorney: "Sarah Wilson",
      client: "ABC Corporation",
      nextDeadline: "Jan 25, 2025",
      documentsCount: 24
    },
    {
      id: 2,
      title: "Employment Agreement Review",
      type: "Contract Review",
      status: "Review",
      priority: "Medium",
      attorney: "John Davis",
      client: "Tech Startup Inc",
      nextDeadline: "Jan 30, 2025",
      documentsCount: 8
    },
    {
      id: 3,
      title: "Real Estate Transaction",
      type: "Real Estate",
      status: "Active",
      priority: "Low",
      attorney: "Emily Chen",
      client: "Property Holdings LLC",
      nextDeadline: "Feb 5, 2025",
      documentsCount: 15
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Review": return "bg-yellow-100 text-yellow-800";
      case "Closed": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
          <p className="text-gray-600">Manage and track all active cases</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Case
        </Button>
      </div>

      {/* Cases Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : casesSummary?.totalCases ?? "24"}
            </div>
            <p className="text-xs text-muted-foreground">
              {casesSummary?.totalCasesChange ?? "+3 from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : casesSummary?.activeCases ?? "18"}
            </div>
            <p className="text-xs text-muted-foreground">
              {casesSummary?.activeCasesChange ?? "+2 from last week"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : casesSummary?.highPriority ?? "5"}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : casesSummary?.upcomingDeadlines ?? "8"}
            </div>
            <p className="text-xs text-muted-foreground">Upcoming deadlines</p>
          </CardContent>
        </Card>
      </div>

      {/* Cases List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading cases...</div>
            ) : (
              (cases || fallbackCases).map((case_: any) => (
                <div
                  key={case_.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium text-gray-900">{case_.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{case_.type}</span>
                    <span>•</span>
                    <span>{case_.attorney}</span>
                    <span>•</span>
                    <span>{case_.client}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <p className="text-gray-900">Next: {case_.nextDeadline}</p>
                    <p className="text-gray-600">{case_.documentsCount} documents</p>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <Badge className={getStatusColor(case_.status)}>
                      {case_.status}
                    </Badge>
                    <Badge className={getPriorityColor(case_.priority)}>
                      {case_.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
