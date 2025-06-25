import { storage } from "../storage";
import { 
  analyzeDocumentSummary, 
  analyzeDocumentRisks, 
  extractClauses, 
  checkCrossReferences, 
  analyzeFormatting,
  identifyDocumentType
} from "./openai";
import { getDocumentTypeFromContent } from "./promptAssembler";
import { runAiAgent } from "./aiAgent";
import type { Document, AnalysisFeatures } from "@shared/schema";

export async function processDocument(documentId: number, userId: number): Promise<void> {
  // First get user to obtain firmId
  const user = await storage.getUser(userId);
  if (!user || !user.firmId) {
    throw new Error("User not found or not associated with a firm");
  }

  const firmId = user.firmId; // Store for use in analysis creation

  const document = await storage.getDocument(documentId, firmId);
  if (!document || !document.content) {
    throw new Error("Document not found or has no content");
  }

  const analysisSettings = await storage.getFirmAnalysisSettings(firmId);
  if (!analysisSettings || !analysisSettings.settings) {
    throw new Error("Firm analysis settings not configured");
  }

  // Parse settings from JSON
  const features = analysisSettings.settings as any;

  // Identify document type using enhanced detection
  const documentType = getDocumentTypeFromContent(document.content);
  await storage.updateDocument(documentId, { documentType });

  // Run enabled analyses
  const analysisPromises: Promise<any>[] = [];

  if (features.summarization) {
    analysisPromises.push(
      analyzeDocumentSummary(document.content).then(result => 
        storage.createAnalysis({
          firmId,
          documentId,
          analysisType: 'summarization',
          result: result as any,
          confidence: result.confidence
        })
      )
    );
  }

  if (features.riskAnalysis) {
    analysisPromises.push(
      analyzeDocumentRisks(document.content).then(result => 
        storage.createAnalysis({
          firmId,
          documentId,
          analysisType: 'risk',
          result: result as any,
          confidence: result.confidence
        })
      )
    );
  }

  if (features.clauseExtraction) {
    analysisPromises.push(
      extractClauses(document.content).then(result => 
        storage.createAnalysis({
          firmId,
          documentId,
          analysisType: 'clause',
          result: result as any,
          confidence: result.confidence
        })
      )
    );
  }

  if (features.crossReference) {
    analysisPromises.push(
      checkCrossReferences(document.content).then(result => 
        storage.createAnalysis({
          firmId,
          documentId,
          analysisType: 'cross_reference',
          result: result as any,
          confidence: result.confidence
        })
      )
    );
  }

  if (features.formatting) {
    analysisPromises.push(
      analyzeFormatting(document.content).then(result => 
        storage.createAnalysis({
          firmId,
          documentId,
          analysisType: 'formatting',
          result: result as any,
          confidence: result.confidence
        })
      )
    );
  }

  await Promise.all(analysisPromises);

  // Mark document as analyzed
  await storage.updateDocument(documentId, { analyzedAt: new Date() });
}
