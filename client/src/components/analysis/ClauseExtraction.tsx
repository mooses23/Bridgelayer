import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { List, CheckCircle, X } from "lucide-react";
import type { ClauseExtraction as ClauseExtractionType } from "../../../../../../server/services/openai";

interface ClauseExtractionProps {
  analysis?: {
    result: ClauseExtractionType;
    confidence: number;
    createdAt: Date;
  };
  enabled: boolean;
}

export default function ClauseExtraction({ analysis, enabled }: ClauseExtractionProps) {
  if (!enabled) {
    return (
      <Card className="analysis-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center legal-blue">
              <List className="mr-3" size={20} />
              Clause Extraction
            </CardTitle>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              Feature Disabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <List className="mx-auto legal-slate mb-4" size={48} />
            <p className="legal-slate mb-4">Clause extraction is currently disabled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="analysis-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center legal-blue">
              <List className="mr-3" size={20} />
              Clause Extraction
            </CardTitle>
            <Badge className="bg-legal-emerald/10 text-legal-emerald">
              Feature Enabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-blue mx-auto mb-4"></div>
            <p className="legal-slate">Extracting clauses...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { result } = analysis;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'found':
        return <Badge className="bg-legal-emerald text-white">Found</Badge>;
      case 'missing':
        return <Badge className="bg-legal-red text-white">Missing</Badge>;
      case 'incomplete':
        return <Badge className="bg-legal-amber text-white">Incomplete</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card className="analysis-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center legal-blue">
            <List className="mr-3" size={20} />
            Clause Extraction
          </CardTitle>
          <Badge className="bg-legal-emerald/10 text-legal-emerald">
            Feature Enabled
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {result.clauses.map((clause, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">{clause.type} Clause</h4>
                {getStatusBadge(clause.status)}
              </div>
              
              {clause.status === 'found' && clause.content && (
                <>
                  <p className="text-sm text-gray-700 mb-2">
                    {clause.content.length > 150 
                      ? `${clause.content.substring(0, 150)}...`
                      : clause.content
                    }
                    {clause.section && (
                      <span className="legal-slate"> ({clause.section})</span>
                    )}
                  </p>
                  <Button variant="link" className="text-xs text-legal-blue hover:underline p-0">
                    View Full Clause
                  </Button>
                </>
              )}
              
              {clause.status === 'missing' && (
                <>
                  <p className="text-sm legal-slate mb-3">
                    No {clause.type.toLowerCase()} provisions found. Consider adding if applicable to your document type.
                  </p>
                  {clause.aiGeneratedDraft && (
                    <>
                      <div className="bg-gray-50 p-3 rounded-lg mb-2">
                        <p className="text-xs font-medium text-gray-900 mb-1">AI-Generated Draft Clause:</p>
                        <p className="text-xs text-gray-700">
                          {clause.aiGeneratedDraft.length > 120 
                            ? `${clause.aiGeneratedDraft.substring(0, 120)}...`
                            : clause.aiGeneratedDraft
                          }
                        </p>
                      </div>
                      <Button variant="link" className="text-xs text-legal-blue hover:underline p-0">
                        View Full Draft
                      </Button>
                    </>
                  )}
                </>
              )}
              
              {clause.status === 'incomplete' && (
                <p className="text-sm legal-slate mb-2">
                  {clause.type} clause found but appears incomplete. Review for missing provisions.
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
