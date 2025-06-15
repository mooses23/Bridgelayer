/**
 * Vertical-aware document type detection service
 * Extends the existing document type detection with vertical-specific support
 */

import { loadVerticalConfig, getVerticalDocumentTypes } from '@shared/verticalLoader.js';

/**
 * Auto-detects document type based on content keywords with vertical support
 */
export async function detectDocumentTypeWithVertical(content: string, verticalName: string = 'firmsync'): Promise<string | undefined> {
  const documentTypes = await getVerticalDocumentTypes(verticalName);
  const contentLower = content.toLowerCase();
  
  // Score each document type based on keyword matches
  const scores: Record<string, number> = {};
  
  for (const [docType, info] of Object.entries(documentTypes)) {
    let score = 0;
    
    // Check for keyword matches
    for (const keyword of info.keywords) {
      const keywordLower = keyword.toLowerCase();
      const matches = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
      score += matches;
    }
    
    // Bonus for exact document type name matches
    if (contentLower.includes(docType.replace('_', ' ').toLowerCase())) {
      score += 5;
    }
    
    if (score > 0) {
      scores[docType] = score;
    }
  }
  
  // Return the document type with the highest score
  if (Object.keys(scores).length === 0) {
    return undefined;
  }
  
  return Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
}

/**
 * Gets formatted list of document types for UI dropdown with vertical support
 */
export async function getVerticalDocumentTypeOptions(verticalName: string = 'firmsync'): Promise<Array<{ value: string; label: string; category: string }>> {
  const documentTypes = await getVerticalDocumentTypes(verticalName);
  
  return Object.entries(documentTypes).map(([docType, info]) => ({
    value: docType,
    label: info.displayName,
    category: info.category
  }));
}

/**
 * Gets available document types with vertical configuration
 */
export async function getAvailableDocumentTypesWithVertical(verticalName: string = 'firmsync'): Promise<Record<string, any>> {
  return await getVerticalDocumentTypes(verticalName);
}

/**
 * Gets vertical-specific configuration for a firm
 */
export async function getFirmVerticalConfig(firmId: string | number) {
  const { getFirmVertical, loadVerticalConfig } = await import('@shared/verticalLoader.js');
  
  const verticalName = await getFirmVertical(firmId);
  const verticalConfig = await loadVerticalConfig(verticalName);
  
  return {
    verticalName,
    config: verticalConfig
  };
}