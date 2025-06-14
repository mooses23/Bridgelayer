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
  let summary = `FIRMSYNC Configuration Summary for ${profile.firmName}\n`;
  summary += `Admin Contact: ${profile.adminEmail}\n`;
  summary += `Configured: ${profile.createdAt.toLocaleDateString()}\n\n`;
  
  profile.documentConfigs.forEach(config => {
    if (config.enabled) {
      summary += `---\n`;
      summary += `Doc Type: ${config.displayName}\n`;
      summary += `• Summarize: ${config.summarize ? '✅' : '❌'}\n`;
      summary += `• Risk Check: ${config.riskAnalysis ? '✅' : '❌'}\n`;
      summary += `• Clauses: ${config.clauseMode === 'full_completion' ? 'Full Completion' : 
                                 config.clauseMode === 'check_only' ? 'Check Only' : 'Disabled'}\n`;
      summary += `• Reviewer: ${config.reviewer.charAt(0).toUpperCase() + config.reviewer.slice(1)}\n`;
    }
  });
  
  summary += `\n> You can edit these settings later in the BridgeLayer Admin Portal.`;
  
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