import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Eye, 
  Play, 
  UserCog, 
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentMetadata {
  doc_type: string;
  uploaded_by: string;
  timestamp: string;
  features_enabled: string[];
  assigned_reviewer: string;
  filename: string;
  file_size: number;
  auto_detected: boolean;
}

interface DocumentWithMetadata extends DocumentMetadata {
  id: number;
  originalName: string;
  status: 'pending' | 'ready' | 'reviewed';
  promptExists: boolean;
}

interface DocumentDashboardProps {
  firmId?: string;
}

export default function DocumentDashboard({ firmId = "firm_1" }: DocumentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithMetadata | null>(null);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [newReviewer, setNewReviewer] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch uploaded documents from database
  const { data: dbDocuments = [] } = useQuery<any[]>({
    queryKey: ["/api/documents"],
  });

  // Fetch review logs metadata
  const { data: reviewLogs = [] } = useQuery<DocumentMetadata[]>({
    queryKey: [`/api/firms/${firmId}/review-logs`],
  });

  // Fetch available users for reviewer assignment
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Combine database documents with review log metadata
  const documentsWithMetadata: DocumentWithMetadata[] = dbDocuments.map((doc: any) => {
    const metadata = reviewLogs.find(log => log.filename === doc.filename);
    return {
      id: doc.id,
      originalName: doc.originalName,
      doc_type: doc.documentType || metadata?.doc_type || 'unknown',
      uploaded_by: metadata?.uploaded_by || 'unknown',
      timestamp: metadata?.timestamp || doc.uploadedAt,
      features_enabled: metadata?.features_enabled || [],
      assigned_reviewer: metadata?.assigned_reviewer || 'unassigned',
      filename: doc.filename,
      file_size: doc.fileSize,
      auto_detected: metadata?.auto_detected || false,
      status: getDocumentStatus(doc, metadata),
      promptExists: !!metadata
    };
  });

  function getDocumentStatus(doc: any, metadata?: DocumentMetadata): 'pending' | 'ready' | 'reviewed' {
    if (doc.status === 'analyzed') return 'reviewed';
    if (metadata && metadata.features_enabled.length > 0) return 'ready';
    return 'pending';
  }

  // Filter documents based on search and status
  const filteredDocuments = documentsWithMetadata.filter(doc => {
    const matchesSearch = (doc.originalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doc.doc_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doc.uploaded_by || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Run AI review mutation
  const runReviewMutation = useMutation({
    mutationFn: async (document: DocumentWithMetadata) => {
      const response = await fetch('/api/review/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firm_id: firmId,
          filename: document.filename
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start AI analysis');
      }

      return response.json();
    },
    onSuccess: (data, document) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: [`/api/firms/${firmId}/review-logs`] });
      toast({
        title: "Analysis Complete",
        description: `AI review completed for ${document.originalName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to complete AI analysis",
        variant: "destructive",
      });
    }
  });

  // Reassign reviewer mutation
  const reassignMutation = useMutation({
    mutationFn: async ({ documentId, newReviewer }: { documentId: number; newReviewer: string }) => {
      // This would update the metadata file - for now just simulate
      console.log(`Reassigning document ${documentId} to ${newReviewer}`);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/firms/${firmId}/review-logs`] });
      setReassignDialogOpen(false);
      toast({
        title: "Reviewer Reassigned",
        description: "Document has been successfully reassigned.",
      });
    }
  });

  const handleReassignReviewer = (document: DocumentWithMetadata) => {
    setSelectedDocument(document);
    setNewReviewer(document.assigned_reviewer);
    setReassignDialogOpen(true);
  };

  const handleRunReview = (document: DocumentWithMetadata) => {
    if (!document.promptExists) {
      toast({
        title: "Prompt Not Ready",
        description: "Document prompt has not been generated yet.",
        variant: "destructive",
      });
      return;
    }

    // Check if already reviewed (prevent multiple reviews without confirmation)
    if (document.status === 'reviewed') {
      if (!confirm(`This document has already been reviewed. Run analysis again?`)) {
        return;
      }
    }

    // Trigger AI review
    runReviewMutation.mutate(document);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Reviewed</Badge>;
      case 'ready':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Ready</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getReviewerBadge = (reviewer: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      associate: 'bg-blue-100 text-blue-800',
      paralegal: 'bg-green-100 text-green-800',
      unassigned: 'bg-gray-100 text-gray-800'
    };
    return colors[reviewer as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="mr-2" size={20} />
            Document Review Dashboard
          </div>
          <Badge variant="outline">{filteredDocuments.length} documents</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search documents, types, or uploaders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents Table */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' ? "No documents match your filters" : "No documents uploaded"}
            </h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? "Try adjusting your search terms or filters"
                : "Upload documents to see them in the review dashboard"
              }
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date Uploaded</TableHead>
                  <TableHead>AI Review Status</TableHead>
                  <TableHead>Assigned Reviewer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.originalName}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(doc.file_size)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {doc.doc_type.toUpperCase()}
                        </Badge>
                        {doc.auto_detected && (
                          <Badge variant="secondary" className="text-xs">
                            Auto-detected
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{doc.uploaded_by}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(doc.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReviewerBadge(doc.assigned_reviewer)}`}>
                        {doc.assigned_reviewer}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleRunReview(doc)}
                          disabled={!doc.promptExists || runReviewMutation.isPending}
                          title={!doc.promptExists ? "Prompt not ready" : "Run AI Review"}
                        >
                          {runReviewMutation.isPending && runReviewMutation.variables?.filename === doc.filename ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleReassignReviewer(doc)}
                        >
                          <UserCog className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Reassign Reviewer Dialog */}
        <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reassign Reviewer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Document: <span className="font-medium">{selectedDocument?.originalName}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Current Reviewer: <span className="font-medium">{selectedDocument?.assigned_reviewer}</span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  New Reviewer
                </label>
                <Select value={newReviewer} onValueChange={setNewReviewer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reviewer..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="associate">Associate</SelectItem>
                    <SelectItem value="paralegal">Paralegal</SelectItem>
                    {users.map((user: any) => (
                      <SelectItem key={user.id} value={user.email}>
                        {user.email} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setReassignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => selectedDocument && reassignMutation.mutate({
                    documentId: selectedDocument.id,
                    newReviewer
                  })}
                  disabled={!newReviewer || reassignMutation.isPending}
                >
                  {reassignMutation.isPending ? 'Reassigning...' : 'Reassign'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}