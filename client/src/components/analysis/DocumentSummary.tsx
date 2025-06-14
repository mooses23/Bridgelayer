import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import type { DocumentSummary as DocumentSummaryType } from "../../../../shared/types";

interface DocumentSummaryProps {
  analysis?: {
    result: DocumentSummaryType;
    confidence: number;
    createdAt: Date;
  };
  enabled: boolean;
}

export default function DocumentSummary({ analysis, enabled }: DocumentSummaryProps) {
  if (!enabled) {
    return (
      <Card className="analysis-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center legal-blue">
              <FileText className="mr-3" size={20} />
              Document Summary
            </CardTitle>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              Feature Disabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="mx-auto legal-slate mb-4" size={48} />
            <p className="legal-slate mb-4">Document summarization is currently disabled</p>
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
              <FileText className="mr-3" size={20} />
              Document Summary
            </CardTitle>
            <Badge className="bg-legal-emerald/10 text-legal-emerald">
              Feature Enabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-blue mx-auto mb-4"></div>
            <p className="legal-slate">Analyzing document...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { result } = analysis;

  return (
    <Card className="analysis-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center legal-blue">
            <FileText className="mr-3" size={20} />
            Document Summary
          </CardTitle>
          <Badge className="bg-legal-emerald/10 text-legal-emerald">
            Feature Enabled
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Document Type & Purpose</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {result.purpose}
            </p>
          </div>
          
          {result.parties.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Primary Parties</h4>
              <div className="space-y-2">
                {result.parties.map((party, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{party.name}</span>
                    <span className="text-sm legal-slate">{party.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {result.keyTerms.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Key Terms & Obligations</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {result.keyTerms.map((term, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="legal-emerald mt-0.5" size={16} />
                    <span>
                      {term.description}
                      {term.section && (
                        <span className="legal-slate"> ({term.section})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {result.uncertainties && result.uncertainties.length > 0 && (
            <div className="mt-4 p-3 bg-legal-amber/10 border border-legal-amber/20 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <AlertCircle className="legal-amber mr-2" size={16} />
                Requires Review
              </h4>
              <ul className="space-y-1">
                {result.uncertainties.map((uncertainty, index) => (
                  <li key={index} className="text-xs legal-slate">• {uncertainty}</li>
                ))}
              </ul>
              <p className="text-xs legal-amber font-medium mt-2">
                These elements may require attorney clarification.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
