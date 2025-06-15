import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Shield, Clock, User, AlertTriangle, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface GhostSession {
  id: number;
  targetFirmId: number;
  purpose: string;
  isActive: boolean;
  actionsPerformed: string[];
  viewedData: any;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  firmName?: string;
}

interface Firm {
  id: number;
  name: string;
  status: string;
  subscriptionTier: string;
  userCount: number;
}

export default function AdminGhostMode() {
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [isStartSessionDialogOpen, setIsStartSessionDialogOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<GhostSession | null>(null);
  const [sessionPurpose, setSessionPurpose] = useState("support");
  const [sessionNotes, setSessionNotes] = useState("");

  const queryClient = useQueryClient();

  // Fetch available firms for admin access
  const { data: firms = [], isLoading: firmsLoading } = useQuery({
    queryKey: ["/api/admin/firms"],
    queryFn: () => apiRequest("/api/admin/firms")
  });

  // Fetch active ghost session if any
  const { data: currentSession, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/admin/ghost-session/current"],
    queryFn: () => apiRequest("/api/admin/ghost-session/current")
  });

  // Fetch ghost session history
  const { data: sessionHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["/api/admin/ghost-sessions"],
    queryFn: () => apiRequest("/api/admin/ghost-sessions")
  });

  // Start ghost session mutation
  const startSessionMutation = useMutation({
    mutationFn: (sessionData: any) => apiRequest("POST", "/api/admin/ghost-session/start", sessionData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ghost-session/current"] });
      setActiveSession(response);
      setIsStartSessionDialogOpen(false);
      // Redirect to firm dashboard with ghost mode active
      window.location.href = `/dashboard?ghost=${response.sessionToken}`;
    }
  });

  // End ghost session mutation
  const endSessionMutation = useMutation({
    mutationFn: (sessionId: number) => apiRequest("POST", `/api/admin/ghost-session/${sessionId}/end`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ghost-session/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ghost-sessions"] });
      setActiveSession(null);
      // Return to admin dashboard
      window.location.href = "/admin";
    }
  });

  const handleStartSession = () => {
    if (!selectedFirm) return;

    startSessionMutation.mutate({
      targetFirmId: selectedFirm.id,
      purpose: sessionPurpose,
      notes: sessionNotes
    });
  };

  const handleEndSession = () => {
    if (currentSession) {
      endSessionMutation.mutate(currentSession.id);
    }
  };

  const purposeColors = {
    support: "bg-blue-100 text-blue-800",
    demo: "bg-green-100 text-green-800",
    audit: "bg-red-100 text-red-800",
    training: "bg-purple-100 text-purple-800"
  };

  if (firmsLoading || sessionLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Ghost Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Session Alert */}
      {currentSession && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="font-medium text-orange-800">
                Ghost Mode Active: {currentSession.firmName}
              </span>
              <span className="text-orange-700 ml-2">
                ({currentSession.purpose} - {format(new Date(currentSession.startedAt), "h:mm a")})
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEndSession}
              disabled={endSessionMutation.isPending}
              className="border-orange-300 text-orange-800 hover:bg-orange-100"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Exit Ghost Mode
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Ghost Mode
            </CardTitle>
            <Dialog open={isStartSessionDialogOpen} onOpenChange={setIsStartSessionDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!!currentSession}>
                  <Eye className="w-4 h-4 mr-1" />
                  Start Ghost Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Start Ghost Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firm">Target Firm</Label>
                    <Select onValueChange={(value) => setSelectedFirm(firms.find((f: Firm) => f.id.toString() === value) || null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a firm" />
                      </SelectTrigger>
                      <SelectContent>
                        {firms.map((firm: Firm) => (
                          <SelectItem key={firm.id} value={firm.id.toString()}>
                            {firm.name} ({firm.subscriptionTier})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Session Purpose</Label>
                    <Select value={sessionPurpose} onValueChange={setSessionPurpose}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support">Customer Support</SelectItem>
                        <SelectItem value="demo">Product Demo</SelectItem>
                        <SelectItem value="audit">Compliance Audit</SelectItem>
                        <SelectItem value="training">User Training</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Session Notes</Label>
                    <Textarea
                      id="notes"
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      placeholder="Reason for accessing this firm's data"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsStartSessionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleStartSession}
                      disabled={startSessionMutation.isPending || !selectedFirm || !sessionNotes}
                    >
                      Start Session
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {firms.map((firm: Firm) => (
              <Card key={firm.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{firm.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {firm.subscriptionTier}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{firm.userCount} users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${firm.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span>{firm.status}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    disabled={!!currentSession}
                    onClick={() => {
                      setSelectedFirm(firm);
                      setIsStartSessionDialogOpen(true);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Access Firm
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Ghost Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : sessionHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <EyeOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No ghost sessions recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessionHistory.map((session: GhostSession) => (
                <div key={session.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium">{session.firmName}</h5>
                        <Badge className={purposeColors[session.purpose as keyof typeof purposeColors]}>
                          {session.purpose}
                        </Badge>
                        {session.isActive && (
                          <Badge variant="destructive" className="text-xs">Active</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(session.startedAt), "MMM d, h:mm a")}
                        </span>
                        {session.durationMinutes && (
                          <span>{session.durationMinutes} minutes</span>
                        )}
                        <span>{session.actionsPerformed.length} actions</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}