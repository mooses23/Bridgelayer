import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  ExternalLink, 
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Code,
  RefreshCw
} from 'lucide-react';

interface PreviewTabProps {
  code?: string;
}

export default function PreviewTab({ code: initialCode = '' }: PreviewTabProps) {
  const [code, setCode] = useState(initialCode);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);

  // Mock preview data
  const previewInfo = {
    url: `https://${code || 'demo'}.firmsync.com`,
    status: code ? 'active' : 'demo',
    lastUpdated: '2 minutes ago',
    theme: 'professional',
    features: ['Document Upload', 'AI Analysis', 'Client Portal', 'Billing'],
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getViewportClass = () => {
    switch (viewMode) {
      case 'mobile':
        return 'w-80 h-96';
      case 'tablet':
        return 'w-96 h-[500px]';
      default:
        return 'w-full h-[600px]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">FirmSync Preview</h1>
        <p className="text-gray-600">Preview client deployments and configurations</p>
      </div>

      {/* Preview Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Preview Configuration
          </CardTitle>
          <CardDescription>Enter an onboarding code to preview a specific firm setup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Onboarding Code</label>
              <Input
                type="text"
                placeholder="Enter firm onboarding code (e.g., ANDERSON2025)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" asChild>
              <a href={previewInfo.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Preview URL</p>
                <p className="text-xs text-muted-foreground">{previewInfo.url}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={previewInfo.status === 'active' ? 'default' : 'secondary'}>
                  {previewInfo.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground capitalize">{previewInfo.theme}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium">Features Enabled</p>
              <p className="text-xs text-muted-foreground">{previewInfo.features.length} active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Viewport Controls */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Viewport:</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'desktop' ? 'default' : 'outline'}
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Desktop
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'tablet' ? 'default' : 'outline'}
            onClick={() => setViewMode('tablet')}
          >
            <Tablet className="h-4 w-4 mr-2" />
            Tablet
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'mobile' ? 'default' : 'outline'}
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <Card>
        <CardContent className="p-0">
          <div className="flex justify-center bg-gray-100 p-6">
            <div className={`${getViewportClass()} border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg`}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Loading preview...</p>
                  </div>
                </div>
              ) : (
                <iframe
                  src={`/app/preview?code=${code || 'demo'}`}
                  title="FirmSync Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Enabled Features</CardTitle>
          <CardDescription>Features available in this firm's configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewInfo.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
