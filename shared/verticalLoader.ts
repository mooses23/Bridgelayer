/**
 * Vertical Plugin Loading System
 * 
 * Manages industry-specific configurations for BridgeLayer platform
 * Supports FIRMSYNC (legal), MEDSYNC (medical), EDUSYNC (education), HRSYNC (HR)
 */

import fs from 'fs/promises';
import path from 'path';

export interface VerticalConfig {
  verticalName: string;
  displayName: string;
  industry: string;
  description: string;
  documentCategories: string[];
  defaultAnalysisFeatures: Record<string, boolean>;
  riskLevels: Record<string, string[]>;
  defaultReviewerAssignment: Record<string, string>;
  trustLayerSettings?: Record<string, boolean>;
  complianceSettings?: Record<string, boolean>;
}

export interface DocumentTypeInfo {
  displayName: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  defaultReviewer: string;
  keywords: string[];
}

/**
 * Loads vertical configuration from verticals directory
 */
export async function loadVerticalConfig(verticalName: string = 'firmsync'): Promise<VerticalConfig> {
  try {
    const configPath = path.join(process.cwd(), 'verticals', verticalName, 'config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.warn(`Could not load vertical config for ${verticalName}, falling back to firmsync`);
    // Fallback to FIRMSYNC if vertical not found
    const configPath = path.join(process.cwd(), 'verticals', 'firmsync', 'config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  }
}

/**
 * Gets available document types for a specific vertical
 */
export async function getVerticalDocumentTypes(verticalName: string = 'firmsync'): Promise<Record<string, DocumentTypeInfo>> {
  try {
    const filetypesDir = path.join(process.cwd(), 'verticals', verticalName, 'filetypes');
    const files = await fs.readdir(filetypesDir);
    const documentTypes: Record<string, DocumentTypeInfo> = {};

    for (const file of files) {
      if (file.endsWith('.json')) {
        const docType = file.replace('.json', '');
        const filePath = path.join(filetypesDir, file);
        const config = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        
        // Build document type info from config
        documentTypes[docType] = {
          displayName: formatDisplayName(docType),
          category: determineCategory(docType, verticalName),
          riskLevel: config.riskLevel || 'medium',
          defaultReviewer: config.defaultReviewer || getDefaultReviewer(verticalName),
          keywords: generateKeywords(docType)
        };
      }
    }

    return documentTypes;
  } catch (error) {
    console.warn(`Could not load document types for ${verticalName}, falling back to firmsync`);
    // Fallback to existing document-types.json for FIRMSYNC
    const documentTypesPath = path.join(process.cwd(), 'shared', 'document-types.json');
    const documentTypesData = await fs.readFile(documentTypesPath, 'utf-8');
    return JSON.parse(documentTypesData);
  }
}

/**
 * Loads document configuration with vertical support
 */
export async function loadVerticalDocumentConfig(docType: string, verticalName: string = 'firmsync'): Promise<any> {
  try {
    // Try vertical-specific config first
    const verticalConfigPath = path.join(process.cwd(), 'verticals', verticalName, 'filetypes', `${docType}.json`);
    const configData = await fs.readFile(verticalConfigPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    // Fallback to shared filetypes (original FIRMSYNC)
    try {
      const sharedConfigPath = path.join(process.cwd(), 'shared', 'filetypes', `${docType}.json`);
      const configData = await fs.readFile(sharedConfigPath, 'utf-8');
      return JSON.parse(configData);
    } catch (fallbackError) {
      console.warn(`Could not load config for ${docType} in ${verticalName}, using default config`);
      return {
        summarize: true,
        risk: true,
        clauses: false,
        crossref: false,
        formatting: true,
        riskLevel: 'medium',
        customInstructions: ''
      };
    }
  }
}

/**
 * Loads prompt module with vertical support
 */
export async function loadVerticalPromptModule(moduleName: string, verticalName: string = 'firmsync'): Promise<string> {
  try {
    // Try vertical-specific prompt first
    const verticalPromptPath = path.join(process.cwd(), 'verticals', verticalName, 'prompts', 'base', `${moduleName}.txt`);
    return await fs.readFile(verticalPromptPath, 'utf-8');
  } catch (error) {
    // Fallback to shared prompts (original FIRMSYNC)
    try {
      const sharedPromptPath = path.join(process.cwd(), 'prompts', 'base', `${moduleName}.txt`);
      return await fs.readFile(sharedPromptPath, 'utf-8');
    } catch (fallbackError) {
      console.warn(`Could not load prompt module ${moduleName} for ${verticalName}`);
      return `[${moduleName.toUpperCase()} ANALYSIS]\nPlease analyze this document for ${moduleName} considerations.`;
    }
  }
}

/**
 * Gets firm's vertical from configuration
 */
export async function getFirmVertical(firmId: string | number): Promise<string> {
  try {
    // Try to load from firm's config.json
    const firmConfigPath = path.join(process.cwd(), 'firms', `firm_${firmId.toString().padStart(3, '0')}`, 'config.json');
    const configData = await fs.readFile(firmConfigPath, 'utf-8');
    const config = JSON.parse(configData);
    return config.vertical || 'firmsync';
  } catch (error) {
    // Default to FIRMSYNC
    return 'firmsync';
  }
}

// Helper functions
function formatDisplayName(docType: string): string {
  return docType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function determineCategory(docType: string, verticalName: string): string {
  const categoryMappings: Record<string, Record<string, string>> = {
    firmsync: {
      nda: 'corporate',
      contract: 'corporate', 
      lease: 'real_estate',
      employment: 'employment',
      settlement: 'dispute_resolution',
      litigation: 'dispute_resolution'
    },
    medsync: {
      patient_record: 'patient_records',
      consent_form: 'clinical_protocols',
      incident_report: 'medical_legal'
    },
    edusync: {
      syllabus: 'curriculum_documents',
      accreditation_report: 'accreditation'
    },
    hrsync: {
      job_description: 'recruitment',
      disciplinary_action: 'employee_relations'
    }
  };

  return categoryMappings[verticalName]?.[docType] || 'general';
}

function getDefaultReviewer(verticalName: string): string {
  const defaultReviewers: Record<string, string> = {
    firmsync: 'paralegal',
    medsync: 'nurse_manager',
    edusync: 'dean',
    hrsync: 'hr_manager'
  };

  return defaultReviewers[verticalName] || 'reviewer';
}

function generateKeywords(docType: string): string[] {
  // Generate basic keywords from document type
  const words = docType.split('_');
  return [...words, docType.replace('_', ' ')];
}