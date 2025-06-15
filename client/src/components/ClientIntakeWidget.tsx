import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Mail, Phone, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface ClientIntake {
  id: number;
  intakeNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  caseType: string;
  urgencyLevel: string;
  caseDescription: string;
  status: string;
  assignedTo?: number;
  submittedAt: string;
}

const caseTypes = [
  { value: "personal_injury", label: "Personal Injury" },
  { value: "family_law", label: "Family Law" },
  { value: "criminal_defense", label: "Criminal Defense" },
  { value: "business_law", label: "Business Law" },
  { value: "real_estate", label: "Real Estate" },
  { value: "employment", label: "Employment Law" },
  { value: "immigration", label: "Immigration" },
  { value: "estate_planning", label: "Estate Planning" }
];

const urgencyLevels = [
  { value: "low", label: "Low Priority", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium Priority", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High Priority", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" }
];

const statusColors = {
  received: "bg-blue-100 text-blue-800",
  drafted: "bg-yellow-100 text-yellow-800",
  filed: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800"
};

export default function ClientIntakeWidget() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIntake, setNewIntake] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    caseType: "",
    urgencyLevel: "",
    caseDescription: "",
    preferredContactMethod: "email"
  });

  const queryClient = useQueryClient();

  const { data: intakes = [], isLoading } = useQuery({
    queryKey: ["/api/client-intakes"],
    queryFn: () => apiRequest("GET", "/api/client-intakes")
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("GET", "/api/users")
  });

  // Ensure data is always arrays
  const intakesArray = Array.isArray(intakes) ? intakes : [];
  const usersArray = Array.isArray(users) ? users : [];

  const createIntakeMutation = useMutation({
    mutationFn: (intakeData: any) => apiRequest("POST", "/api/client-intakes", intakeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-intakes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-triage"] });
      setIsDialogOpen(false);
      setNewIntake({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        caseType: "",
        urgencyLevel: "",
        caseDescription: "",
        preferredContactMethod: "email"
      });
    }
  });

  const updateIntakeMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/client-intakes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-intakes"] });
    }
  });

  const recentIntakes = intakesArray
    .sort((a: ClientIntake, b: ClientIntake) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
    .slice(0, 5);

  const handleCreateIntake = () => {
    if (!newIntake.clientName || !newIntake.clientEmail || !newIntake.caseType || !newIntake.urgencyLevel) return;
    
    createIntakeMutation.mutate(newIntake);
  };

  const handleStatusUpdate = (intakeId: number, newStatus: string) => {
    updateIntakeMutation.mutate({ id: intakeId, status: newStatus });
  };

  const getUrgencyColor = (urgency: string) => {
    return urgencyLevels.find(level => level.value === urgency)?.color || "bg-gray-100 text-gray-800";
  };

  const getCaseTypeLabel = (caseType: string) => {
    return caseTypes.find(type => type.value === caseType)?.label || caseType;
  };

  const getAssigneeName = (assignedTo?: number) => {
    if (!assignedTo) return "Unassigned";
    const user = usersArray.find((u: any) => u.id === assignedTo);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Client Intake Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Client Intake Portal
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              New Intake
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Client Intake</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={newIntake.clientName}
                    onChange={(e) => setNewIntake(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email Address</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={newIntake.clientEmail}
                    onChange={(e) => setNewIntake(prev => ({ ...prev, clientEmail: e.target.value }))}
                    placeholder="client@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientPhone">Phone Number</Label>
                  <Input
                    id="clientPhone"
                    value={newIntake.clientPhone}
                    onChange={(e) => setNewIntake(prev => ({ ...prev, clientPhone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="preferredContact">Preferred Contact</Label>
                  <Select value={newIntake.preferredContactMethod} onValueChange={(value) => setNewIntake(prev => ({ ...prev, preferredContactMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caseType">Case Type</Label>
                  <Select value={newIntake.caseType} onValueChange={(value) => setNewIntake(prev => ({ ...prev, caseType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select case type" />
                    </SelectTrigger>
                    <SelectContent>
                      {caseTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgencyLevel">Urgency Level</Label>
                  <Select value={newIntake.urgencyLevel} onValueChange={(value) => setNewIntake(prev => ({ ...prev, urgencyLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="caseDescription">Case Description</Label>
                <Textarea
                  id="caseDescription"
                  value={newIntake.caseDescription}
                  onChange={(e) => setNewIntake(prev => ({ ...prev, caseDescription: e.target.value }))}
                  placeholder="Briefly describe the legal matter..."
                  rows={4}
                />
              </div>

              <Button onClick={handleCreateIntake} className="w-full" disabled={createIntakeMutation.isPending}>
                {createIntakeMutation.isPending ? "Submitting..." : "Submit Intake"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {recentIntakes.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No client intakes</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-3">Recent Intakes</div>
            {recentIntakes.map((intake: ClientIntake) => (
              <div key={intake.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">{intake.clientName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {intake.intakeNumber}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {intake.clientEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {getCaseTypeLabel(intake.caseType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getUrgencyColor(intake.urgencyLevel)}`}>
                        {urgencyLevels.find(l => l.value === intake.urgencyLevel)?.label}
                      </Badge>
                      <Badge className={`text-xs ${statusColors[intake.status as keyof typeof statusColors]}`}>
                        {intake.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(intake.submittedAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {intake.caseDescription}
                    </p>
                  </div>
                  <div className="ml-3">
                    <Select value={intake.status} onValueChange={(value) => handleStatusUpdate(intake.id, value)}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="drafted">Drafted</SelectItem>
                        <SelectItem value="filed">Filed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}