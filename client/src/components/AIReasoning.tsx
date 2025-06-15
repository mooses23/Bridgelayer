import { Card, CardContent } from "@/components/ui/card";
import { Info, Shield } from "lucide-react";

interface ReasoningData {
  steps: string[];
  confidence: number;
  reasoning: string;
}

interface AIReasoningProps {
  reasoning: ReasoningData;
}

export default function AIReasoning({ reasoning }: AIReasoningProps) {
  return (
    <Card className="bg-blue-50 border border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Info className="text-blue-600 text-xl mt-1" size={24} />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">AI Analysis Reasoning</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>Reasoning:</strong> {reasoning.reasoning}
              </p>
              <p>
                <strong>Confidence Level:</strong> {Math.round(reasoning.confidence * 100)}% confidence
              </p>
              <div>
                <strong>Analysis Steps:</strong>
                <ul className="ml-4 mt-1 list-disc">
                  {reasoning.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
              <p>
                <strong>Verification:</strong> Cross-reference all extracted clauses with original document. 
                AI-generated draft clauses are templates requiring customization.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-blue-700 font-medium flex items-center">
                <Shield className="mr-1" size={12} />
                FIRMSYNC AI Assistant powered by BridgeLayer • Processing Time: 2.3 seconds • Document ID: DOC-{document.id}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
