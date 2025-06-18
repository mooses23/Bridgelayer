import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Eye, 
  EyeOff,
  Building2, 
  Users, 
  Activity, 
  Shield,
  AlertTriangle,
  FileText,
  Edit3,
  Copy,
  Play
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Firm {
  id: number;
  name: string;
  slug: string;
  status: string;
  plan: string;
  onboarded: boolean;
  userCount?: number;
  lastActivity?: string;
}

interface GhostSession {
  id: number;
  adminUserId: number;
  targetFirmId: number;
  firmName: string;
  sessionToken: string;
  isActive: boolean;
  startedAt: string;
  purpose: string;
  notes?: string;
}

interface OnboardingTemplate {
  id: number;
  name: string;
  description: string;
  firmInfo: any;
  branding: any;
  preferences: any;
  integrations: any;
  documentTemplates: any[];
  createdAt: string;
  isDefault: boolean;
}

export default function GhostModePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [isGhostDialogOpen, setIsGhostDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [sessionPurpose, setSessionPurpose] = useState("support");
  const [sessionNotes, setSessionNotes] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<OnboardingTemplate | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch available firms
  const { data: firms = [], isLoading: firmsLoading } = useQuery({
    queryKey: ["/api/admin/firms"],
    queryFn: () => fetch("/api/admin/firms", { credentials: "include" }).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch current ghost session
  const { data: currentSession } = useQuery({
    queryKey: ["/api/admin/ghost/current"],
    queryFn: () => fetch("/api/admin/ghost/current", { credentials: "include" }).then(r => r.json()),
    staleTime: 1 * 60 * 1000,
  });

  // Fetch onboarding templates
  const { data: onboardingTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/admin/onboarding-templates"],
    queryFn: () => fetch("/api/admin/onboarding-templates", { credentials: "include" }).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  // Start ghost session mutation
  const startGhostMutation = useMutation({
    mutationFn: (data: { firmId: number; purpose: string; notes: string }) =>
      fetch("/api/admin/ghost/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      }).then(r => r.json()),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ghost/current"] });
      setIsGhostDialogOpen(false);
      // Redirect to firm dashboard in ghost mode
      window.open(`/dashboard?ghost=${session.sessionToken}`, '_blank');
    },
  });

  // End ghost session mutation
  const endGhostMutation = useMutation({
    mutationFn: (sessionToken: string) =>
      fetch(`/api/admin/ghost/end/${sessionToken}`, {
        method: "POST",
        credentials: "include"
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ghost/current"] });
    },
  });

  // Clone template for editing mutation
  const cloneTemplateMutation = useMutation({
    mutationFn: (templateId: number) =>
      fetch(`/api/admin/onboarding-templates/${templateId}/clone`, {
        method: "POST",
        credentials: "include"
      }).then(r => r.json()),
    onSuccess: (clonedTemplate) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/onboarding-templates"] });
      // Redirect to template editor
      window.open(`/admin/template-editor/${clonedTemplate.id}`, '_blank');
    },
  });

  const filteredFirms = (firms || []).filter((firm: Firm) =>
    firm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    firm.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartGhost = () => {
    if (!selectedFirm) return;
    startGhostMutation.mutate({
      firmId: selectedFirm.id,
      purpose: sessionPurpose,
      notes: sessionNotes
    });
  };

  const handleEndGhost = () => {
    if (currentSession?.sessionToken) {
      endGhostMutation.mutate(currentSession.sessionToken);
    }
  };

  const handleCloneTemplate = (template: OnboardingTemplate) => {
    cloneTemplateMutation.mutate(template.id);
  };

  const handlePreviewTemplate = (template: OnboardingTemplate) => {
    // Open template in preview mode
    window.open(`/admin/template-preview/${template.id}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ghost Mode</h1>
          <p className="text-gray-600">
            Simulate firm experiences and manage onboarding templates
          </p>
        </div>
        
        {currentSession?.isActive && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              Ghost Session Active: {currentSession.firmName}
            </Badge>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleEndGhost}
              disabled={endGhostMutation.isPending}
            >
              <EyeOff className="h-4 w-4 mr-1" />
              End Session
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="firms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="firms">Firm Ghost Mode</TabsTrigger>
          <TabsTrigger value="templates">Onboarding Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="firms" className="space-y-6">
          {/* Active Ghost Session Alert */}
          {currentSession?.isActive && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Active Ghost Session:</strong> You are currently simulating {currentSession.firmName}. 
                All actions are being audited and logged for compliance.
              </AlertDescription>
            </Alert>
          )}

          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Firm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Firms</Label>
                  <Input
                    id="search"
                    placeholder="Search by firm name or subdomain..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Dialog open={isGhostDialogOpen} onOpenChange={setIsGhostDialogOpen}>
                    <DialogTrigger asChild>
                      <Button disabled={!selectedFirm || !!currentSession?.isActive}>
                        <Shield className="h-4 w-4 mr-2" />
                        Start Ghost Mode
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Start Ghost Mode Session</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Ghost mode provides secure firm simulation with full audit trail. 
                            All actions are logged for compliance.
                          </AlertDescription>
                        </Alert>
                        
                        <div>
                          <Label htmlFor="purpose">Purpose</Label>
                          <select
                            id="purpose"
                            value={sessionPurpose}
                            onChange={(e) => setSessionPurpose(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md"
                          >
                            <option value="support">Technical Support</option>
                            <option value="training">User Training</option>
                            <option value="testing">System Testing</option>
                            <option value="debugging">Bug Investigation</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label htmlFor="notes">Session Notes</Label>
                          <textarea
                            id="notes"
                            value={sessionNotes}
                            onChange={(e) => setSessionNotes(e.target.value)}
                            placeholder="Reason for ghost mode access..."
                            className="w-full mt-1 p-2 border rounded-md h-20"
                          />
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                          <Button 
                            onClick={handleStartGhost}
                            disabled={startGhostMutation.isPending}
                            className="flex-1"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Session
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setIsGhostDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Firms List */}
          <div className="grid gap-4">
            {firmsLoading ? (
              <div className="text-center py-8">Loading firms...</div>
            ) : (
              filteredFirms.map((firm: Firm) => (
                <Card 
                  key={firm.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedFirm?.id === firm.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedFirm(firm)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{firm.name}</h3>
                          <p className="text-sm text-gray-600">{firm.slug}.firmsync.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            {firm.userCount || 0} users
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Activity className="w-4 h-4" />
                            {firm.lastActivity || 'No recent activity'}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={firm.status === 'active' ? 'default' : 'secondary'}>
                            {firm.status}
                          </Badge>
                          <Badge variant="outline">
                            {firm.plan}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Law Firm Onboarding Templates
              </CardTitle>
              <p className="text-sm text-gray-600">
                View and edit template configurations for client onboarding demonstrations
              </p>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="text-center py-8">Loading templates...</div>
              ) : (
                <div className="grid gap-4">
                  {onboardingTemplates.map((template: OnboardingTemplate) => (
                    <Card key={template.id} className="hover:bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{template.name}</h3>
                              {template.isDefault && (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                              <span>Document Templates: {template.documentTemplates?.length || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreviewTemplate(template)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCloneTemplate(template)}
                              disabled={cloneTemplateMutation.isPending}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Clone & Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}