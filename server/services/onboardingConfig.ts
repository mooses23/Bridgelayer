export interface DocumentTypeConfig {
  docType: string;
  displayName: string;
  summarize: boolean;
  riskAnalysis: boolean;
  clauseMode: 'check_only' | 'full_completion' | 'disabled';
  reviewer: 'paralegal' | 'associate' | 'admin';
  enabled: boolean;
}

export interface FirmProfile {
  firmName: string;
  adminEmail: string;
  documentConfigs: DocumentTypeConfig[];
  createdAt: Date;
  lastModified: Date;
}

export const DEFAULT_DOCUMENT_PRESETS: Record<string, Partial<DocumentTypeConfig>> = {
  nda: {
    displayName: 'Non-Disclosure Agreement',
    summarize: true,
    riskAnalysis: true,
    clauseMode: 'check_only',
    reviewer: 'paralegal'
  },
  lease: {
    displayName: 'Lease Agreement',
    summarize: true,
    riskAnalysis: true,
    clauseMode: 'full_completion',
    reviewer: 'admin'
  },
  employment: {
    displayName: 'Employment Agreement',
    summarize: true,
    riskAnalysis: true,
    clauseMode: 'check_only',
    reviewer: 'associate'
  },
  settlement: {
    displayName: 'Settlement Agreement',
    summarize: true,
    riskAnalysis: true,
    clauseMode: 'full_completion',
    reviewer: 'admin'
  },
  discovery: {
    displayName: 'Discovery Response',
    summarize: false,
    riskAnalysis: true,
    clauseMode: 'disabled',
    reviewer: 'admin'
  },
  contract: {
    displayName: 'General Contract',
    summarize: true,
    riskAnalysis: true,
    clauseMode: 'check_only',
    reviewer: 'paralegal'
  },
  litigation: {
    displayName: 'Litigation Document',
    summarize: true,
    riskAnalysis: true,
    clauseMode: 'check_only',
    reviewer: 'admin'
  }
};

export function generateFirmConfigSummary(profile: FirmProfile): string {
  let summary = `Document Workflow Summary for ${profile.firmName}\n`;
  summary += `Admin Contact: ${profile.adminEmail}\n`;
  summary += `Setup Date: ${profile.createdAt.toLocaleDateString()}\n\n`;
  
  profile.documentConfigs.forEach(config => {
    if (config.enabled) {
      summary += `${config.displayName}:\n`;
      summary += `• Document summaries: ${config.summarize ? 'Create summaries' : 'Skip summaries'}\n`;
      summary += `• Risk checking: ${config.riskAnalysis ? 'Check for potential risks' : 'Skip risk review'}\n`;
      summary += `• Clause review: ${config.clauseMode === 'full_completion' ? 'Suggest complete language' : 
                                 config.clauseMode === 'check_only' ? 'Check for missing clauses' : 'Skip clause review'}\n`;
      summary += `• Assigned to: ${config.reviewer.charAt(0).toUpperCase() + config.reviewer.slice(1)}\n\n`;
    }
  });
  
  summary += `Ready to start processing documents with these settings.\nYou can adjust these preferences anytime in your firm settings.`;
  
  return summary;
}

export function createDefaultFirmProfile(firmName: string, adminEmail: string, selectedDocTypes: string[]): FirmProfile {
  const documentConfigs: DocumentTypeConfig[] = selectedDocTypes.map(docType => ({
    docType,
    displayName: DEFAULT_DOCUMENT_PRESETS[docType]?.displayName || docType.toUpperCase(),
    summarize: DEFAULT_DOCUMENT_PRESETS[docType]?.summarize ?? true,
    riskAnalysis: DEFAULT_DOCUMENT_PRESETS[docType]?.riskAnalysis ?? true,
    clauseMode: DEFAULT_DOCUMENT_PRESETS[docType]?.clauseMode ?? 'check_only',
    reviewer: DEFAULT_DOCUMENT_PRESETS[docType]?.reviewer ?? 'paralegal',
    enabled: true
  }));

  return {
    firmName,
    adminEmail,
    documentConfigs,
    createdAt: new Date(),
    lastModified: new Date()
  };
}