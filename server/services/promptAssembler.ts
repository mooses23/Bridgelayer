import fs from 'fs';
import path from 'path';

const loadText = (filePath: string): string => {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
  } catch (error) {
    console.error(`Failed to load prompt file: ${filePath}`, error);
    return '';
  }
};

const loadJson = (filePath: string): any => {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8'));
  } catch (error) {
    console.error(`Failed to load config file: ${filePath}`, error);
    return null;
  }
};

export async function assemblePrompt(docType: string = 'contract'): Promise<string> {
  const configPath = `./prompts/filetypes/${docType}.json`;
  const config = loadJson(configPath);
  
  // Fallback to default contract config if specific type not found
  const finalConfig = config || loadJson('./prompts/filetypes/contract.json');
  
  if (!finalConfig) {
    throw new Error('Unable to load prompt configuration');
  }

  const parts: string[] = [];

  // Always include core trust and risk protocols
  parts.push(loadText('./prompts/base/trustLayerEnhancer.txt'));
  parts.push(loadText('./prompts/base/riskProfileBalancer.txt'));

  // Add enabled analysis modules
  if (finalConfig.enabled_features.summarize) {
    parts.push(loadText('./prompts/base/summarize.txt'));
  }
  if (finalConfig.enabled_features.risk) {
    parts.push(loadText('./prompts/base/risk.txt'));
  }
  if (finalConfig.enabled_features.clauses) {
    parts.push(loadText('./prompts/base/clauses.txt'));
  }
  if (finalConfig.enabled_features.crossref) {
    parts.push(loadText('./prompts/base/crossref.txt'));
  }
  if (finalConfig.enabled_features.formatting) {
    parts.push(loadText('./prompts/base/formatting.txt'));
  }

  // Add document-specific custom instructions
  if (finalConfig.custom_instructions) {
    parts.push(`DOCUMENT-SPECIFIC INSTRUCTIONS:\n${finalConfig.custom_instructions}`);
  }

  // Add risk level context
  parts.push(`DOCUMENT RISK LEVEL: ${finalConfig.risk_level.toUpperCase()}`);

  return parts.filter(part => part.length > 0).join('\n\n');
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