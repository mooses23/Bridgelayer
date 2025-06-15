import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  MoreHorizontal
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
  console.log("Dashboard: All Phase 4 components loaded and mounted");

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents"],
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

{/* Phase 4 Components Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 mb-6">
        <div>
          <div className="text-xs text-green-600 font-medium mb-2">[AdminGhostModeWidget] is live</div>
          <AdminGhostModeWidget />
        </div>
        <div>
          <div className="text-xs text-green-600 font-medium mb-2">[AiTriageWidget] is live</div>
          <AiTriageWidget />
        </div>
        <div>
          <div className="text-xs text-green-600 font-medium mb-2">[CalendarWidget] is live</div>
          <CalendarWidget />
        </div>
        <div>
          <div className="text-xs text-green-600 font-medium mb-2">[ClientIntakeWidget] is live</div>
          <ClientIntakeWidget />
        </div>
      </div>

      {/* Additional Phase 4 Components */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div>
          <div className="text-xs text-green-600 font-medium mb-2">[CommunicationLogWidget] is live</div>
          <CommunicationLogWidget />
        </div>
        <div>
          <div className="text-xs text-green-600 font-medium mb-2">[AIReasoning] is live</div>
          <AIReasoning reasoning={{
            steps: ["Document analysis initiated", "Legal patterns identified", "Risk assessment completed"],
            confidence: 0.95,
            reasoning: "Based on contract analysis patterns"
          }} />
        </div>
      </div>

      {/* Document Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Tasks
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Tasks need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,500</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Overview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Document workflow and analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Analysis</Badge>
                <p className="text-sm text-gray-500">
                  8 documents analyzed this week.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Workflow</Badge>
                <p className="text-sm text-gray-500">
                  3 new document workflows created.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminders Section */}
        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
            <CardDescription>Upcoming deadlines and tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm">
                  Finalize contract draft by Friday.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm">Client intake form completed.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Activity & Calendar */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Document Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Document Activity</CardTitle>
            <CardDescription>Recent document updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    NDA_Template.pdf uploaded
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Contract analysis completed
                  </p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Upcoming events</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarWidget />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}