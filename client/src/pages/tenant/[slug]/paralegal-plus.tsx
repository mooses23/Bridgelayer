import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Brain,
  Scale,
  BookOpen,
  Calendar,
  Users,
  MessageSquare
} from 'lucide-react';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentList from '@/components/documents/DocumentList';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/contexts/TenantContext';
import apiService from '@/services/api.service';
import { Document } from '@/types/schema';

export default function ParalegalPlusDashboard() {
  const { tenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('documents');

  // Fetch documents using API service
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['documents', tenant?.slug],
    queryFn: async () => {
      const response = await apiService.getDocuments(tenant?.slug || '');
      return response.data;
    },
    enabled: !!tenant?.slug && activeTab === 'documents'
  });

  // Mock data for paralegal workflow - will be replaced with API data in future iterations
  const workQueue = [
    {
      id: 1,
      type: 'NDA Review',
      client: 'TechCorp Inc',
      priority: 'high',
      deadline: '2025-06-26',
      status: 'pending',
      estimatedTime: '45 min',
      complexity: 'standard'
    },
    {
      id: 2,
      type: 'Contract Analysis',
      client: 'StartupXYZ',
      priority: 'medium',
      deadline: '2025-06-28',
      status: 'in-progress',
      estimatedTime: '2 hours',
      complexity: 'complex'
    },
    {
      id: 3,
      type: 'Lease Agreement',
      client: 'Property Management LLC',
      priority: 'medium',
      deadline: '2025-06-30',
      status: 'pending',
      estimatedTime: '1.5 hours',
      complexity: 'standard'
    }
  ];

  const recentDocuments = [
    {
      id: 1,
      name: 'TechCorp_NDA_v2.pdf',
      type: 'NDA',
      status: 'analyzed',
      confidence: 96,
      issues: 2,
      uploadedAt: '1 hour ago'
    },
    {
      id: 2,
      name: 'StartupXYZ_Employment_Contract.docx',
      type: 'Employment Contract',
      status: 'processing',
      confidence: null,
      issues: null,
      uploadedAt: '30 minutes ago'
    },
    {
      id: 3,
      name: 'Property_Lease_Downtown.pdf',
      type: 'Lease Agreement',
      status: 'analyzed',
      confidence: 89,
      issues: 5,
      uploadedAt: '2 hours ago'
    }
  ];

  const stats = {
    pendingReviews: workQueue.filter(item => item.status === 'pending').length,
    completedToday: 8,
    totalWorkload: workQueue.length,
    averageProcessingTime: '1.2 hours'
  };

  // Filter work queue based on search
  const filteredQueue = workQueue.filter(item =>
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter documents based on search
  const filteredDocuments = documents.filter((doc: Document) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (files: File[]) => {
    if (!files.length || !tenant?.slug) return;
    
    const formData = new FormData();
    formData.append('file', files[0]);
    
    try {
      await apiService.uploadDocument(tenant.slug, formData);
      // Refresh documents list
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Paralegal+</h1>
          <p className="text-muted-foreground">
            AI-powered legal document analysis and workflow automation
          </p>
        </div>
        <Button onClick={() => setActiveTab('upload')}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents, workflows, or research..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="documents" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Clock className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="research">
            <BookOpen className="h-4 w-4 mr-2" />
            Research
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {documentsLoading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <h3 className="font-medium text-gray-600">No documents found</h3>
              <p className="text-sm text-gray-500 mt-1">
                Upload documents to analyze them with Paralegal+ AI
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setActiveTab('upload')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload a Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredDocuments.map((doc: Document) => (
                <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        <div>
                          <h4 className="font-medium truncate max-w-xs">{doc.originalName}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(doc.uploadedAt).toLocaleDateString()} • {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                      <Badge>{doc.documentType || 'Document'}</Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex space-x-2 mb-2">
                        <Button variant="outline" size="sm">
                          <Brain className="h-3 w-3 mr-1" /> Analyze
                        </Button>
                        <Button variant="outline" size="sm">
                          <Scale className="h-3 w-3 mr-1" /> Review
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Last modified: {new Date(doc.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>Documents requiring review or action</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredQueue.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <h3 className="font-medium text-gray-600">All caught up!</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    No pending workflows at the moment
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQueue.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50"
                    >
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium">{item.type}</h4>
                          <Badge className={getPriorityColor(item.priority)} className="ml-2">
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.client} • {item.estimatedTime} • {item.complexity}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-right">
                          <div className="font-medium">Due: {new Date(item.deadline).toLocaleDateString()}</div>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <Button>Start</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legal Research Assistant</CardTitle>
              <CardDescription>Ask questions about legal topics and case law</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <h3 className="font-medium text-gray-600">Legal Research Assistant</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  Ask questions about statutes, case law, or legal concepts to get AI-powered research assistance
                </p>
                <Input 
                  placeholder="What is the statute of limitations for..." 
                  className="mt-4 max-w-md mx-auto"
                />
                <Button className="mt-2">
                  <Search className="h-4 w-4 mr-2" />
                  Research
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>Upload legal documents for AI analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUpload onUpload={handleDocumentUpload} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
