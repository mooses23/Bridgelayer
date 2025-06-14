import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import FeatureToggles from "@/components/FeatureToggles";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentSummary from "@/components/analysis/DocumentSummary";
import RiskAnalysis from "@/components/analysis/RiskAnalysis";
import ClauseExtraction from "@/components/analysis/ClauseExtraction";
import CrossReferenceCheck from "@/components/analysis/CrossReferenceCheck";
import FormattingAnalysis from "@/components/analysis/FormattingAnalysis";
import AIReasoning from "@/components/AIReasoning";
import { useQuery } from "@tanstack/react-query";
import type { Document, AnalysisFeatures } from "@shared/schema";

export default function Dashboard() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  const { data: features, refetch: refetchFeatures } = useQuery<AnalysisFeatures>({
    queryKey: ["/api/features"],
  });

  const { data: documentData, refetch: refetchDocument } = useQuery({
    queryKey: ["/api/documents", selectedDocument?.id],
    enabled: !!selectedDocument?.id,
  });

  const handleDocumentUploaded = (document: Document) => {
    setSelectedDocument(document);
    // Refetch document data to get analysis results
    setTimeout(() => {
      refetchDocument();
    }, 3000); // Give some time for analysis to complete
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <title>FIRMSYNC - AI Legal Assistant</title>
      <meta name="description" content="AI-powered legal document analysis platform for paralegals featuring document summarization, risk analysis, and clause extraction." />
      
      <div className="min-h-screen flex">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              
              <FeatureToggles 
                features={features} 
                onFeaturesUpdate={refetchFeatures}
              />
              
              <DocumentUpload 
                selectedDocument={selectedDocument}
                onDocumentUploaded={handleDocumentUploaded}
                onDocumentRemoved={() => setSelectedDocument(null)}
              />
              
              {selectedDocument && documentData && (
                <>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <DocumentSummary 
                      analysis={documentData.analyses?.summarization}
                      enabled={features?.summarization ?? false}
                    />
                    
                    <RiskAnalysis 
                      analysis={documentData.analyses?.risk}
                      enabled={features?.riskAnalysis ?? false}
                    />
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-6">
                    <ClauseExtraction 
                      analysis={documentData.analyses?.clause}
                      enabled={features?.clauseExtraction ?? false}
                    />
                    
                    <CrossReferenceCheck 
                      analysis={documentData.analyses?.cross_reference}
                      enabled={features?.crossReference ?? false}
                    />
                  </div>
                  
                  <FormattingAnalysis 
                    analysis={documentData.analyses?.formatting}
                    enabled={features?.formatting ?? false}
                  />
                  
                  <AIReasoning document={documentData.document} />
                </>
              )}
              
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
