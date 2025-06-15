import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DocumentTypeInfo {
  displayName: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  defaultReviewer: string;
  keywords: string[];
}

/**
 * Gets all available document types from the document-types.json configuration
 */
export function getAvailableDocumentTypes(): Record<string, DocumentTypeInfo> {
  try {
    const configPath = path.join(__dirname, '../../shared/document-types.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    return config.documentTypes || {};
  } catch (error) {
    console.warn('Failed to load document types configuration:', error);
    return {};
  }
}

/**
 * Auto-detects document type based on content keywords
 */
export function detectDocumentType(content: string): string | undefined {
  if (!content || typeof content !== 'string') {
    return undefined;
  }
  
  const documentTypes = getAvailableDocumentTypes();
  const contentLower = content.toLowerCase();
  
  // Score each document type based on keyword matches
  const scores: Record<string, number> = {};
  
  for (const [docType, config] of Object.entries(documentTypes)) {
    scores[docType] = 0;
    
    // Count keyword matches
    if (config.keywords && Array.isArray(config.keywords)) {
      for (const keyword of config.keywords) {
        if (keyword && typeof keyword === 'string') {
          const keywordLower = keyword.toLowerCase();
          const matches = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
          scores[docType] += matches;
        }
      }
    }
  }
  
  // Find the document type with the highest score
  const bestMatch = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)[0];
  
  return bestMatch?.[0] ?? undefined;
}

/**
 * Gets formatted list of document types for UI dropdown
 */
export function getDocumentTypeOptions(): Array<{ value: string; label: string; category: string }> {
  const documentTypes = getAvailableDocumentTypes();
  
  return Object.entries(documentTypes).map(([value, config]) => ({
    value,
    label: config.displayName,
    category: config.category
  }));
}