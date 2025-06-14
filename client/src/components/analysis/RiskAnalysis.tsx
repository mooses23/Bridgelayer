import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { RiskAnalysis as RiskAnalysisType } from "../../../../shared/types";

interface RiskAnalysisProps {
  analysis?: {
    result: RiskAnalysisType;
    confidence: number;
    createdAt: Date;
  };
  enabled: boolean;
}

export default function RiskAnalysis({ analysis, enabled }: RiskAnalysisProps) {
  if (!enabled) {
    return (
      <Card className="analysis-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center legal-amber">
              <AlertTriangle className="mr-3" size={20} />
              Risk Analysis
            </CardTitle>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              Feature Disabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto legal-slate mb-4" size={48} />
            <p className="legal-slate mb-4">Risk analysis is currently disabled</p>
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
            <CardTitle className="flex items-center legal-amber">
              <AlertTriangle className="mr-3" size={20} />
              Risk Analysis
            </CardTitle>
            <Badge className="bg-legal-emerald/10 text-legal-emerald">
              Feature Enabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-blue mx-auto mb-4"></div>
            <p className="legal-slate">Analyzing risks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { result } = analysis;
  
  const getRiskCategoryBadge = (category: string) => {
    switch (category) {
      case 'high':
        return <Badge className="bg-legal-red text-white">High-Risk Document</Badge>;
      case 'medium':
        return <Badge className="bg-legal-amber text-white">Medium-Risk Document</Badge>;
      case 'low':
        return <Badge className="bg-blue-600 text-white">Low-Risk Document</Badge>;
      default:
        return <Badge variant="secondary">Risk Assessment</Badge>;
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="legal-red mt-0.5" size={16} />;
      case 'medium':
        return <AlertCircle className="legal-amber mt-0.5" size={16} />;
      case 'low':
        return <Info className="text-blue-600 mt-0.5" size={16} />;
      default:
        return <Info className="text-blue-600 mt-0.5" size={16} />;
    }
  };

  const getRiskClasses = (level: string) => {
    switch (level) {
      case 'high':
        return {
          container: 'border-legal-red/20 bg-legal-red/5',
          title: 'legal-red',
          titleText: 'High Risk',
          action: 'legal-red'
        };
      case 'medium':
        return {
          container: 'border-legal-amber/20 bg-legal-amber/5',
          title: 'legal-amber',
          titleText: 'Medium Risk',
          action: 'legal-amber'
        };
      case 'low':
        return {
          container: 'border-blue-200 bg-blue-50',
          title: 'text-blue-600',
          titleText: 'Low Risk',
          action: 'text-blue-600'
        };
      default:
        return {
          container: 'border-blue-200 bg-blue-50',
          title: 'text-blue-600',
          titleText: 'Low Risk',
          action: 'text-blue-600'
        };
    }
  };

  return (
    <Card className="analysis-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center legal-amber">
            <AlertTriangle className="mr-3" size={20} />
            Risk Analysis
          </CardTitle>
          <Badge className="bg-legal-emerald/10 text-legal-emerald">
            Feature Enabled
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {result.documentRiskCategory && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <span className="text-sm font-medium text-gray-900">Document Risk Category:</span>
              {getRiskCategoryBadge(result.documentRiskCategory)}
            </div>
          )}
          
          {result.escalationFlags && result.escalationFlags.length > 0 && (
            <div className="p-4 bg-legal-red/10 border border-legal-red/20 rounded-lg">
              <h4 className="font-medium legal-red mb-2">⚠️ Escalation Required</h4>
              <ul className="space-y-1">
                {result.escalationFlags.map((flag, index) => (
                  <li key={index} className="text-sm text-gray-700">• {flag}</li>
                ))}
              </ul>
              <p className="text-xs legal-red font-medium mt-2">
                These items require immediate attorney review.
              </p>
            </div>
          )}
          
          {result.risks.map((risk, index) => {
            const classes = getRiskClasses(risk.level);
            return (
              <div key={index} className={`border rounded-lg p-4 ${classes.container}`}>
                <div className="flex items-start space-x-3">
                  {getRiskIcon(risk.level)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium ${classes.title}`}>{classes.titleText}</h4>
                      {risk.requiresAttorneyReview && (
                        <Badge variant="outline" className="text-xs legal-red border-legal-red">
                          Attorney Review
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{risk.title}</p>
                    <p className="text-xs legal-slate mb-2">{risk.description}</p>
                    {risk.evidenceSection && (
                      <p className="text-xs font-medium text-blue-600 mb-2">
                        Evidence: {risk.evidenceSection}
                      </p>
                    )}
                    <p className="text-xs legal-slate mb-2">Impact: {risk.impact}</p>
                    <p className={`text-xs font-medium ${classes.action}`}>
                      Suggested Action: {risk.suggestedAction}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
