import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIResponseDebugProps {
  response?: any;
  prompt?: string;
  isVisible?: boolean;
  title?: string;
}

export default function AIResponseDebug({ 
  response, 
  prompt, 
  isVisible = false, 
  title = "AI Response Debug" 
}: AIResponseDebugProps) {
  const [showDebug, setShowDebug] = useState(isVisible);
  const { toast } = useToast();

  if (!response && !prompt) {
    return null;
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied to clipboard`,
      description: "Content has been copied to your clipboard",
    });
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="mt-4 border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              {title}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Debug Mode
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="text-amber-700 hover:text-amber-900"
          >
            {showDebug ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDebug ? "Hide" : "Show"} Debug
          </Button>
        </div>
      </CardHeader>

      {showDebug && (
        <CardContent className="space-y-4">
          {prompt && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-amber-800">AI Prompt Sent</h4>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(prompt, "Prompt")}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadAsFile(prompt, "ai-prompt.txt")}
                    className="h-6 px-2 text-xs"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="bg-white p-3 rounded border text-xs font-mono max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{prompt}</pre>
              </div>
            </div>
          )}

          {prompt && response && <Separator />}

          {response && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-amber-800">AI Response Received</h4>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(response, null, 2), "Response")}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadAsFile(JSON.stringify(response, null, 2), "ai-response.json")}
                    className="h-6 px-2 text-xs"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="bg-white p-3 rounded border text-xs font-mono max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap">
                  {typeof response === 'string' 
                    ? response 
                    : JSON.stringify(response, null, 2)
                  }
                </pre>
              </div>
            </div>
          )}

          <div className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
            <strong>Debug Info:</strong> This panel shows AI prompts and responses for debugging purposes. 
            It's only visible in development mode and can be toggled on/off.
          </div>
        </CardContent>
      )}
    </Card>
  );
}