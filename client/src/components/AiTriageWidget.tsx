import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Brain, AlertTriangle, CheckCircle, User, FileText, Users, Clock, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface AiTriageResult {
  id: number;
  resourceType: string;
  aiCaseType: string;
  aiUrgencyLevel: string;
  aiRecommendedActions: string[];
  aiSummary: string;
  aiConfidenceScore: number;
  suggestedAssignee?: number;
  flaggedIssues: string[];
  estimatedComplexity: string;
  isHumanReviewed: boolean;
  humanOverride?: any;
  createdAt: string;
  intakeId?: number;
  documentId?: number;
}

const urgencyColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

const complexityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-purple-100 text-purple-800",
  high: "bg-red-100 text-red-800"
};

export default function AiTriageWidget() {
  const [selectedTriage, setSelectedTriage] = useState<AiTriageResult | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: triageResults = [], isLoading } = useQuery({
    queryKey: ["/api/ai-triage"],
    queryFn: () => apiRequest("GET", "/api/ai-triage")
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("GET", "/api/users")
  });

  // Ensure data is always arrays
  const triageArray = Array.isArray(triageResults) ? triageResults : [];
  const usersArray = Array.isArray(users) ? users : [];

  const reviewTriageMutation = useMutation({
    mutationFn: ({ id, overrides }: any) => 
      apiRequest("PUT", `/api/ai-triage/${id}/review`, { overrides }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-triage"] });
      setIsReviewDialogOpen(false);
      setSelectedTriage(null);
      setReviewNotes("");
    }
  });

  const triggerDocumentTriageMutation = useMutation({
    mutationFn: (documentId: number) => 
      apiRequest("POST", `/api/ai-triage/document/${documentId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-triage"] });
    }
  });

  const recentTriage = triageArray
    .sort((a: AiTriageResult, b: AiTriageResult) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const pendingReviews = triageArray.filter((result: AiTriageResult) => !result.isHumanReviewed);
  const highPriorityItems = triageArray.filter((result: AiTriageResult) => 
    result.aiUrgencyLevel === 'urgent' || result.aiUrgencyLevel === 'high'
  );

  const handleReviewTriage = (triage: AiTriageResult) => {
    setSelectedTriage(triage);
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedTriage) return;
    
    const overrides = {
      reviewNotes,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 1 // Demo user ID
    };

    reviewTriageMutation.mutate({ id: selectedTriage.id, overrides });
  };

  const getAssigneeName = (assignedTo?: number) => {
    if (!assignedTo) return "Unassigned";
    const user = usersArray.find((u: any) => u.id === assignedTo);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown";
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Triage & Analysis
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
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold">{pendingReviews.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold">{highPriorityItems.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Analyzed</p>
                <p className="text-2xl font-bold">{triageArray.length}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Triage Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5" />
            AI Triage & Categorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTriage.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No triage results available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTriage.map((result: AiTriageResult) => (
                <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {result.resourceType === 'intake' ? (
                        <Users className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-green-500" />
                      )}
                      <span className="font-medium text-sm">
                        {result.resourceType === 'intake' ? 'Client Intake' : 'Document'} Analysis
                      </span>
                      <Badge className={`text-xs ${urgencyColors[result.aiUrgencyLevel as keyof typeof urgencyColors]}`}>
                        {result.aiUrgencyLevel}
                      </Badge>
                      {!result.isHumanReviewed && (
                        <Badge variant="outline" className="text-xs">
                          Needs Review
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${getConfidenceColor(result.aiConfidenceScore)}`}>
                        {result.aiConfidenceScore}% confidence
                      </span>
                      <Progress value={result.aiConfidenceScore} className="w-16 h-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Case Type</p>
                      <p className="text-sm font-medium">{result.aiCaseType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Complexity</p>
                      <Badge className={`text-xs ${complexityColors[result.estimatedComplexity as keyof typeof complexityColors]}`}>
                        {result.estimatedComplexity}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-1">AI Summary</p>
                    <p className="text-sm text-gray-800 line-clamp-2">{result.aiSummary}</p>
                  </div>

                  {result.aiRecommendedActions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Recommended Actions</p>
                      <div className="flex flex-wrap gap-1">
                        {result.aiRecommendedActions.slice(0, 3).map((action, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.flaggedIssues.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Flagged Issues</p>
                      <div className="flex flex-wrap gap-1">
                        {result.flaggedIssues.slice(0, 2).map((issue, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Analyzed {format(new Date(result.createdAt), "MMM d, h:mm a")}</span>
                      {result.suggestedAssignee && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Suggested: {getAssigneeName(result.suggestedAssignee)}
                        </span>
                      )}
                    </div>
                    {!result.isHumanReviewed ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReviewTriage(result)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Reviewed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review AI Triage Analysis</DialogTitle>
          </DialogHeader>
          {selectedTriage && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">AI Assessment Summary</h4>
                <p className="text-sm text-gray-700 mb-2">{selectedTriage.aiSummary}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span><strong>Type:</strong> {selectedTriage.aiCaseType}</span>
                  <span><strong>Urgency:</strong> {selectedTriage.aiUrgencyLevel}</span>
                  <span><strong>Complexity:</strong> {selectedTriage.estimatedComplexity}</span>
                  <span><strong>Confidence:</strong> {selectedTriage.aiConfidenceScore}%</span>
                </div>
              </div>

              <div>
                <Label htmlFor="reviewNotes">Review Notes & Corrections</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any corrections, additional notes, or confirmation of the AI assessment..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitReview} 
                  className="flex-1"
                  disabled={reviewTriageMutation.isPending}
                >
                  {reviewTriageMutation.isPending ? "Submitting..." : "Accept & Approve"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsReviewDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}