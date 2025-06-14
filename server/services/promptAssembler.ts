import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadText = (file: string): string => fs.readFileSync(path.join(__dirname, '../../prompts/base', file), 'utf-8');
const loadJson = (file: string): any => JSON.parse(fs.readFileSync(path.join(__dirname, '../../prompts/filetypes', file), 'utf-8'));

export async function assemblePrompt(docType: string = 'contract'): Promise<string> {
  try {
    const config = loadJson(`${docType}.json`);
    const parts: string[] = [];

    parts.push(loadText('trustLayerEnhancer.txt'));
    parts.push(loadText('riskProfileBalancer.txt'));

    if (config.enabled_features.summarize)  parts.push(loadText('summarize.txt'));
    if (config.enabled_features.risk)       parts.push(loadText('risk.txt'));
    if (config.enabled_features.clauses)    parts.push(loadText('clauses.txt'));
    if (config.enabled_features.crossref)   parts.push(loadText('crossref.txt'));
    if (config.enabled_features.formatting) parts.push(loadText('formatting.txt'));

    if (config.custom_instructions) parts.push(config.custom_instructions);

    return parts.join('\n\n');
  } catch (error) {
    console.warn(`Failed to load configuration for ${docType}, using default contract config:`, error);
    return assemblePrompt('contract');
  }
}

export function getDocumentTypeFromContent(content: string): string {
  const lowerContent = content.toLowerCase();
  
  // Simple document type detection based on keywords
  if (lowerContent.includes('non-disclosure') || lowerContent.includes('confidentiality')) {
    return 'nda';
  }
  if (lowerContent.includes('lease') || lowerContent.includes('rental') || lowerContent.includes('tenant') || lowerContent.includes('landlord')) {
    return 'lease';
  }
  if (lowerContent.includes('employment') || lowerContent.includes('employee')) {
    return 'employment';
  }
  if (lowerContent.includes('settlement') || lowerContent.includes('release') || lowerContent.includes('dismiss')) {
    return 'settlement';
  }
  if (lowerContent.includes('discovery') || lowerContent.includes('interrogatories') || lowerContent.includes('requests for production') || lowerContent.includes('bates')) {
    return 'discovery';
  }
  if (lowerContent.includes('litigation') || lowerContent.includes('complaint') || lowerContent.includes('plaintiff')) {
    return 'litigation';
  }
  
  // Default to general contract
  return 'contract';
}