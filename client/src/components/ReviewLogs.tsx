import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Clock, User, Eye, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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

interface ReviewLogsProps {
  firmId?: string;
}

export default function ReviewLogs({ firmId = "firm_1" }: ReviewLogsProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentMetadata | null>(null);

  const { data: reviewLogs = [], isLoading } = useQuery<DocumentMetadata[]>({
    queryKey: [`/api/firms/${firmId}/review-logs`],
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const uploadDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getReviewerBadgeColor = (reviewer: string) => {
    switch (reviewer) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'associate': return 'bg-blue-100 text-blue-800';
      case 'paralegal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2" size={20} />
            Document Processing Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Loading review logs...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="mr-2" size={20} />
            Document Processing Logs
          </div>
          <Badge variant="outline">{reviewLogs.length} documents</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reviewLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto mb-4" size={48} />
            <p>No documents processed yet</p>
            <p className="text-sm">Upload documents to see their processing logs here</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {reviewLogs.map((doc, index) => (
                <div 
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="text-blue-600" size={16} />
                        <h4 className="font-medium text-gray-900 truncate">
                          {doc.filename}
                        </h4>
                        {doc.auto_detected && (
                          <Badge variant="outline" className="text-xs">
                            Auto-detected
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeAgo(doc.timestamp)}
                        </span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {doc.doc_type.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-500">Features:</span>
                        {doc.features_enabled.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Uploaded by {doc.uploaded_by}
                        </span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getReviewerBadgeColor(doc.assigned_reviewer)}`}>
                          Assigned to {doc.assigned_reviewer}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 ml-4">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}