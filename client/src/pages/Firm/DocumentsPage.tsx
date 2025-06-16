import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Search, Filter, Brain } from 'lucide-react';
import { DocumentUpload } from '@/components/DocumentUpload';
import { DocumentAnalyzer } from '@/components/DocumentAnalyzer';

export default function DocumentsPage() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Document Library</span>
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Analyzer</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Document management functionality will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyzer" className="space-y-4">
          <DocumentAnalyzer />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <DocumentUpload onClose={() => {}} />
        </TabsContent>
      </Tabs>

      {showUpload && (
        <DocumentUpload onClose={() => setShowUpload(false)} />
      )}
    </div>
  );
}