import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlignLeft, AlertTriangle, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import type { FormattingAnalysis as FormattingAnalysisType } from "../../../../shared/types";

interface FormattingAnalysisProps {
  analysis?: {
    result: FormattingAnalysisType;
    confidence: number;
    createdAt: Date;
  };
  enabled: boolean;
}

export default function FormattingAnalysis({ analysis, enabled }: FormattingAnalysisProps) {
  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center legal-blue">
              <AlignLeft className="mr-3" size={20} />
              Document Formatting Analysis
            </CardTitle>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              Feature Disabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlignLeft className="mx-auto legal-slate mb-4" size={48} />
            <p className="legal-slate mb-4">Formatting analysis is currently disabled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center legal-blue">
              <AlignLeft className="mr-3" size={20} />
              Document Formatting Analysis
            </CardTitle>
            <Badge className="bg-legal-emerald/10 text-legal-emerald">
              Feature Enabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-blue mx-auto mb-4"></div>
            <p className="legal-slate">Analyzing formatting...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { result } = analysis;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="legal-red" size={16} />;
      case 'medium':
        return <AlertCircle className="legal-amber" size={16} />;
      case 'low':
        return <CheckCircle className="legal-emerald" size={16} />;
      default:
        return <CheckCircle className="legal-emerald" size={16} />;
    }
  };

  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-legal-red/5 border-legal-red/20';
      case 'medium':
        return 'bg-legal-amber/5 border-legal-amber/20';
      case 'low':
        return 'bg-legal-emerald/5 border-legal-emerald/20';
      default:
        return 'bg-legal-emerald/5 border-legal-emerald/20';
    }
  };

  const allIssues = [
    ...result.issues.numbering,
    ...result.issues.capitalization,
    ...result.issues.layout
  ];

  const criticalIssues = allIssues.filter(issue => issue.severity === 'high').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center legal-blue">
            <AlignLeft className="mr-3" size={20} />
            Document Formatting Analysis
          </CardTitle>
          <Badge className="bg-legal-emerald/10 text-legal-emerald">
            Feature Enabled
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Numbering Issues</h4>
            <div className="space-y-2">
              {result.issues.numbering.length === 0 ? (
                <div className="flex items-center justify-between p-3 bg-legal-emerald/5 border border-legal-emerald/20 rounded-lg">
                  <span className="text-sm text-gray-700">No numbering issues</span>
                  <CheckCircle className="legal-emerald" size={16} />
                </div>
              ) : (
                result.issues.numbering.map((issue, index) => (
                  <div key={index} className={`p-3 border rounded-lg ${getSeverityClasses(issue.severity)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{issue.issue}</span>
                      {getSeverityIcon(issue.severity)}
                    </div>
                    {issue.evidence && (
                      <p className="text-xs text-blue-600 mt-1">Evidence: {issue.evidence}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Capitalization</h4>
            <div className="space-y-2">
              {result.issues.capitalization.length === 0 ? (
                <div className="flex items-center justify-between p-3 bg-legal-emerald/5 border border-legal-emerald/20 rounded-lg">
                  <span className="text-sm text-gray-700">Proper capitalization</span>
                  <CheckCircle className="legal-emerald" size={16} />
                </div>
              ) : (
                result.issues.capitalization.map((issue, index) => (
                  <div key={index} className={`p-3 border rounded-lg ${getSeverityClasses(issue.severity)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{issue.issue}</span>
                      {getSeverityIcon(issue.severity)}
                    </div>
                    {issue.evidence && (
                      <p className="text-xs text-blue-600 mt-1">Evidence: {issue.evidence}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Layout & Structure</h4>
            <div className="space-y-2">
              {result.issues.layout.length === 0 ? (
                <div className="flex items-center justify-between p-3 bg-legal-emerald/5 border border-legal-emerald/20 rounded-lg">
                  <span className="text-sm text-gray-700">Proper layout</span>
                  <CheckCircle className="legal-emerald" size={16} />
                </div>
              ) : (
                result.issues.layout.map((issue, index) => (
                  <div key={index} className={`p-3 border rounded-lg ${getSeverityClasses(issue.severity)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{issue.issue}</span>
                      {getSeverityIcon(issue.severity)}
                    </div>
                    {issue.evidence && (
                      <p className="text-xs text-blue-600 mt-1">Evidence: {issue.evidence}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {(result.improvementSuggestions && result.improvementSuggestions.length > 0) && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <Lightbulb className="mr-2" size={16} />
              Improvement Suggestions
            </h4>
            <ul className="space-y-1">
              {result.improvementSuggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-800">• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        {(result.uncertainties && result.uncertainties.length > 0) && (
          <div className="mt-4 p-3 bg-legal-amber/10 border border-legal-amber/20 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <AlertCircle className="legal-amber mr-2" size={16} />
              Style Guide Clarification Needed
            </h4>
            <ul className="space-y-1">
              {result.uncertainties.map((uncertainty, index) => (
                <li key={index} className="text-xs legal-slate">• {uncertainty}</li>
              ))}
            </ul>
            <p className="text-xs legal-amber font-medium mt-2">
              These formatting elements may require firm style guide review.
            </p>
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Formatting Score: {result.score}/100</p>
              <p className="text-sm legal-slate">
                {allIssues.length} issues found, {criticalIssues} critical formatting corrections needed
              </p>
            </div>
            <Button className="bg-legal-blue text-white hover:bg-blue-700">
              Generate Corrected Version
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
