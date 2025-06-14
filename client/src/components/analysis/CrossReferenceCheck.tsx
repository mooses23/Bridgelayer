import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, ToggleLeft, AlertCircle } from "lucide-react";
import type { CrossReferenceCheck as CrossReferenceCheckType } from "../../../../shared/types";

interface CrossReferenceCheckProps {
  analysis?: {
    result: CrossReferenceCheckType;
    confidence: number;
    createdAt: Date;
  };
  enabled: boolean;
}

export default function CrossReferenceCheck({ analysis, enabled }: CrossReferenceCheckProps) {
  if (!enabled) {
    return (
      <Card className="analysis-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center legal-blue">
              <Link className="mr-3" size={20} />
              Cross-Reference Check
            </CardTitle>
            <Badge variant="secondary" className="bg-legal-slate/10 text-legal-slate">
              Feature Disabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ToggleLeft className="mx-auto legal-slate mb-4" size={48} />
            <p className="legal-slate mb-4">Cross-reference verification is currently disabled</p>
            <Button className="bg-legal-blue text-white hover:bg-blue-700">
              Enable Feature
            </Button>
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
              <Link className="mr-3" size={20} />
              Cross-Reference Check
            </CardTitle>
            <Badge className="bg-legal-emerald/10 text-legal-emerald">
              Feature Enabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-blue mx-auto mb-4"></div>
            <p className="legal-slate">Checking cross-references...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { result } = analysis;

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-legal-emerald/10 border-legal-emerald/20 text-legal-emerald';
      case 'invalid':
        return 'bg-legal-red/10 border-legal-red/20 text-legal-red';
      case 'missing':
        return 'bg-legal-amber/10 border-legal-amber/20 text-legal-amber';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  return (
    <Card className="analysis-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center legal-blue">
            <Link className="mr-3" size={20} />
            Cross-Reference Check
          </CardTitle>
          <Badge className="bg-legal-emerald/10 text-legal-emerald">
            Feature Enabled
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {result.references.length === 0 ? (
          <div className="text-center py-8">
            <Link className="mx-auto legal-slate mb-4" size={48} />
            <p className="legal-slate">No cross-references found in this document</p>
          </div>
        ) : (
          <div className="space-y-3">
            {result.overallAssessment && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <h4 className="font-medium text-blue-900 mb-1">Overall Assessment</h4>
                <p className="text-sm text-blue-800">{result.overallAssessment}</p>
              </div>
            )}
            
            {result.references.map((ref, index) => (
              <div key={index} className={`p-3 border rounded-lg ${getStatusClasses(ref.status)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">"{ref.reference}"</p>
                    <p className="text-xs opacity-80 mb-1">Location: {ref.location}</p>
                    {ref.evidenceOfIssue && (
                      <p className="text-xs font-medium text-red-600 mb-1">
                        Evidence: {ref.evidenceOfIssue}
                      </p>
                    )}
                    {ref.suggestion && (
                      <p className="text-xs font-medium">Suggestion: {ref.suggestion}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant="outline" className="capitalize">
                      {ref.status}
                    </Badge>
                    {ref.requiresReview && (
                      <Badge variant="outline" className="text-xs legal-amber border-legal-amber">
                        Review Required
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {result.uncertainties && result.uncertainties.length > 0 && (
              <div className="mt-4 p-3 bg-legal-amber/10 border border-legal-amber/20 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <AlertCircle className="legal-amber mr-2" size={16} />
                  Uncertain References
                </h4>
                <ul className="space-y-1">
                  {result.uncertainties.map((uncertainty, index) => (
                    <li key={index} className="text-xs legal-slate">• {uncertainty}</li>
                  ))}
                </ul>
                <p className="text-xs legal-amber font-medium mt-2">
                  These references may require attorney review for accuracy.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
