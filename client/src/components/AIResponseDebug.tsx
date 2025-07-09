import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIResponseDebugProps {
  response?: {
    text?: string;
    metadata?: any;
  };
  prompt?: string;
  title?: string;
  isVisible?: boolean;
}

const AIResponseDebug: React.FC<AIResponseDebugProps> = ({ 
  response, 
  prompt, 
  title = "AI Response Debug", 
  isVisible = true 
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {prompt && (
          <div>
            <h4 className="text-xs font-semibold text-gray-600 mb-2">Prompt:</h4>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
              {prompt}
            </pre>
          </div>
        )}
        
        {response && (
          <div>
            <h4 className="text-xs font-semibold text-gray-600 mb-2">Response:</h4>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
              {response.text || JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
        
        {response?.metadata && (
          <div>
            <h4 className="text-xs font-semibold text-gray-600 mb-2">Metadata:</h4>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(response.metadata, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIResponseDebug;
