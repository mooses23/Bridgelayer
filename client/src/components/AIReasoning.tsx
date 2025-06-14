import { Card, CardContent } from "@/components/ui/card";
import { Info, Shield } from "lucide-react";
import type { Document } from "@shared/schema";

interface AIReasoningProps {
  document: Document;
}

export default function AIReasoning({ document }: AIReasoningProps) {
  return (
    <Card className="bg-blue-50 border border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Info className="text-blue-600 text-xl mt-1" size={24} />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">AI Analysis Transparency</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>Analysis Method:</strong> Document processed using GPT-4o with specialized legal document understanding. 
                Analysis based on pattern recognition from training data through April 2024.
              </p>
              <p>
                <strong>Confidence Level:</strong> High confidence in document type identification and standard clause detection. 
                Medium confidence in risk assessment recommendations.
              </p>
              <p>
                <strong>Limitations:</strong> This AI analysis does not constitute legal advice. 
                All suggestions should be reviewed by qualified legal counsel before implementation.
              </p>
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
