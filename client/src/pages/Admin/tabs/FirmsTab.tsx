import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Building2, 
  Users, 
  Search, 
  Plus, 
  Settings, 
  Eye, 
  FileText, 
  Calendar, 
  MoreVertical,
  Download,
  Filter,
  Trash2,
  UserPlus,
  Mail,
  Power,
  AlertTriangle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";

export default function FirmsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFirms, setSelectedFirms] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const { data: firms = [], isLoading } = useQuery({
    queryKey: ["admin-firms"],
    queryFn: () => fetch("/api/admin/firms", { credentials: "include" }).then(r => r.json()),
    staleTime: 2 * 60 * 1000,
  });

  const filteredFirms = Array.isArray(firms) ? firms.filter((firm: any) => {
    const matchesSearch = firm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         firm.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || firm.status === statusFilter;
    const matchesPlan = planFilter === "all" || firm.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  }).sort((a: any, b: any) => {
    switch (sortBy) {
      case "name": return a.name?.localeCompare(b.name) || 0;
      case "created": return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "users": return (b.userCount || 0) - (a.userCount || 0);
      default: return 0;
    }
  }) : [];

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

  const handleSelectFirm = (firmId: number, checked: boolean) => {
    if (checked) {
      setSelectedFirms([...selectedFirms, firmId]);
    } else {
      setSelectedFirms(selectedFirms.filter(id => id !== firmId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFirms(filteredFirms.map((firm: any) => firm.id));
    } else {
      setSelectedFirms([]);
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for firms:`, selectedFirms);
    // Implement bulk actions
  };

  const exportFirms = () => {
    console.log("Exporting firms data...");
    // Implement export functionality
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Law Firm Management</h1>
          <p className="mt-2 text-gray-600">
            Manage law firms, onboarding workflows, and firm configurations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={exportFirms}
            className="flex items-center"
          >
            <Download className="mr-2" size={16} />
            Export
          </Button>
          <Button 
            onClick={() => setLocation("/admin/onboarding")}
            className="flex items-center"
          >
            <Plus className="mr-2" size={16} />
            Create New Firm
          </Button>
        </div>
      </div>

      {/* Search, Filters, and Bulk Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search firms by name or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Trial">Trial</SelectItem>
                  <SelectItem value="Onboarding">Onboarding</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Trial">Trial</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="created">Created Date</SelectItem>
                  <SelectItem value="users">User Count</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="mr-2" size={16} />
                More Filters
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedFirms.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedFirms.length} firm{selectedFirms.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('email')}
                  >
                    <Mail className="mr-1" size={14} />
                    Email
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('suspend')}
                  >
                    <Power className="mr-1" size={14} />
                    Suspend
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-1" size={14} />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Firms Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Firms</p>
                <p className="text-2xl font-bold">{filteredFirms.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Firms</p>
                <p className="text-2xl font-bold">
                  {filteredFirms.filter((f: any) => f.status === 'Active').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Onboarding</p>
                <p className="text-2xl font-bold">
                  {filteredFirms.filter((f: any) => f.status === 'Onboarding').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Need Attention</p>
                <p className="text-2xl font-bold">
                  {filteredFirms.filter((f: any) => f.status === 'Suspended' || f.status === 'Inactive').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Firms Grid */}
      <div className="space-y-4">
        {/* Header with select all */}
        <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 border rounded-lg">
          <Checkbox
            checked={selectedFirms.length === filteredFirms.length && filteredFirms.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium text-gray-700">
            {filteredFirms.length} firm{filteredFirms.length !== 1 ? 's' : ''} found
          </span>
        </div>
        {/* Firms List */}
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
                      <Checkbox
                        checked={selectedFirms.includes(firm.id)}
                        onCheckedChange={(checked) => handleSelectFirm(firm.id, checked as boolean)}
                      />
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{firm.name}</CardTitle>
                        <p className="text-sm text-gray-500">@{firm.slug}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
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
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
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
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 w-4 h-4" />
                          Add User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 w-4 h-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first firm"}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setLocation("/admin/onboarding")}
                  className="mt-4"
                >
                  <Plus className="mr-2" size={16} />
                  Create New Firm
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}