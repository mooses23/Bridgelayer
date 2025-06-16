
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Eye, LogOut, Building2, Users, Activity } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function GhostModePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => fetch("/api/tenants", { credentials: "include" }).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const { data: currentGhostSession } = useQuery({
    queryKey: ["ghost-session"],
    queryFn: () => fetch("/api/admin/ghost/current", { credentials: "include" }).then(r => r.json()),
    staleTime: 1 * 60 * 1000,
  });

  const ghostMutation = useMutation({
    mutationFn: (firmId: number) =>
      fetch(`/api/admin/ghost/${firmId}`, { method: "POST", credentials: "include" })
        .then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ghost-session"] });
    },
  });

  const exitGhostMutation = useMutation({
    mutationFn: () =>
      fetch("/api/admin/ghost/exit", { method: "POST", credentials: "include" })
        .then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ghost-session"] });
    },
  });

  const filteredTenants = tenants.filter((tenant: any) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGhostMode = (firmId: number) => {
    ghostMutation.mutate(firmId);
  };

  const handleExitGhost = () => {
    exitGhostMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ghost Mode</h1>
          <p className="text-muted-foreground">
            Access any tenant's environment for support and debugging
          </p>
        </div>
        {currentGhostSession?.active && (
          <Button 
            onClick={handleExitGhost}
            variant="destructive"
            disabled={exitGhostMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Exit Ghost Mode
          </Button>
        )}
      </div>

      {currentGhostSession?.active && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Currently in Ghost Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-orange-900">
                  {currentGhostSession.firmName}
                </p>
                <p className="text-sm text-orange-700">
                  Session started: {new Date(currentGhostSession.startedAt).toLocaleString()}
                </p>
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                Ghost Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select Tenant</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by firm name or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tenantsLoading ? (
            <div className="text-center py-6">Loading tenants...</div>
          ) : (
            <div className="space-y-3">
              {filteredTenants.map((tenant: any) => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-sm text-gray-600">
                          {tenant.slug} • {tenant.plan || "Professional"} Plan
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {tenant.userCount || 0} users
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        {tenant.status || "Active"}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleGhostMode(tenant.id)}
                      disabled={ghostMutation.isPending || currentGhostSession?.active}
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {ghostMutation.isPending ? "Accessing..." : "Ghost Mode"}
                    </Button>
                  </div>
                </div>
              ))}
              {filteredTenants.length === 0 && !tenantsLoading && (
                <div className="text-center py-6 text-gray-500">
                  No tenants found matching your search.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ghost Mode Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Security Notice</h4>
            <p className="text-sm text-blue-800 mt-1">
              Ghost mode sessions are logged and monitored. Only use for legitimate support and debugging purposes.
            </p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Access tenant data only as needed for support resolution</li>
            <li>• Document all actions taken during ghost mode sessions</li>
            <li>• Exit ghost mode immediately after completing support tasks</li>
            <li>• Never modify tenant data without explicit permission</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
