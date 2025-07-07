import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, FileText, Plus, Search } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useQuery } from "@tanstack/react-query";
import { Case } from "@/types/schema";
import apiService from "@/services/api.service";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// Extended case type with UI-specific properties
interface ExtendedCase extends Case {
  type?: string;
  priority?: string;
  attorney?: string;
  client?: string;
  nextDeadline?: string;
  documentsCount?: number;
}

export default function CasesPage() {
  const { tenant } = useTenant();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch cases using API service
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["cases", tenant?.slug],
    queryFn: async () => {
      const response = await apiService.getCases(tenant?.slug || '');
      return response.data;
    },
    enabled: !!tenant?.slug
  });

  // Filter cases based on search term
  const filteredCases = cases.filter((caseItem: ExtendedCase) => 
    caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    caseItem.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Case status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Priority color mapping
  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
    
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Summary statistics
  const activeCases = cases.filter((c: ExtendedCase) => c.status.toLowerCase() === 'active').length;
  const pendingCases = cases.filter((c: ExtendedCase) => c.status.toLowerCase() === 'pending').length;
  const closedCases = cases.filter((c: ExtendedCase) => c.status.toLowerCase() === 'closed').length;

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

      {/* Search Bar - New Feature */}
      <div className="relative">
        <Input 
          placeholder="Search cases..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
        <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
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
              {isLoading ? "..." : cases.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {`+${activeCases + pendingCases - closedCases} from last month`}
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
              {isLoading ? "..." : activeCases}
            </div>
            <p className="text-xs text-muted-foreground">
              {`+${activeCases - closedCases} from last week`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Cases</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : pendingCases}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Cases</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : closedCases}
            </div>
            <p className="text-xs text-muted-foreground">No action required</p>
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
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-8">No cases found matching your search</div>
            ) : (
              filteredCases.map((case_: ExtendedCase) => (
                <div
                  key={case_.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium text-gray-900">{case_.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      {case_.type && <span>{case_.type}</span>}
                      {case_.type && <span>•</span>}
                      <span>Created: {new Date(case_.createdAt).toLocaleDateString()}</span>
                      {case_.client && (
                        <>
                          <span>•</span>
                          <span>Client: {case_.client}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {case_.nextDeadline && (
                      <div className="text-right text-sm">
                        <p className="text-gray-900">Next: {case_.nextDeadline}</p>
                        {case_.documentsCount !== undefined && (
                          <p className="text-gray-600">{case_.documentsCount} documents</p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-col space-y-1">
                      <Badge className={getStatusColor(case_.status)}>
                        {case_.status}
                      </Badge>
                      {case_.priority && (
                        <Badge className={getPriorityColor(case_.priority)}>
                          {case_.priority}
                        </Badge>
                      )}
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
