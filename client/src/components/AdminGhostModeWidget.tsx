import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Users, Shield, AlertTriangle, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Firm {
  id: number;
  name: string;
  slug: string;
  status: string;
}

interface AdminGhostSession {
  id: number;
  adminUserId: number;
  targetFirmId: number;
  sessionToken: string;
  isActive: boolean;
  permissions: {
    read: boolean;
    write: boolean;
  };
  auditTrail: any[];
  startedAt: string;
  endedAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

export function AdminGhostModeWidget() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedFirmId, setSelectedFirmId] = useState<string>("");
  const [activeSession, setActiveSession] = useState<AdminGhostSession | null>(null);

  const queryClient = useQueryClient();

  // Fetch active ghost sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["/api/admin/ghost-sessions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/ghost-sessions");
      return response.json();
    }
  });

  // Fetch firms for selection
  const { data: firms = [] } = useQuery({
    queryKey: ["/api/firms"],
    queryFn: async () => {
      const response = await fetch("/api/firms");
      return response.json();
    }
  });

  // Create ghost session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (firmId: number) => {
      const response = await fetch("/api/admin/ghost-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetFirmId: firmId,
          permissions: { read: true, write: false } // Read-only by default
        })
      });
      return response.json();
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ghost-sessions"] });
      setActiveSession(session);
      setIsCreateDialogOpen(false);
      setSelectedFirmId("");
    }
  });

  // End ghost session mutation
  const endSessionMutation = useMutation({
    mutationFn: async (sessionToken: string) => {
      const response = await fetch(`/api/admin/ghost-session/${sessionToken}/end`, {
        method: "POST"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ghost-sessions"] });
      setActiveSession(null);
    }
  });

  const handleCreateSession = () => {
    if (!selectedFirmId) return;
    createSessionMutation.mutate(parseInt(selectedFirmId));
  };

  const handleEndSession = (sessionToken: string) => {
    endSessionMutation.mutate(sessionToken);
  };

  const openGhostView = (session: AdminGhostSession) => {
    // In a real implementation, this would navigate to a ghost view
    // For demo purposes, we'll just set it as active
    setActiveSession(session);
    
    // Simulate opening in new window/tab with firm context
    const firm = firms.find((f: Firm) => f.id === session.targetFirmId);
    if (firm) {
      // This would typically open the firm's dashboard in ghost mode
      console.log(`Opening ghost view for ${firm.name}`);
      
      // In production, you might do:
      // window.open(`/ghost/${session.sessionToken}`, '_blank');
    }
  };

  const currentSession = (Array.isArray(sessions) ? sessions.find((s: AdminGhostSession) => s.isActive) : null) || activeSession;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Admin Ghost Mode
        </CardTitle>
        <div className="flex gap-2">
          {currentSession && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleEndSession(currentSession.sessionToken)}
              disabled={endSessionMutation.isPending}
            >
              <EyeOff className="h-4 w-4 mr-1" />
              Exit Ghost Mode
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={!!currentSession}>
                <Shield className="h-4 w-4 mr-1" />
                Start Ghost View
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
                    Ghost mode provides read-only access to simulate firm experience. 
                    All actions are audited and no cross-tenant data exposure is allowed.
                  </AlertDescription>
                </Alert>
                <div>
                  <Label htmlFor="firm">Target Firm</Label>
                  <Select value={selectedFirmId} onValueChange={setSelectedFirmId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select firm to ghost view" />
                    </SelectTrigger>
                    <SelectContent>
                      {firms.map((firm: Firm) => (
                        <SelectItem key={firm.id} value={firm.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{firm.name}</span>
                            <Badge variant={firm.status === 'active' ? 'default' : 'secondary'}>
                              {firm.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateSession} 
                  disabled={createSessionMutation.isPending || !selectedFirmId}
                  className="w-full"
                >
                  {createSessionMutation.isPending ? "Starting..." : "Start Ghost Session"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {currentSession ? (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Ghost Mode Active:</strong> Viewing {firms.find((f: Firm) => f.id === currentSession.targetFirmId)?.name}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session Started:</span>
                <span>{format(new Date(currentSession.startedAt), "MMM d, HH:mm")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Permissions:</span>
                <div className="flex gap-1">
                  <Badge variant="secondary">Read</Badge>
                  {currentSession.permissions.write && (
                    <Badge variant="destructive">Write</Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session ID:</span>
                <span className="font-mono text-xs">{currentSession.sessionToken.slice(0, 8)}...</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => openGhostView(currentSession)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Firm Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active ghost sessions</p>
                <p className="text-xs">Start a session to view firm experience</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recent Sessions</h4>
                {Array.isArray(sessions) && sessions.slice(0, 3).map((session: AdminGhostSession) => (
                  <div key={session.id} className="border rounded p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {firms.find((f: Firm) => f.id === session.targetFirmId)?.name || "Unknown Firm"}
                      </span>
                      <Badge variant={session.isActive ? "default" : "secondary"}>
                        {session.isActive ? "Active" : "Ended"}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {format(new Date(session.startedAt), "MMM d, HH:mm")}
                      {session.endedAt && ` - ${format(new Date(session.endedAt), "HH:mm")}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminGhostModeWidget;