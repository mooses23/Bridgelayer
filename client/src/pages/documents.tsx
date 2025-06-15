import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Upload, 
  Folder, 
  Search,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Filter,
  Settings
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DocumentUpload from "@/components/DocumentUpload";
import ReviewLogs from "@/components/ReviewLogs";

export default function Documents() {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch folders
  const { data: folders } = useQuery({
    queryKey: ["/api/folders"],
  });

  // Fetch documents
  const { data: documents } = useQuery({
    queryKey: ["/api/documents", selectedFolder],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedFolder) params.append('folderId', selectedFolder.toString());
      return fetch(`/api/documents?${params}`).then(res => res.json());
    }
  });

  // Filter documents based on search
  const filteredDocuments = documents?.filter((doc: any) =>
    doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentType?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document Deleted",
        description: "The document has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    }
  });

  const handleDeleteDocument = (documentId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(documentId);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and analyze your legal documents with AI-powered prompt routing</p>
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

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload & Process</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="review-logs">Review Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <DocumentUpload
            selectedDocument={selectedDocument}
            onDocumentUploaded={(doc: any) => {
              setSelectedDocument(doc);
              queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
            }}
            onDocumentRemoved={() => setSelectedDocument(null)}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Folders */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Folders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={selectedFolder === null ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFolder(null)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    All Documents
                    <Badge variant="secondary" className="ml-auto">
                      {documents?.length || 0}
                    </Badge>
                  </Button>
                  
                  {(folders as any[])?.map((folder: any) => (
                    <Button
                      key={folder.id}
                      variant={selectedFolder === folder.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedFolder(folder.id)}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      {folder.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-4">
              {/* Search and Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Documents List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Documents</span>
                    <Badge variant="outline">{filteredDocuments.length} documents</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredDocuments.length > 0 ? (
                    <div className="space-y-4">
                      {filteredDocuments.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">{doc.originalName}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <span>{formatFileSize(doc.fileSize)}</span>
                                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                {doc.documentType && (
                                  <Badge variant="outline" className="text-xs">
                                    {doc.documentType}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              doc.status === 'analyzed' ? 'default' :
                              doc.status === 'processing' ? 'secondary' :
                              doc.status === 'error' ? 'destructive' : 'outline'
                            }>
                              {doc.status}
                            </Badge>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery ? "No documents found" : "No documents yet"}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {searchQuery 
                          ? "Try adjusting your search terms or filters"
                          : "Get started by uploading your first document"
                        }
                      </p>
                      {!searchQuery && (
                        <Button className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Upload Document
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="review-logs" className="space-y-4">
          <ReviewLogs firmId="firm_1" />
        </TabsContent>
      </Tabs>
    </div>
  );
}