import { storage } from "../storage";
import { 
  analyzeDocumentSummary, 
  analyzeDocumentRisks, 
  extractClauses, 
  checkCrossReferences, 
  analyzeFormatting,
  identifyDocumentType
} from "./openai";
import type { Document, AnalysisFeatures } from "@shared/schema";

export async function processDocument(documentId: number, userId: number): Promise<void> {
  const document = await storage.getDocument(documentId);
  if (!document || !document.content) {
    throw new Error("Document not found or has no content");
  }

  const features = await storage.getUserFeatures(userId);
  if (!features) {
    throw new Error("User features not configured");
  }

  // Identify document type
  const documentType = await identifyDocumentType(document.content);
  await storage.updateDocument(documentId, { documentType });

  // Run enabled analyses
  const analysisPromises: Promise<void>[] = [];

  if (features.summarization) {
    analysisPromises.push(
      analyzeDocumentSummary(document.content).then(result => 
        storage.createAnalysis({
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
