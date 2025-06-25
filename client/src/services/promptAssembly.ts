/**
 * Prompt Assembly Service for FirmSync Legal AI
 * Handles dynamic prompt construction for legal document analysis
 */

interface PromptTemplate {
  id: string;
  name: string;
  category: 'nda' | 'lease' | 'settlement' | 'discovery' | 'litigation' | 'base';
  content: string;
  variables: string[];
  metadata?: {
    documentType?: string;
    reviewLevel?: 'paralegal' | 'attorney';
    complexity?: 'basic' | 'standard' | 'complex';
  };
}

interface AssemblyContext {
  documentType: string;
  firmConfig?: {
    name: string;
    jurisdiction: string;
    practiceAreas: string[];
  };
  analysisLevel: 'paralegal' | 'attorney';
  customInstructions?: string;
}

class PromptAssemblyService {
  private basePrompts: Map<string, PromptTemplate> = new Map();
  private megaPrompts: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.loadPromptTemplates();
  }

  /**
   * Load prompt templates from the prompts directory structure
   */
  private async loadPromptTemplates() {
    try {
      // Load base prompts
      const basePrompts = [
        'trustLayerEnhancer',
        'contractAnalyzer',
        'riskAssessment',
        'complianceChecker'
      ];

      for (const promptName of basePrompts) {
        const response = await fetch(`/prompts/base/${promptName}.txt`);
        if (response.ok) {
          const content = await response.text();
          this.basePrompts.set(promptName, {
            id: promptName,
            name: promptName,
            category: 'base',
            content,
            variables: this.extractVariables(content)
          });
        }
      }

      // Load mega prompts for specific document types
      const megaPrompts = [
        'nda_complete',
        'lease_complete', 
        'settlement_complete',
        'discovery_complete',
        'litigation_complete'
      ];

      for (const promptName of megaPrompts) {
        const response = await fetch(`/prompts/mega/${promptName}.txt`);
        if (response.ok) {
          const content = await response.text();
          const documentType = promptName.split('_')[0];
          this.megaPrompts.set(documentType, {
            id: promptName,
            name: promptName,
            category: documentType as any,
            content,
            variables: this.extractVariables(content),
            metadata: {
              documentType,
              reviewLevel: 'paralegal',
              complexity: 'complex'
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to load prompt templates:', error);
    }
  }

  /**
   * Extract variable placeholders from prompt content
   */
  private extractVariables(content: string): string[] {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variableRegex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  }

  /**
   * Assemble a complete prompt for document analysis
   */
  public async assemblePrompt(context: AssemblyContext): Promise<string> {
    const { documentType, firmConfig, analysisLevel, customInstructions } = context;

    // Get the appropriate mega prompt for the document type
    let basePrompt = this.megaPrompts.get(documentType.toLowerCase());
    
    // Fallback to base trust layer enhancer if specific prompt not found
    if (!basePrompt) {
      basePrompt = this.basePrompts.get('trustLayerEnhancer');
    }

    if (!basePrompt) {
      throw new Error('No suitable prompt template found');
    }

    let assembledPrompt = basePrompt.content;

    // Replace standard variables
    const variables = {
      documentType: documentType.toUpperCase(),
      firmName: firmConfig?.name || 'Your Law Firm',
      jurisdiction: firmConfig?.jurisdiction || 'applicable jurisdiction',
      analysisLevel: analysisLevel,
      practiceAreas: firmConfig?.practiceAreas?.join(', ') || 'general practice',
      customInstructions: customInstructions || ''
    };

    // Replace variable placeholders
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      assembledPrompt = assembledPrompt.replace(regex, value);
    }

    // Add custom instructions if provided
    if (customInstructions) {
      assembledPrompt += `\n\n**ADDITIONAL INSTRUCTIONS:**\n${customInstructions}`;
    }

    // Add firm-specific compliance requirements
    if (firmConfig?.jurisdiction) {
      assembledPrompt += `\n\n**JURISDICTION-SPECIFIC REQUIREMENTS:**\nEnsure analysis considers ${firmConfig.jurisdiction} specific laws and regulations.`;
    }

    return assembledPrompt;
  }

  /**
   * Get available document types for prompt assembly
   */
  public getAvailableDocumentTypes(): string[] {
    return Array.from(this.megaPrompts.keys());
  }

  /**
   * Get template information
   */
  public getTemplateInfo(documentType: string): PromptTemplate | undefined {
    return this.megaPrompts.get(documentType.toLowerCase());
  }

  /**
   * Validate prompt assembly context
   */
  public validateContext(context: AssemblyContext): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!context.documentType) {
      errors.push('Document type is required');
    }

    if (!context.analysisLevel) {
      errors.push('Analysis level is required');
    }

    if (context.analysisLevel && !['paralegal', 'attorney'].includes(context.analysisLevel)) {
      errors.push('Analysis level must be either "paralegal" or "attorney"');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const promptAssemblyService = new PromptAssemblyService();
export default promptAssemblyService;
export type { PromptTemplate, AssemblyContext };
