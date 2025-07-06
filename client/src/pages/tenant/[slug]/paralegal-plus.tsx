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

export default function ParalegalDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for paralegal workflow
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
    },
    {
      id: 4,
      type: 'Settlement Review',
      client: 'Personal Injury Case #445',
      priority: 'high',
      deadline: '2025-06-27',
      status: 'review-ready',
      estimatedTime: '3 hours',
      complexity: 'complex'
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Paralegal Workstation</h1>
        <p className="opacity-90">AI-powered legal document analysis and review dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalWorkload - stats.pendingReviews} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              Documents reviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workload</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkload}</div>
            <p className="text-xs text-muted-foreground">
              Active assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProcessingTime}</div>
            <p className="text-xs text-muted-foreground">
              Per document
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Workflow Tabs */}
      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="queue">Work Queue</TabsTrigger>
          <TabsTrigger value="upload">Document Upload</TabsTrigger>
          <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
          <TabsTrigger value="research">Legal Research</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-6">
          {/* Priority Work Queue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Priority Work Queue
              </CardTitle>
              <CardDescription>Documents requiring paralegal review and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workQueue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        item.priority === 'high' ? 'bg-red-500' :
                        item.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <div>
                        <h3 className="font-medium">{item.type}</h3>
                        <p className="text-sm text-gray-600">{item.client}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">
                            Due: {item.deadline}
                          </span>
                          <span className="text-xs text-gray-500">
                            Est: {item.estimatedTime}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {item.complexity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        item.status === 'pending' ? 'secondary' :
                        item.status === 'in-progress' ? 'default' :
                        'outline'
                      }>
                        {item.status.replace('-', ' ')}
                      </Badge>
                      <Button size="sm">
                        {item.status === 'review-ready' ? 'Review' : 'Start'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          {/* Document Upload Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Document Upload & Analysis
              </CardTitle>
              <CardDescription>Upload legal documents for AI-powered analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUpload 
                onDocumentUploaded={(doc) => console.log('Document uploaded:', doc)}
                onDocumentRemoved={() => console.log('Document removed')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Recent Analysis Results
              </CardTitle>
              <CardDescription>AI analysis results for recent document reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <p className="text-sm text-gray-600">{doc.type}</p>
                        <p className="text-xs text-gray-500">Uploaded {doc.uploadedAt}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {doc.status === 'analyzed' && (
                        <>
                          <div className="text-center">
                            <div className="text-sm font-medium">{doc.confidence}%</div>
                            <div className="text-xs text-gray-500">Confidence</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium flex items-center gap-1">
                              {doc.issues}
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            </div>
                            <div className="text-xs text-gray-500">Issues</div>
                          </div>
                        </>
                      )}
                      <Badge variant={
                        doc.status === 'analyzed' ? 'default' :
                        doc.status === 'processing' ? 'secondary' :
                        'outline'
                      }>
                        {doc.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-6">
          {/* Legal Research Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Legal Research Assistant
              </CardTitle>
              <CardDescription>AI-powered legal research and case law analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input 
                    placeholder="Search case law, statutes, or legal topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Research
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Scale className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <h3 className="font-medium">Case Law Search</h3>
                        <p className="text-sm text-gray-600">Find relevant precedents</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-medium">Statute Lookup</h3>
                        <p className="text-sm text-gray-600">Search legal statutes</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <h3 className="font-medium">Legal Forms</h3>
                        <p className="text-sm text-gray-600">Access legal templates</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
