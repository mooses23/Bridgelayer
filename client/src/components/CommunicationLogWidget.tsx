import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageSquare, Phone, Mail, FileText, Users, Calendar, Download, Plus } from "lucide-react";
import { format } from "date-fns";

interface CommunicationLog {
  id: number;
  firmId: number;
  clientId: number;
  caseId?: number;
  userId: number;
  type: string;
  direction?: string;
  subject?: string;
  content: string;
  attachments?: any[];
  metadata?: any;
  isPrivate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ClientIntake {
  id: number;
  clientName: string;
  email: string;
}

export function CommunicationLogWidget() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [newLog, setNewLog] = useState({
    clientId: "",
    caseId: "",
    type: "note",
    direction: "",
    subject: "",
    content: "",
    tags: [] as string[]
  });

  const queryClient = useQueryClient();

  // Fetch communication logs
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["/api/communication-logs", selectedClientId],
    queryFn: async () => {
      const params = selectedClientId && selectedClientId !== "all" ? `?clientId=${selectedClientId}` : "";
      const response = await fetch(`/api/communication-logs${params}`);
      return response.json();
    }
  });

  // Fetch client intakes for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/client-intakes"],
    queryFn: async () => {
      const response = await fetch("/api/client-intakes");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Create communication log mutation
  const createLogMutation = useMutation({
    mutationFn: async (logData: any) => {
      const response = await fetch("/api/communication-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communication-logs"] });
      setIsCreateDialogOpen(false);
      setNewLog({
        clientId: "",
        caseId: "",
        type: "note",
        direction: "",
        subject: "",
        content: "",
        tags: []
      });
    }
  });

  const handleCreateLog = () => {
    if (!newLog.content.trim()) return;

    createLogMutation.mutate({
      ...newLog,
      clientId: parseInt(newLog.clientId),
      caseId: newLog.caseId ? parseInt(newLog.caseId) : null
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "call": return <Phone className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "meeting": return <Calendar className="h-4 w-4" />;
      case "document_shared": return <FileText className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getDirectionColor = (direction?: string) => {
    switch (direction) {
      case "inbound": return "bg-green-100 text-green-800";
      case "outbound": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ["Date", "Client", "Type", "Direction", "Subject", "Content", "Tags"].join(","),
      ...logs.map((log: CommunicationLog) => [
        format(new Date(log.createdAt), "yyyy-MM-dd HH:mm"),
        clients.find((c: ClientIntake) => c.id === log.clientId)?.clientName || "Unknown",
        log.type,
        log.direction || "",
        log.subject || "",
        `"${log.content.replace(/"/g, '""')}"`,
        log.tags.join("; ")
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `communication-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Communication Log
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Log
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Communication Log</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select onValueChange={(value) => setNewLog({ ...newLog, clientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(clients) && clients.map((client: ClientIntake) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.clientName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select onValueChange={(value) => setNewLog({ ...newLog, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="document_shared">Document Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newLog.type === "call" || newLog.type === "email") && (
                  <div>
                    <Label htmlFor="direction">Direction</Label>
                    <Select onValueChange={(value) => setNewLog({ ...newLog, direction: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inbound">Inbound</SelectItem>
                        <SelectItem value="outbound">Outbound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newLog.subject}
                    onChange={(e) => setNewLog({ ...newLog, subject: e.target.value })}
                    placeholder="Brief subject line"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newLog.content}
                    onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
                    placeholder="Communication details..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleCreateLog} 
                  disabled={createLogMutation.isPending || !newLog.content.trim()}
                  className="w-full"
                >
                  {createLogMutation.isPending ? "Adding..." : "Add Log"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-b p-4">
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {Array.isArray(clients) && clients.map((client: ClientIntake) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No communication logs found
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {logs.map((log: CommunicationLog) => (
                <div key={log.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(log.type)}
                      <span className="font-medium capitalize">{log.type.replace("_", " ")}</span>
                      {log.direction && (
                        <Badge variant="secondary" className={getDirectionColor(log.direction)}>
                          {log.direction}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM d, HH:mm")}
                    </span>
                  </div>
                  {log.subject && (
                    <div className="font-medium text-sm">{log.subject}</div>
                  )}
                  <div className="text-sm text-muted-foreground">{log.content}</div>
                  {log.tags && log.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {log.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}