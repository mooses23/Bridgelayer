import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Users, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Activity,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Bot,
  MessageSquare,
  UserCheck,
  Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Import all unmounted Phase 4 components
import AdminGhostModeWidget from "@/components/AdminGhostModeWidget";
import AiTriageWidget from "@/components/AiTriageWidget";
import CalendarWidget from "@/components/CalendarWidget";
import ClientIntakeWidget from "@/components/ClientIntakeWidget";
import CommunicationLogWidget from "@/components/CommunicationLogWidget";
import AIReasoning from "@/components/AIReasoning";
import AIResponseDebug from "@/components/AIResponseDebug";

export default function Dashboard() {
  console.log("DashboardTab rendered");
  
  // State management for interactivity
  const [activeSection, setActiveSection] = useState("overview");
  const [lastAction, setLastAction] = useState("");
  
  // Dummy firm context
  const currentFirm = {
    id: 1,
    name: "Smith & Associates Law Firm",
    user: "Sarah Johnson"
  };

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents"],
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Interactive dummy functions
  const handleAction = (action: string, data?: any) => {
    console.log(`Dashboard Action: ${action}`, data);
    setLastAction(`${action} - ${new Date().toLocaleTimeString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Action Feedback */}
      {lastAction && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <p className="text-sm text-green-800">Last Action: {lastAction}</p>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => handleAction("View Documents")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(documents) ? documents.length : 0}</div>
            <p className="text-xs text-muted-foreground">Click to view all documents</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => handleAction("View Clients")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(clients) ? clients.length : 0}</div>
            <p className="text-xs text-muted-foreground">Click to view all clients</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => handleAction("View Tasks")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Click to view pending tasks</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => handleAction("View Revenue")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,500</div>
            <p className="text-xs text-muted-foreground">Click to view billing details</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Tabbed Interface */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ai-triage" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Triage
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="intake" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Intake
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communications
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest document workflow updates for {currentFirm.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Employment Agreement - Johnson Corp</p>
                      <p className="text-xs text-gray-500">Uploaded 2 hours ago by {currentFirm.user}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleAction("Review Document", "Employment Agreement")}>
                      Review
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">NDA Analysis - TechStart Inc</p>
                      <p className="text-xs text-gray-500">Completed 4 hours ago</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleAction("View Analysis", "NDA Analysis")}>
                      View Results
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Settlement Agreement - Brown vs. Corp</p>
                      <p className="text-xs text-gray-500">Pending review since yesterday</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleAction("Priority Review", "Settlement Agreement")}>
                      Priority Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Critical dates and tasks requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Contract Review Due</p>
                      <p className="text-xs text-gray-500">Mitchell Industries - Due Friday</p>
                    </div>
                    <Button size="sm" onClick={() => handleAction("Set Reminder", "Contract Review")}>Remind</Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Client Meeting Scheduled</p>
                      <p className="text-xs text-gray-500">Davis & Partners - Tomorrow 2PM</p>
                    </div>
                    <Button size="sm" onClick={() => handleAction("View Meeting", "Davis & Partners")}>Details</Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Document Filing Deadline</p>
                      <p className="text-xs text-gray-500">Court submission - Next Tuesday</p>
                    </div>
                    <Button size="sm" onClick={() => handleAction("Prepare Filing", "Court Documents")}>Prepare</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-triage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Triage System</CardTitle>
              <CardDescription>Intelligent document prioritization and client intake analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <AiTriageWidget />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Legal Calendar & Events</CardTitle>
              <CardDescription>Court dates, deadlines, and AI-extracted calendar events</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarWidget />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intake" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Intake Management</CardTitle>
              <CardDescription>Recent client inquiries and intake form submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <ClientIntakeWidget />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Communications Log</CardTitle>
              <CardDescription>Client calls, emails, and meeting notes tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <CommunicationLogWidget />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Ghost Mode</CardTitle>
              <CardDescription>Secure firm simulation and administrative oversight</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminGhostModeWidget />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Reasoning Display */}
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis Engine</CardTitle>
          <CardDescription>Real-time document processing and legal reasoning</CardDescription>
        </CardHeader>
        <CardContent>
          <AIReasoning 
            reasoning={{
              steps: [
                "Document content analysis initiated for pending reviews",
                "Legal pattern recognition completed across 3 contract types",
                "Risk assessment protocols activated for high-priority items",
                "Cross-reference validation performed against firm standards"
              ],
              confidence: 0.94,
              reasoning: "Multi-document analysis with firm-specific legal standards integration"
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}