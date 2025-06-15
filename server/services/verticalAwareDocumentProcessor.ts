/**
 * Vertical-aware document processing service
 * Integrates the verticals plugin system with document analysis
 */

import { storage } from "../storage.js";
import { runAiAgent } from "./aiAgent.js";
import { detectDocumentTypeWithVertical, getFirmVerticalConfig } from "./verticalDocumentTypeDetection.js";
import { getFirmVertical } from "@shared/verticalLoader.js";

export async function processDocumentWithVertical(documentId: number, firmId: number): Promise<void> {
  // Get document
  const document = await storage.getDocument(documentId, firmId);
  if (!document || !document.content) {
    throw new Error("Document not found or has no content");
  }

  // Get firm's vertical configuration
  const verticalConfig = await getFirmVerticalConfig(firmId);
  const verticalName = verticalConfig.verticalName;

  // Auto-detect document type using vertical-specific detection
  let documentType = document.documentType;
  if (!documentType && document.content) {
    const detectedType = await detectDocumentTypeWithVertical(document.content, verticalName);
    if (detectedType) {
      documentType = detectedType;
      await storage.updateDocument(documentId, { documentType });
    }
  }

  if (!documentType) {
    throw new Error("Could not determine document type for analysis");
  }

  // Update document status to processing
  await storage.updateDocument(documentId, { status: 'processing' });

  try {
    // Run AI analysis using vertical-aware prompt assembly
    const analysisResult = await runAiAgent(documentType, document.content, firmId);

    // Store analysis result
    await storage.createAnalysis({
      documentId,
      analysisType: 'comprehensive',
      result: { 
        content: analysisResult,
        vertical: verticalName,
        documentType,
        processedAt: new Date().toISOString()
      },
      confidence: 0.95 // High confidence for comprehensive AI analysis
    });

    // Mark document as analyzed
    await storage.updateDocument(documentId, { 
      status: 'analyzed',
      analyzedAt: new Date()
    });

  } catch (error) {
    // Mark document as error and log the issue
    await storage.updateDocument(documentId, { 
      status: 'error'
    });
    
    console.error(`Document processing failed for document ${documentId} in vertical ${verticalName}:`, error);
    throw error;
  }
}

/**
 * Get available document types for a firm's vertical
 */
export async function getFirmDocumentTypes(firmId: number) {
  const verticalConfig = await getFirmVerticalConfig(firmId);
  const { getVerticalDocumentTypeOptions } = await import('./verticalDocumentTypeDetection.js');
  
  return await getVerticalDocumentTypeOptions(verticalConfig.verticalName);
}

/**
 * Get vertical configuration for a firm
 */
export async function getFirmVerticalInfo(firmId: number) {
  return await getFirmVerticalConfig(firmId);
}