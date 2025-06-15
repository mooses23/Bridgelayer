import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Phone, Mail, FileText, Download, Upload, User, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface CommunicationEntry {
  id: number;
  clientId: number;
  caseId?: number;
  communicationType: string;
  direction: string;
  subject: string;
  content: string;
  contactMethod: string;
  participantNames: string[];
  attachmentUrls: string[];
  isAutoLogged: boolean;
  followUpRequired: boolean;
  followUpDate?: string;
  createdBy: number;
  createdAt: string;
  clientName?: string;
  caseName?: string;
  userName?: string;
}

const communicationTypeColors = {
  call: "bg-green-100 text-green-800",
  email: "bg-blue-100 text-blue-800",
  meeting: "bg-purple-100 text-purple-800",
  letter: "bg-orange-100 text-orange-800",
  fax: "bg-gray-100 text-gray-800",
  text: "bg-yellow-100 text-yellow-800"
};

const directionIcons = {
  inbound: <Phone className="w-3 h-3 rotate-180" />,
  outbound: <Phone className="w-3 h-3" />
};

interface CommunicationsLogProps {
  clientId?: number;
  caseId?: number;
  compact?: boolean;
}

export default function CommunicationsLog({ clientId, caseId, compact = false }: CommunicationsLogProps) {
  const [selectedEntry, setSelectedEntry] = useState<CommunicationEntry | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    clientId: clientId?.toString() || "",
    caseId: caseId?.toString() || "",
    communicationType: "call",
    direction: "outbound",
    subject: "",
    content: "",
    contactMethod: "phone",
    participantNames: "",
    followUpRequired: false,
    followUpDate: ""
  });

  const queryClient = useQueryClient();

  // Build query params
  const queryParams = new URLSearchParams();
  if (clientId) queryParams.append('clientId', clientId.toString());
  if (caseId) queryParams.append('caseId', caseId.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/api/communications${queryString ? `?${queryString}` : ''}`;

  // Fetch communications
  const { data: communications = [], isLoading } = useQuery({
    queryKey: ["/api/communications", clientId, caseId],
    queryFn: () => apiRequest(endpoint)
  });

  // Create communication mutation
  const createCommunicationMutation = useMutation({
    mutationFn: (entryData: any) => apiRequest("POST", "/api/communications", entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communications"] });
      setIsCreateDialogOpen(false);
      setNewEntry({
        clientId: clientId?.toString() || "",
        caseId: caseId?.toString() || "",
        communicationType: "call",
        direction: "outbound",
        subject: "",
        content: "",
        contactMethod: "phone",
        participantNames: "",
        followUpRequired: false,
        followUpDate: ""
      });
    }
  });

  // Export communications mutation
  const exportCommunicationsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/communications/export", { clientId, caseId }),
    onSuccess: (response) => {
      // Create download link for exported data
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `communications-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  });

  const handleCreateEntry = () => {
    createCommunicationMutation.mutate({
      ...newEntry,
      clientId: newEntry.clientId ? parseInt(newEntry.clientId) : null,
      caseId: newEntry.caseId ? parseInt(newEntry.caseId) : null,
      participantNames: newEntry.participantNames.split(',').map(name => name.trim()).filter(Boolean),
      followUpDate: newEntry.followUpDate || null
    });
  };

  const handleExportCommunications = () => {
    exportCommunicationsMutation.mutate();
  };

  const handleViewEntry = (entry: CommunicationEntry) => {
    setSelectedEntry(entry);
    setIsViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Communications Log
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

  const recentCommunications = compact ? communications.slice(0, 5) : communications;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Communications Log
            {(clientId || caseId) && (
              <Badge variant="secondary" className="ml-2">
                {communications.length} entries
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCommunications}
              disabled={exportCommunicationsMutation.isPending || communications.length === 0}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Log Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Log Communication</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="communicationType">Type</Label>
                      <Select value={newEntry.communicationType} onValueChange={(value) => setNewEntry(prev => ({ ...prev, communicationType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">Phone Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="letter">Letter</SelectItem>
                          <SelectItem value="fax">Fax</SelectItem>
                          <SelectItem value="text">Text Message</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="direction">Direction</Label>
                      <Select value={newEntry.direction} onValueChange={(value) => setNewEntry(prev => ({ ...prev, direction: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inbound">Incoming</SelectItem>
                          <SelectItem value="outbound">Outgoing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject/Purpose</Label>
                    <Input
                      id="subject"
                      value={newEntry.subject}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of communication"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Details</Label>
                    <Textarea
                      id="content"
                      value={newEntry.content}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Detailed notes about the communication"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="participantNames">Participants</Label>
                    <Input
                      id="participantNames"
                      value={newEntry.participantNames}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, participantNames: e.target.value }))}
                      placeholder="John Doe, Jane Smith (comma separated)"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="followUpRequired"
                        checked={newEntry.followUpRequired}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="followUpRequired">Follow-up required</Label>
                    </div>
                    {newEntry.followUpRequired && (
                      <div>
                        <Input
                          type="date"
                          value={newEntry.followUpDate}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, followUpDate: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateEntry}
                      disabled={createCommunicationMutation.isPending || !newEntry.subject || !newEntry.content}
                    >
                      Log Communication
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recentCommunications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No communications logged</p>
            <p className="text-sm">Start by logging your first client interaction</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCommunications.map((entry: CommunicationEntry) => (
              <div
                key={entry.id}
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewEntry(entry)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={communicationTypeColors[entry.communicationType as keyof typeof communicationTypeColors]}>
                        {entry.communicationType}
                      </Badge>
                      <span className="flex items-center gap-1">
                        {directionIcons[entry.direction as keyof typeof directionIcons]}
                        <span className="text-xs text-gray-600">{entry.direction}</span>
                      </span>
                      {entry.isAutoLogged && (
                        <Badge variant="outline" className="text-xs">Auto-logged</Badge>
                      )}
                    </div>
                    <h5 className="font-medium">{entry.subject}</h5>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{entry.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(entry.createdAt), "MMM d, h:mm a")}
                      </span>
                      {entry.clientName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {entry.clientName}
                        </span>
                      )}
                      {entry.participantNames.length > 0 && (
                        <span>Participants: {entry.participantNames.join(", ")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {entry.followUpRequired && (
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800">
                        Follow-up
                      </Badge>
                    )}
                    {entry.attachmentUrls.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        {entry.attachmentUrls.length}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* View Communication Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Communication Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={communicationTypeColors[selectedEntry.communicationType as keyof typeof communicationTypeColors]}>
                  {selectedEntry.communicationType}
                </Badge>
                <span className="flex items-center gap-1">
                  {directionIcons[selectedEntry.direction as keyof typeof directionIcons]}
                  <span className="text-sm text-gray-600">{selectedEntry.direction}</span>
                </span>
                {selectedEntry.isAutoLogged && (
                  <Badge variant="outline" className="text-xs">Auto-logged</Badge>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <p className="text-sm">{selectedEntry.subject}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Details</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedEntry.content}</p>
              </div>

              {selectedEntry.participantNames.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Participants</Label>
                  <p className="text-sm">{selectedEntry.participantNames.join(", ")}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs font-medium text-gray-500">Date/Time</Label>
                  <p>{format(new Date(selectedEntry.createdAt), "MMM d, yyyy h:mm a")}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">Logged by</Label>
                  <p>{selectedEntry.userName || "System"}</p>
                </div>
              </div>

              {selectedEntry.followUpRequired && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Follow-up Required</span>
                  </div>
                  {selectedEntry.followUpDate && (
                    <p className="text-sm text-yellow-700 mt-1">
                      Due: {format(new Date(selectedEntry.followUpDate), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}