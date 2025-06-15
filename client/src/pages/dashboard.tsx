import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Upload,
  Folder,
  Users,
  Activity,
  Calendar,
  Brain
} from "lucide-react";
import CalendarWidget from "@/components/CalendarWidget";
import ClientIntakeWidget from "@/components/ClientIntakeWidget";
import AiTriageWidget from "@/components/AiTriageWidget";
import { CommunicationLogWidget } from "@/components/CommunicationLogWidget";
import { AdminGhostModeWidget } from "@/components/AdminGhostModeWidget";

export default function Dashboard() {
  // Fetch dashboard data
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: () => fetch("/api/documents").then(res => res.json())
  });

  const { data: folders } = useQuery({
    queryKey: ["/api/folders"],
    queryFn: () => fetch("/api/folders").then(res => res.json())
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(res => res.json())
  });

  const { data: firm } = useQuery({
    queryKey: ["/api/firm"],
    queryFn: () => fetch("/api/firm").then(res => res.json())
  });

  // Calculate metrics
  const totalDocuments = documents?.length || 0;
  const analyzedDocuments = documents?.filter((doc: any) => doc.status === 'analyzed').length || 0;
  const processingDocuments = documents?.filter((doc: any) => doc.status === 'processing').length || 0;
  const recentDocuments = documents?.slice(0, 5) || [];
  const analysisProgress = totalDocuments > 0 ? (analyzedDocuments / totalDocuments) * 100 : 0;

  // Plan limits (mock data - would come from billing system)
  const planLimits = {
    starter: { documents: 100, users: 5, storage: 1 },
    professional: { documents: 500, users: 20, storage: 10 },
    enterprise: { documents: -1, users: -1, storage: -1 }
  };

  const currentLimits = planLimits[firm?.plan as keyof typeof planLimits] || planLimits.starter;
  const documentUsage = currentLimits.documents === -1 ? 0 : (totalDocuments / currentLimits.documents) * 100;
  const userUsage = currentLimits.users === -1 ? 0 : ((users?.length || 0) / currentLimits.users) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, John</h1>
          <p className="text-gray-600">Here's what's happening with your legal documents today.</p>
        </div>
        <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            New Folder
          </Button>
          <Button className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {currentLimits.documents === -1 ? 'Unlimited' : `${currentLimits.documents - totalDocuments} remaining`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyzed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyzedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {totalDocuments > 0 ? `${Math.round(analysisProgress)}% complete` : 'No documents yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {processingDocuments > 0 ? 'In progress' : 'All caught up'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {currentLimits.users === -1 ? 'Unlimited' : `${currentLimits.users - (users?.length || 0)} available`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Analytics */}
      {firm?.plan !== 'enterprise' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Documents Used</span>
                <span className="text-sm font-medium">
                  {totalDocuments} / {currentLimits.documents === -1 ? '∞' : currentLimits.documents}
                </span>
              </div>
              <Progress value={documentUsage} className="h-2" />
              {documentUsage > 80 && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Approaching limit - consider upgrading
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Team Members</span>
                <span className="text-sm font-medium">
                  {users?.length || 0} / {currentLimits.users === -1 ? '∞' : currentLimits.users}
                </span>
              </div>
              <Progress value={userUsage} className="h-2" />
              <Button variant="outline" size="sm" className="w-full">
                Invite Team Member
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documentsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentDocuments.length > 0 ? (
              <div className="space-y-4">
                {recentDocuments.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-48">{doc.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      doc.status === 'analyzed' ? 'default' :
                      doc.status === 'processing' ? 'secondary' :
                      doc.status === 'error' ? 'destructive' : 'outline'
                    }>
                      {doc.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  View All Documents
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No documents uploaded yet</p>
                <Button className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Your First Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload New Document
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Folder className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Invite Team Member
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Three New Features in Dashboard Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CalendarWidget />
        </div>
        <div>
          <ClientIntakeWidget />
        </div>
      </div>

      {/* AI Triage Section */}
      <AiTriageWidget />

      {/* CRM Communication Logs and Admin Ghost Mode */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CommunicationLogWidget />
        <AdminGhostModeWidget />
      </div>

      {/* Firm Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Firm Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Firm Name</p>
              <p className="font-medium">{firm?.name || 'Loading...'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <Badge variant="outline" className="capitalize mt-1">
                {firm?.plan || 'Loading...'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className="mt-1 capitalize">
                {firm?.status || 'Loading...'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}