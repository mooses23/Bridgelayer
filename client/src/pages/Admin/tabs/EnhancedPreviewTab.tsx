import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Code, Monitor } from 'lucide-react';

interface EnhancedPreviewTabProps {
  code?: string;
}

export default function EnhancedPreviewTab({ code }: EnhancedPreviewTabProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6" />
            Preview
          </h2>
          <p className="text-muted-foreground">
            Preview and test platform components
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Monitor className="h-3 w-3" />
          Live Preview
        </Badge>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Component Preview
            </CardTitle>
            <CardDescription>
              Preview platform components and configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {code ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <pre className="text-sm overflow-x-auto">
                    <code>{code}</code>
                  </pre>
                </div>
                <div className="text-sm text-muted-foreground">
                  Onboarding Code: {code}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No preview content available</p>
                <p className="text-sm">Configure components to see preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}