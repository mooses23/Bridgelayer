import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ExternalLink,
  Home,
  Briefcase,
  FolderOpen,
  UserPlus,
  Brain,
  DollarSign,
  Inbox,
  Shield,
  BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/context/TenantContext";
import { useSession } from "@/contexts/SessionContext";

// Widget Components
import {
  NewMatterWidget,
  RecentMattersWidget,
  UpcomingDeadlinesWidget,
  NotificationsWidget,
  CaseStatusChartWidget,
  FormsAccessWidget,
  IntegrationsWidget
} from "@/components/dashboard";

export default function TemplatedDashboard() {
  const { tenant } = useTenant();
  const { user } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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

  // Mock data for demonstration
  const mockData = {
    recentMatters: [
      { id: 1, title: "Smith vs. Johnson", client: "ABC Corp", status: "active", priority: "high", lastAccessed: "2 hours ago" },
      { id: 2, title: "Contract Review - XYZ Inc", client: "XYZ Inc", status: "pending", priority: "medium", lastAccessed: "1 day ago" },
      { id: 3, title: "Employment Agreement", client: "Tech Startup", status: "active", priority: "low", lastAccessed: "3 days ago" }
    ],
    upcomingDeadlines: [
      { id: 1, title: "Discovery Response Due", matter: "Smith vs. Johnson", dueDate: "Dec 17, 2025", type: "Litigation", priority: "urgent", daysRemaining: 1 },
      { id: 2, title: "Contract Amendment Review", matter: "XYZ Inc Agreement", dueDate: "Dec 20, 2025", type: "Contract", priority: "high", daysRemaining: 4 },
      { id: 3, title: "Client Meeting Prep", matter: "Employment Agreement", dueDate: "Dec 24, 2025", type: "Meeting", priority: "medium", daysRemaining: 8 }
    ],
    notifications: [
      { id: 1, type: "document", title: "New Document Uploaded", message: "Contract amendment received from XYZ Inc", timestamp: "10 minutes ago", read: false, priority: "high" },
      { id: 2, type: "email", title: "Client Email", message: "Smith replied to discovery questions", timestamp: "1 hour ago", read: false, priority: "medium" },
      { id: 3, type: "client", title: "New Client Inquiry", message: "Potential client inquiry from referral", timestamp: "2 hours ago", read: true, priority: "low" }
    ],
    caseStats: { active: 12, pending: 5, closed: 18, total: 35 },
    unreadNotifications: 2
  };

  const tabItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "cases", label: "Cases", icon: Briefcase },
    { id: "clients", label: "Clients", icon: Users },
    { id: "files", label: "Files", icon: FolderOpen },
    { id: "paralegal", label: "Paralegal+", icon: Brain },
    { id: "intake", label: "Intake", icon: UserPlus },
    { id: "billing", label: "Billing", icon: DollarSign },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "communications", label: "Communications", icon: Inbox },
    { id: "compliance", label: "Compliance", icon: Shield },
    { id: "analytics", label: "Analytics", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Firm Logo */}
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {tenant?.name?.charAt(0) || 'F'}
                </span>
              </div>
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
                {mockData.unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {mockData.unreadNotifications}
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

      {/* Main Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 lg:grid-cols-11 w-full h-auto p-1 bg-gray-50">
              {tabItems.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex flex-col items-center space-y-1 py-3 px-2 text-xs data-[state=active]:bg-white"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:block">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Content */}
            <div className="py-8">
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Top-Level Widgets */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* New Matter Widget */}
                    {isWidgetEnabled('newMatter') && (
                      <NewMatterWidget />
                    )}

                    {/* Recent Matters Widget */}
                    {isWidgetEnabled('recentMatters') && (
                      <RecentMattersWidget matters={mockData.recentMatters} />
                    )}

                    {/* Upcoming Deadlines Widget */}
                    {isWidgetEnabled('upcomingDeadlines') && (
                      <UpcomingDeadlinesWidget deadlines={mockData.upcomingDeadlines} />
                    )}

                    {/* Notifications Widget */}
                    {isWidgetEnabled('notifications') && (
                      <NotificationsWidget notifications={mockData.notifications} />
                    )}
                  </div>

                  {/* Right Column - Secondary Widgets */}
                  <div className="space-y-6">
                    {/* Case Status Chart Widget */}
                    {isWidgetEnabled('caseStatusChart') && (
                      <CaseStatusChartWidget caseStats={mockData.caseStats} />
                    )}

                    {/* Forms Access Widget */}
                    {isWidgetEnabled('formsAccess') && (
                      <FormsAccessWidget topForms={[]} />
                    )}

                    {/* Integrations Widget */}
                    {isWidgetEnabled('integrations') && (
                      <IntegrationsWidget integrations={[]} />
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cases">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Cases Management</h2>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Case
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Active Cases</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">12</div>
                        <p className="text-sm text-gray-600">Currently active matters</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Pending Review</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">5</div>
                        <p className="text-sm text-gray-600">Awaiting review</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Closed This Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">8</div>
                        <p className="text-sm text-gray-600">Successfully resolved</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clients">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Total Clients</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">47</div>
                        <p className="text-sm text-gray-600">All time</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Active Clients</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">23</div>
                        <p className="text-sm text-gray-600">Currently engaged</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>New This Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-purple-600">6</div>
                        <p className="text-sm text-gray-600">Recent additions</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Referrals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-orange-600">12</div>
                        <p className="text-sm text-gray-600">From existing clients</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="files">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Uploads</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Contract_Amendment.pdf</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Discovery_Response.docx</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Settlement_Agreement.pdf</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Storage Usage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold">2.3 GB</div>
                          <div className="text-sm text-gray-600">of 10 GB used</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '23%'}}></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Reviews</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-green-600">156</div>
                          <div className="text-sm text-gray-600">Documents processed</div>
                          <div className="text-xs text-green-600">+8 today</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="paralegal">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">AI-Powered Legal Assistant</h2>
                    <Button>
                      <Brain className="h-4 w-4 mr-2" />
                      New Analysis
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Document Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Contract Reviews</span>
                            <Badge>24 Completed</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Risk Assessments</span>
                            <Badge>12 Pending</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Clause Extractions</span>
                            <Badge>36 Done</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Legal Research</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Case Law Research</span>
                            <Badge>8 Queries</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Statute Analysis</span>
                            <Badge>5 Reports</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Precedent Matching</span>
                            <Badge>15 Matches</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Add similar content for other tabs */}
              <TabsContent value="intake">
                <div className="text-center py-12">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Client Intake System</h3>
                  <p className="text-gray-600">Streamline new client onboarding and case assessment</p>
                </div>
              </TabsContent>

              <TabsContent value="billing">
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Billing & Time Tracking</h3>
                  <p className="text-gray-600">Manage invoices, time entries, and payment tracking</p>
                </div>
              </TabsContent>

              <TabsContent value="calendar">
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar & Scheduling</h3>
                  <p className="text-gray-600">Court dates, deadlines, and appointment management</p>
                </div>
              </TabsContent>

              <TabsContent value="communications">
                <div className="text-center py-12">
                  <Inbox className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Communications Hub</h3>
                  <p className="text-gray-600">Email integration, client communications, and message tracking</p>
                </div>
              </TabsContent>

              <TabsContent value="compliance">
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Management</h3>
                  <p className="text-gray-600">Regulatory compliance, audit trails, and security monitoring</p>
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics & Reporting</h3>
                  <p className="text-gray-600">Performance metrics, revenue analysis, and business insights</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
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