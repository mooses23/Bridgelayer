import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Users, Search, Plus, Settings, Eye, FileText, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";

export default function FirmsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: firms = [], isLoading } = useQuery({
    queryKey: ["admin-firms"],
    queryFn: () => fetch("/api/admin/firms", { credentials: "include" }).then(r => r.json()),
    staleTime: 2 * 60 * 1000,
  });

  const filteredFirms = Array.isArray(firms) ? firms.filter((firm: any) => 
    firm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    firm.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Trial": return "bg-blue-100 text-blue-800";
      case "Onboarding": return "bg-yellow-100 text-yellow-800";
      case "Suspended": return "bg-red-100 text-red-800";
      case "Inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Enterprise": return "bg-purple-100 text-purple-800";
      case "Professional": return "bg-blue-100 text-blue-800";
      case "Starter": return "bg-green-100 text-green-800";
      case "Trial": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartOnboarding = (firmId: number) => {
    setLocation(`/admin/onboarding/${firmId}`);
  };

  const handleGhostMode = (firmId: number) => {
    setLocation(`/admin/ghost/${firmId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Firm Management</h1>
          <p className="mt-2 text-gray-600">Manage law firms and their onboarding workflows</p>
        </div>
        <Button 
          onClick={() => setLocation("/admin/firms/new")}
          className="flex items-center"
        >
          <Plus className="mr-2" size={16} />
          Add New Firm
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search firms by name or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Settings className="mr-2" size={16} />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Firms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Loading firms...
          </div>
        ) : filteredFirms.length > 0 ? (
          filteredFirms.map((firm: any) => (
            <Card key={firm.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{firm.name}</CardTitle>
                      <p className="text-sm text-gray-500">@{firm.slug}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge className={getStatusColor(firm.status || "Active")}>
                      {firm.status || "Active"}
                    </Badge>
                    <Badge className={getPlanColor(firm.plan || "Professional")}>
                      {firm.plan || "Professional"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Firm Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{firm.userCount || 0}</div>
                    <div className="text-xs text-gray-500">Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{firm.documentsCount || 0}</div>
                    <div className="text-xs text-gray-500">Docs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{firm.casesCount || 0}</div>
                    <div className="text-xs text-gray-500">Cases</div>
                  </div>
                </div>

                {/* Onboarding Status */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Onboarding Status</span>
                    <span className="text-sm text-gray-500">
                      {firm.onboardingProgress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${firm.onboardingProgress || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {firm.onboarded ? "Complete" : "In Progress"}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartOnboarding(firm.id)}
                    className="flex items-center justify-center"
                  >
                    <FileText className="mr-1" size={14} />
                    Onboarding
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGhostMode(firm.id)}
                    className="flex items-center justify-center"
                  >
                    <Eye className="mr-1" size={14} />
                    Ghost Mode
                  </Button>
                </div>

                {/* Last Activity */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <div className="flex items-center">
                    <Calendar className="mr-1" size={12} />
                    Last activity: {firm.lastActivity || "Recently"}
                  </div>
                  <div>
                    Created: {firm.createdAt ? new Date(firm.createdAt).toLocaleDateString() : "Unknown"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No firms found</h3>
            <p className="text-sm">
              {searchQuery ? "Try adjusting your search terms" : "Get started by adding your first firm"}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setLocation("/admin/firms/new")}
                className="mt-4"
              >
                <Plus className="mr-2" size={16} />
                Add New Firm
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}