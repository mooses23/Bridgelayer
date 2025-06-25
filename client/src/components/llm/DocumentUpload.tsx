import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  X,
  FileImage,
  FileSpreadsheet,
  File
} from 'lucide-react';
import axios from 'axios';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  documentId?: number;
  extractedText?: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    fileType?: string;
    size?: number;
  };
}

interface DocumentUploadProps {
  onDocumentReady?: (documentId: number, fileName: string) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
}

const defaultAcceptedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/rtf'
];

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
  if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />;
  if (fileType.includes('image')) return <FileImage className="h-5 w-5 text-green-500" />;
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DocumentUpload({ 
  onDocumentReady, 
  acceptedTypes = defaultAcceptedTypes,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024 // 50MB default
}: DocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: 'uploading' as const,
      metadata: {
        fileType: file.type,
        size: file.size
      }
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (const uploadedFile of newFiles) {
      try {
        await processFile(uploadedFile);
      } catch (error) {
        console.error('Error processing file:', error);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'error', error: 'Failed to process file' }
              : f
          )
        );
      }
    }
  }, []);

  const processFile = async (uploadedFile: UploadedFile) => {
    const formData = new FormData();
    formData.append('file', uploadedFile.file);
    formData.append('documentType', 'legal_document');

    try {
      // Simulate upload progress
      const updateProgress = (progress: number) => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, progress }
              : f
          )
        );
      };

      // Upload file
      updateProgress(30);
      const uploadResponse = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            updateProgress(Math.min(progress, 60)); // Cap at 60% for upload
          }
        }
      });

      const documentId = uploadResponse.data.documentId;
      updateProgress(70);

      // Update status to processing
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'processing' }
            : f
        )
      );

      // Extract text and metadata
      updateProgress(85);
      const extractResponse = await axios.post('/api/documents/extract-text', {
        documentId
      });

      updateProgress(100);

      // Mark as completed
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { 
                ...f, 
                status: 'completed',
                documentId,
                extractedText: extractResponse.data.text,
                metadata: {
                  ...f.metadata,
                  pageCount: extractResponse.data.pageCount,
                  wordCount: extractResponse.data.wordCount
                }
              }
            : f
        )
      );

      // Notify parent component
      if (onDocumentReady) {
        onDocumentReady(documentId, uploadedFile.file.name);
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { 
                ...f, 
                status: 'error', 
                error: error.response?.data?.error || 'Upload failed' 
              }
            : f
        )
      );
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize,
    multiple: true
  });

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'Uploading...';
      case 'processing': return 'Processing...';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 font-medium mb-2">
                  Drag & drop documents here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, Word, RTF, and text files up to {formatFileSize(maxSize)}
                </p>
              </div>
            )}
          </div>

          {/* File Type Info */}
          <div className="mt-4 text-xs text-gray-500">
            <p className="font-medium mb-1">Supported formats:</p>
            <p>PDF, Microsoft Word (.doc, .docx), Rich Text Format (.rtf), Plain Text (.txt)</p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(uploadedFile.metadata?.fileType || '')}
                      <div>
                        <p className="font-medium text-sm">{uploadedFile.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploadedFile.metadata?.size || 0)}
                          {uploadedFile.metadata?.pageCount && 
                            ` • ${uploadedFile.metadata.pageCount} pages`
                          }
                          {uploadedFile.metadata?.wordCount && 
                            ` • ${uploadedFile.metadata.wordCount.toLocaleString()} words`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={uploadedFile.status === 'completed' ? 'default' : 'secondary'}
                        className={`${getStatusColor(uploadedFile.status)} text-white`}
                      >
                        {uploadedFile.status === 'uploading' && <Clock className="h-3 w-3 mr-1" />}
                        {uploadedFile.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {uploadedFile.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {getStatusText(uploadedFile.status)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadedFile.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                    <Progress value={uploadedFile.progress} className="mb-2" />
                  )}

                  {uploadedFile.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadedFile.error}</AlertDescription>
                    </Alert>
                  )}

                  {uploadedFile.status === 'completed' && uploadedFile.extractedText && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <p className="text-xs font-medium text-gray-700 mb-2">Extracted Text Preview:</p>
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {uploadedFile.extractedText.substring(0, 200)}
                        {uploadedFile.extractedText.length > 200 && '...'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
