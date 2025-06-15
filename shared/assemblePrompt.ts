import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ConfigObject {
  summarize?: boolean;
  risk?: boolean;
  clauses?: boolean;
  crossref?: boolean;
  formatting?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  customInstructions?: string;
}

/**
 * Loads a prompt module from the base prompts directory
 */
function loadPromptModule(moduleName: string): string {
  try {
    const promptPath = path.join(__dirname, 'prompts/base', `${moduleName}.txt`);
    return fs.readFileSync(promptPath, 'utf-8').trim();
  } catch (error) {
    console.warn(`Failed to load prompt module: ${moduleName}`);
    return '';
  }
}

/**
 * Dynamically assembles a full AI prompt for any document type
 * using prewritten prompt modules and firm-specific configuration
 */
export function assemblePrompt(docType: string, config: ConfigObject): string {
  const promptSections: string[] = [];

  // Always include Trust Layer Enhancer
  const trustLayer = loadPromptModule('trustLayerEnhancer');
  if (trustLayer) {
    promptSections.push(trustLayer);
  }

  // Always include Risk Profile Balancer with risk level context
  const riskBalancer = loadPromptModule('riskProfileBalancer');
  if (riskBalancer) {
    let riskContext = riskBalancer;
    if (config.riskLevel) {
      riskContext += `\n\nCURRENT DOCUMENT RISK LEVEL: ${config.riskLevel.toUpperCase()}`;
    }
    promptSections.push(riskContext);
  }

  // Document type context
  promptSections.push(`DOCUMENT TYPE: ${docType.toUpperCase()}`);

  // Include enabled analysis modules
  const moduleMap = {
    summarize: 'summarize',
    risk: 'risk', 
    clauses: 'clauses',
    crossref: 'crossref',
    formatting: 'formatting'
  };

  for (const [configKey, moduleName] of Object.entries(moduleMap)) {
    if (config[configKey as keyof ConfigObject] === true) {
      const moduleContent = loadPromptModule(moduleName);
      if (moduleContent) {
        promptSections.push(moduleContent);
      }
    }
  }

  // Add custom instructions if provided
  if (config.customInstructions?.trim()) {
    promptSections.push(`CUSTOM INSTRUCTIONS:\n${config.customInstructions.trim()}`);
  }

  // Combine all sections with double newlines
  return promptSections.join('\n\n');
}

/**
 * Loads a document configuration from the filetypes directory
 */
export function loadDocumentConfig(docType: string): ConfigObject {
  try {
    const configPath = path.join(__dirname, 'filetypes', `${docType.toLowerCase()}.json`);
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    return {
      summarize: config.enabled_features?.summarize || false,
      risk: config.enabled_features?.risk || false,
      clauses: config.enabled_features?.clauses || false,
      crossref: config.enabled_features?.crossref || false,
      formatting: config.enabled_features?.formatting || false,
      riskLevel: config.riskLevel || 'medium',
      customInstructions: config.customInstructions || ''
    };
  } catch (error) {
    console.warn(`Failed to load config for document type: ${docType}`);
    // Return default config
    return {
      summarize: true,
      risk: true,
      clauses: true,
      crossref: false,
      formatting: false,
      riskLevel: 'medium'
    };
  }
}

/**
 * Complete prompt assembly from document type - loads config and assembles prompt
 */
export function assemblePromptFromDocType(docType: string): string {
  const config = loadDocumentConfig(docType);
  return assemblePrompt(docType, config);
}