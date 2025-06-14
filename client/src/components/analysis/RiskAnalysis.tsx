import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { RiskAnalysis as RiskAnalysisType } from "../../../../../../server/services/openai";

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
          {result.risks.map((risk, index) => {
            const classes = getRiskClasses(risk.level);
            return (
              <div key={index} className={`border rounded-lg p-4 ${classes.container}`}>
                <div className="flex items-start space-x-3">
                  {getRiskIcon(risk.level)}
                  <div className="flex-1">
                    <h4 className={`font-medium mb-1 ${classes.title}`}>{classes.titleText}</h4>
                    <p className="text-sm text-gray-700 mb-2">{risk.title}</p>
                    <p className="text-xs legal-slate mb-2">{risk.impact}</p>
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
