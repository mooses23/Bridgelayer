import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { List, CheckCircle, X, AlertCircle, Brain } from "lucide-react";
import type { ClauseExtraction as ClauseExtractionType } from "../../../../shared/types";

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
                <div className="flex items-center space-x-2">
                  {clause.confidenceLevel && (
                    <Badge variant="outline" className={`text-xs ${
                      clause.confidenceLevel === 'high' ? 'text-legal-emerald border-legal-emerald' :
                      clause.confidenceLevel === 'medium' ? 'text-legal-amber border-legal-amber' :
                      'text-legal-red border-legal-red'
                    }`}>
                      {clause.confidenceLevel} confidence
                    </Badge>
                  )}
                  {getStatusBadge(clause.status)}
                </div>
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
                  {clause.reasoning && (
                    <p className="text-xs text-blue-600 mb-2">
                      Reasoning: {clause.reasoning}
                    </p>
                  )}
                  {clause.aiGeneratedDraft && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-2">
                        <p className="text-xs font-medium text-blue-900 mb-1 flex items-center">
                          <Brain className="mr-1" size={12} />
                          🧠 Suggested Draft Language (AI-Generated — Review Required)
                        </p>
                        <p className="text-xs text-blue-800">
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
          
          {result.uncertainties && result.uncertainties.length > 0 && (
            <div className="mt-4 p-3 bg-legal-amber/10 border border-legal-amber/20 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <AlertCircle className="legal-amber mr-2" size={16} />
                Uncertain Identifications
              </h4>
              <ul className="space-y-1">
                {result.uncertainties.map((uncertainty, index) => (
                  <li key={index} className="text-xs legal-slate">• {uncertainty}</li>
                ))}
              </ul>
              <p className="text-xs legal-amber font-medium mt-2">
                These clause identifications may require attorney verification.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
