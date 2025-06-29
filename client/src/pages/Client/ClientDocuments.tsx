import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye, FileText, Filter } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Document } from "../../../../shared/schema";

export default function ClientDocuments() {
  const { user } = useSession();

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/client/documents', user?.id],
    queryFn: () => apiRequest('GET', `/api/client/documents?clientId=${user?.id}`),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'final':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4" />;
  };

  const fallbackDocuments: Document[] = [
    {
      id: 1,
      firmId: 1,
      folderId: null,
      fileName: "initial-consultation-notes.pdf",
      originalName: "Initial Consultation Notes",
      fileSize: 262144,
      mimeType: "application/pdf",
      documentType: "Meeting Notes",
      uploadedBy: 1,
      uploadedAt: new Date("2025-01-20"),
      assignedReviewer: null,
      reviewStatus: "completed",
      status: "Final",
      analyzedAt: new Date("2025-01-20"),
      content: null,
      userId: user?.id || 1,
      tags: null,
      metadata: null,
      createdAt: new Date("2025-01-20"),
      updatedAt: new Date("2025-01-20")
    },
    {
      id: 2,
      firmId: 1,
      folderId: null,
      fileName: "contract-amendment-v2.pdf",
      originalName: "Contract Amendment v2",
      fileSize: 1258291,
      mimeType: "application/pdf",
      documentType: "Contract",
      uploadedBy: 1,
      uploadedAt: new Date("2025-01-18"),
      assignedReviewer: null,
      reviewStatus: "pending",
      status: "Draft",
      analyzedAt: null,
      content: null,
      userId: user?.id || 1,
      tags: null,
      metadata: null,
      createdAt: new Date("2025-01-18"),
      updatedAt: new Date("2025-01-18")
    },
    {
      id: 3,
      firmId: 1,
      folderId: null,
      fileName: "legal-opinion-letter.pdf",
      originalName: "Legal Opinion Letter",
      fileSize: 524288,
      mimeType: "application/pdf",
      documentType: "Letter",
      uploadedBy: 1,
      uploadedAt: new Date("2025-01-15"),
      assignedReviewer: null,
      reviewStatus: "completed",
      status: "Final",
      analyzedAt: new Date("2025-01-15"),
      content: null,
      userId: user?.id || 1,
      tags: null,
      metadata: null,
      createdAt: new Date("2025-01-15"),
      updatedAt: new Date("2025-01-15")
    },
    {
      id: 4,
      firmId: 1,
      folderId: null,
      fileName: "discovery-documents.zip",
      originalName: "Discovery Documents",
      fileSize: 3565158,
      mimeType: "application/zip",
      documentType: "Discovery",
      uploadedBy: 1,
      uploadedAt: new Date("2025-01-10"),
      assignedReviewer: 1,
      reviewStatus: "in_review",
      status: "Review",
      analyzedAt: null,
      content: null,
      userId: user?.id || 1,
      tags: null,
      metadata: null,
      createdAt: new Date("2025-01-10"),
      updatedAt: new Date("2025-01-10")
    }
  ];

  const displayDocuments = documents.length > 0 ? documents : fallbackDocuments;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Access and download your case documents
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by document name or type..."
                  className="pl-8"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayDocuments.length}</div>
            <p className="text-xs text-muted-foreground">
              All case documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayDocuments.filter((doc: Document) => doc.status === 'Final').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayDocuments.filter((doc: Document) => doc.status === 'Review').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Under review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayDocuments.filter((doc: Document) => doc.status === 'Draft').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Work in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayDocuments.map((document: Document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getTypeIcon(document.documentType || '')}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold">{document.originalName}</p>
                        <Badge className={getStatusColor(document.status || '')}>
                          {document.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{document.documentType}</span>
                        <span>•</span>
                        <span>{document.createdAt?.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{(document.fileSize / 1024).toFixed(0)} KB</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Categories */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Contract Amendment v2 completed</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Discovery Documents under review</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Legal Opinion Letter uploaded</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Contracts</span>
                <Badge variant="secondary">2</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Meeting Notes</span>
                <Badge variant="secondary">1</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Letters</span>
                <Badge variant="secondary">1</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Discovery</span>
                <Badge variant="secondary">1</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}