import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudUpload, FileUp, FolderOpen, File, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";

interface DocumentUploadProps {
  selectedDocument?: Document | null;
  onDocumentUploaded: (document: Document) => void;
  onDocumentRemoved: () => void;
}

export default function DocumentUpload({ selectedDocument, onDocumentUploaded, onDocumentRemoved }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (document: Document) => {
      onDocumentUploaded(document);
      toast({
        title: "Document Uploaded",
        description: `${document.originalName} has been uploaded and is being analyzed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const uploadDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center legal-blue">
          <CloudUpload className="mr-3" size={20} />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedDocument ? (
          <>
            <div 
              className={`document-dropzone rounded-lg p-8 text-center ${isDragging ? 'border-legal-blue bg-blue-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mb-4">
                <FileUp className="mx-auto text-4xl legal-slate mb-4" size={48} />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Drop your legal document here</h4>
                <p className="legal-slate mb-4">Supports PDF, DOC, DOCX files up to 10MB</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Button 
                  onClick={handleFileSelect}
                  disabled={uploadMutation.isPending}
                  className="bg-legal-blue hover:bg-blue-700"
                >
                  <FolderOpen className="mr-2" size={16} />
                  {uploadMutation.isPending ? 'Uploading...' : 'Choose File'}
                </Button>
                <span className="legal-slate">or</span>
                <Input
                  type="text"
                  placeholder="Enter document URL"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        ) : (
          <div className="p-4 bg-legal-emerald/10 border border-legal-emerald/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="legal-emerald" size={24} />
                <div>
                  <p className="font-medium text-gray-900">{selectedDocument.originalName}</p>
                  <p className="text-sm legal-slate">
                    {selectedDocument.documentType ? `Identified as: ${selectedDocument.documentType}` : 'Analyzing document type...'} • 
                    {formatFileSize(selectedDocument.fileSize)} • 
                    Uploaded {getTimeAgo(selectedDocument.uploadedAt!)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-legal-emerald text-white text-sm font-medium rounded-full">
                  {selectedDocument.analyzedAt ? 'Analyzed' : 'Processing...'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDocumentRemoved}
                  className="legal-slate hover:text-gray-700"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
