// Enhanced AI Analysis Types with Trust Layer and Risk Assessment
export interface DocumentSummary {
  documentType: string;
  purpose: string;
  parties: Array<{
    name: string;
    role: string;
  }>;
  keyTerms: Array<{
    term: string;
    description: string;
    section?: string;
  }>;
  confidence: number;
  uncertainties?: string[];
}

export interface RiskAnalysis {
  risks: Array<{
    level: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    suggestedAction: string;
    evidenceSection?: string;
    requiresAttorneyReview?: boolean;
  }>;
  confidence: number;
  documentRiskCategory: 'low' | 'medium' | 'high';
  escalationFlags?: string[];
}

export interface ClauseExtraction {
  clauses: Array<{
    type: string;
    status: 'found' | 'missing' | 'incomplete';
    content?: string;
    section?: string;
    aiGeneratedDraft?: string;
    reasoning?: string;
    confidenceLevel?: 'high' | 'medium' | 'low';
  }>;
  confidence: number;
  uncertainties?: string[];
}

export interface CrossReferenceCheck {
  references: Array<{
    reference: string;
    location: string;
    status: 'valid' | 'invalid' | 'missing';
    suggestion?: string;
    evidenceOfIssue?: string;
    requiresReview?: boolean;
  }>;
  overallAssessment?: string;
  uncertainties?: string[];
  confidence: number;
}

export interface FormattingAnalysis {
  issues: {
    numbering: Array<{ issue: string; severity: 'high' | 'medium' | 'low'; evidence?: string; }>;
    capitalization: Array<{ issue: string; severity: 'high' | 'medium' | 'low'; evidence?: string; }>;
    layout: Array<{ issue: string; severity: 'high' | 'medium' | 'low'; evidence?: string; }>;
  };
  score: number;
  improvementSuggestions?: string[];
  uncertainties?: string[];
  confidence: number;
}