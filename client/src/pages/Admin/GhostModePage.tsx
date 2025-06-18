import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Building2,
  Eye,
  LogOut,
  Home,
  FolderOpen,
  DollarSign,
  BarChart3,
  Briefcase
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface GhostModeState {
  isActive: boolean;
  selectedFirmId?: number;
  firmName?: string;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/ghost" },
  { id: "cases", label: "Cases", icon: Briefcase, path: "/admin/ghost/cases" },
  { id: "clients", label: "Clients", icon: Users, path: "/admin/ghost/clients" },
  { id: "intake", label: "Intake", icon: FileText, path: "/admin/ghost/intake" },
  { id: "documents", label: "Documents", icon: FolderOpen, path: "/admin/ghost/documents" },
  { id: "billing", label: "Billing", icon: DollarSign, path: "/admin/ghost/billing" },
  { id: "settings", label: "Settings", icon: Settings, path: "/admin/ghost/settings" },
];

export default function GhostModePage() {
  const [location, navigate] = useLocation();
  const [ghostMode, setGhostMode] = useState<GhostModeState>({ isActive: false });

  // Get current active tab from URL
  const currentPath = location;
  const activeTab = currentPath === "/admin/ghost" ? "dashboard" : 
                   currentPath.split("/").pop() || "dashboard";

  // Fetch current ghost session
  const { data: currentSession } = useQuery({
    queryKey: ["/api/admin/ghost/current"],
    queryFn: () => fetch("/api/admin/ghost/current", { credentials: "include" }).then(r => r.json()),
    staleTime: 1 * 60 * 1000,
  });

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <FirmDashboardContent />;
      case "cases":
        return <FirmCasesContent />;
      case "clients":
        return <FirmClientsContent />;
      case "intake":
        return <FirmIntakeContent />;
      case "documents":
        return <FirmDocumentsContent />;
      case "billing":
        return <FirmBillingContent />;
      case "settings":
        return <FirmSettingsContent />;
      default:
        return <FirmDashboardContent />;
    }
  };

  const FirmDashboardContent = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your firm dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">+2 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Reviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+18 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">324.5</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Smith v. Jones Corporation</p>
                  <p className="text-sm text-muted-foreground">Contract Dispute - High Priority</p>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Williams Estate Planning</p>
                  <p className="text-sm text-muted-foreground">Trust Documentation</p>
                </div>
                <Badge variant="secondary">Review</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Johnson Property Sale</p>
                  <p className="text-sm text-muted-foreground">Real Estate Closing</p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Document Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Contract Reviews Pending</span>
                <Badge>5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Risk Assessments Complete</span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Clause Extractions Ready</span>
                <Badge variant="secondary">8</Badge>
              </div>
              <Button className="w-full mt-4">
                <FileText className="w-4 h-4 mr-2" />
                Process New Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const FirmCasesContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground">Manage all firm cases and matters</p>
        </div>
        <Button>
          <Briefcase className="w-4 h-4 mr-2" />
          New Case
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">31</div>
            <p className="text-sm text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">7</div>
            <p className="text-sm text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Due This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">12</div>
            <p className="text-sm text-muted-foreground">Upcoming deadlines</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Smith v. Jones Corp", type: "Contract Dispute", status: "Discovery", priority: "High", client: "Smith Industries" },
              { name: "Williams Estate", type: "Estate Planning", status: "Documentation", priority: "Medium", client: "Williams Family" },
              { name: "Johnson Property", type: "Real Estate", status: "Closing", priority: "Low", client: "Johnson Holdings" },
              { name: "Davis Employment", type: "Employment Law", status: "Negotiation", priority: "High", client: "Davis Tech" },
            ].map((case_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{case_.name}</h3>
                  <p className="text-sm text-muted-foreground">{case_.type} • {case_.client}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={case_.priority === "High" ? "destructive" : case_.priority === "Medium" ? "default" : "secondary"}>
                    {case_.priority}
                  </Badge>
                  <Badge variant="outline">{case_.status}</Badge>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const FirmClientsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage client relationships and information</p>
        </div>
        <Button>
          <Users className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">31</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$47,250</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Smith Industries", contact: "John Smith", type: "Corporate", status: "Active", matters: 3 },
              { name: "Williams Family Trust", contact: "Sarah Williams", type: "Estate Planning", status: "Active", matters: 1 },
              { name: "Johnson Holdings", contact: "Mike Johnson", type: "Real Estate", status: "Active", matters: 2 },
              { name: "Davis Technology", contact: "Lisa Davis", type: "Employment", status: "Active", matters: 1 },
            ].map((client, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.contact} • {client.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">{client.matters} matters</Badge>
                  <Badge variant="default">{client.status}</Badge>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const FirmIntakeContent = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Client Intake</h1>
        <p className="text-muted-foreground">Process new client inquiries and consultations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-sm text-muted-foreground">New inquiries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scheduled Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-sm text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Converted Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Intake Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Robert Chen", matter: "Personal Injury", date: "2 hours ago", status: "New" },
              { name: "Maria Rodriguez", matter: "Family Law", date: "1 day ago", status: "Scheduled" },
              { name: "David Thompson", matter: "Criminal Defense", date: "2 days ago", status: "Under Review" },
              { name: "Jennifer Lee", matter: "Business Formation", date: "3 days ago", status: "Consultation Scheduled" },
            ].map((intake, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{intake.name}</h3>
                  <p className="text-sm text-muted-foreground">{intake.matter} • {intake.date}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={intake.status === "New" ? "destructive" : "secondary"}>
                    {intake.status}
                  </Badge>
                  <Button variant="ghost" size="sm">Review</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const FirmDocumentsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">AI-powered document analysis and management</p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">AI Reviews Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Risk Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">7</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Analysis Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Contract_Amendment_v3.pdf", type: "Contract", status: "Analysis Complete", risk: "Low" },
              { name: "Settlement_Agreement_Draft.docx", type: "Settlement", status: "Under Review", risk: "High" },
              { name: "Employment_Agreement_New.pdf", type: "Employment", status: "Pending Analysis", risk: "Medium" },
              { name: "Lease_Agreement_Commercial.pdf", type: "Real Estate", status: "Analysis Complete", risk: "Low" },
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">{doc.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={doc.risk === "High" ? "destructive" : doc.risk === "Medium" ? "default" : "secondary"}>
                    {doc.risk} Risk
                  </Badge>
                  <Badge variant="outline">{doc.status}</Badge>
                  <Button variant="ghost" size="sm">View Analysis</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const FirmBillingContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Time Tracking</h1>
          <p className="text-muted-foreground">Manage time entries, invoices, and payments</p>
        </div>
        <Button>
          <DollarSign className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$87,450</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$23,100</div>
            <p className="text-xs text-muted-foreground">7 overdue invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Billable Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">324.5</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$325</div>
            <p className="text-xs text-muted-foreground">Per hour</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { task: "Contract Review - Smith Case", hours: "2.5", rate: "$350", date: "Today" },
                { task: "Client Meeting - Williams Estate", hours: "1.0", rate: "$350", date: "Yesterday" },
                { task: "Document Analysis - Johnson Property", hours: "3.5", rate: "$300", date: "Dec 16" },
                { task: "Court Filing - Davis Employment", hours: "1.5", rate: "$350", date: "Dec 15" },
              ].map((entry, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">{entry.task}</p>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{entry.hours} hrs</p>
                    <p className="text-xs text-muted-foreground">{entry.rate}/hr</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { client: "Smith Industries", amount: "$8,750", status: "Paid", date: "Dec 15" },
                { client: "Williams Family", amount: "$2,100", status: "Sent", date: "Dec 12" },
                { client: "Johnson Holdings", amount: "$5,250", status: "Overdue", date: "Dec 5" },
                { client: "Davis Technology", amount: "$3,400", status: "Draft", date: "Dec 10" },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">{invoice.client}</p>
                    <p className="text-xs text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{invoice.amount}</p>
                    <Badge variant={invoice.status === "Paid" ? "secondary" : invoice.status === "Overdue" ? "destructive" : "default"} className="text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const FirmSettingsContent = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure firm preferences and integrations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Firm Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Firm Name</label>
              <p className="text-sm text-muted-foreground">Demo Law Firm</p>
            </div>
            <div>
              <label className="text-sm font-medium">Practice Areas</label>
              <p className="text-sm text-muted-foreground">Corporate Law, Estate Planning, Real Estate</p>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <p className="text-sm text-muted-foreground">New York, NY</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Document Summarization</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Risk Analysis</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Clause Extraction</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cross-Reference Check</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">DocuSign</span>
              <Badge variant="secondary">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">QuickBooks</span>
              <Badge variant="secondary">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Google Workspace</span>
              <Badge variant="outline">Not Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Slack</span>
              <Badge variant="outline">Not Connected</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Default Hourly Rate</label>
              <p className="text-sm text-muted-foreground">$350.00</p>
            </div>
            <div>
              <label className="text-sm font-medium">Payment Terms</label>
              <p className="text-sm text-muted-foreground">Net 30 Days</p>
            </div>
            <div>
              <label className="text-sm font-medium">Tax Rate</label>
              <p className="text-sm text-muted-foreground">8.25%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        {/* Firm Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">FirmSync</h1>
              <p className="text-sm text-gray-500">Demo Law Firm</p>
            </div>
          </div>
          
          {/* Ghost Mode Indicator */}
          {ghostMode.isActive && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800">Ghost Mode Active</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">
                Viewing: {ghostMode.firmName || "Demo Firm"}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-blue-700" : "text-gray-400"}`} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases, clients, documents..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-96"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Platform Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}