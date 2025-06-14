import OpenAI from "openai";
import { assemblePrompt, getDocumentTypeFromContent } from "./promptAssembler";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

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

export async function analyzeDocumentSummary(content: string): Promise<DocumentSummary> {
  const docType = getDocumentTypeFromContent(content);
  const systemPrompt = await assemblePrompt(docType);
  
  const prompt = `
${systemPrompt}

DOCUMENT SUMMARIZATION TASK:
Analyze this legal document and provide a structured summary. Return your response in JSON format with the following structure:
{
  "documentType": "type of document with reasoning",
  "purpose": "brief description of document's purpose with supporting evidence",
  "parties": [{"name": "party name", "role": "their role"}],
  "keyTerms": [{"term": "key obligation/term", "description": "description with clause reference", "section": "specific section reference"}],
  "confidence": number between 0-100,
  "uncertainties": ["list any ambiguous elements that may require attorney review"]
}

Document content:
${content}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are FIRMSYNC's AI Legal Assistant. Analyze documents with precision, cite specific sections, and flag uncertainties. Use formal, measured language. Never provide legal advice - you support paralegals with document analysis."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!);
}

export async function analyzeDocumentRisks(content: string): Promise<RiskAnalysis> {
  const docType = getDocumentTypeFromContent(content);
  const systemPrompt = await assemblePrompt(docType);
  
  const prompt = `
${systemPrompt}

RISK ANALYSIS TASK:
Perform comprehensive risk assessment following the protocols above.

Return JSON format:
{
  "documentRiskCategory": "low|medium|high",
  "risks": [
    {
      "level": "high|medium|low",
      "title": "brief title with supporting evidence",
      "description": "description citing specific sections",
      "impact": "why this matters - be specific",
      "suggestedAction": "recommended action using measured language",
      "evidenceSection": "specific clause/section reference",
      "requiresAttorneyReview": boolean
    }
  ],
  "escalationFlags": ["list any high-risk items requiring immediate attorney review"],
  "confidence": number between 0-100
}

Document content:
${content}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are FIRMSYNC's AI Legal Assistant. Apply risk-appropriate analysis with trust layer principles. Cite evidence, use measured language, flag uncertainties. Support paralegals - never provide legal advice."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!);
}

export async function extractClauses(content: string): Promise<ClauseExtraction> {
  const docType = getDocumentTypeFromContent(content);
  const systemPrompt = await assemblePrompt(docType);
  
  const prompt = `
${systemPrompt}

CLAUSE EXTRACTION TASK:
Extract major clauses from this legal document following the protocols above.

Return JSON format:
{
  "clauses": [
    {
      "type": "clause type (e.g., termination, confidentiality, payment)",
      "status": "found|missing|incomplete",
      "content": "exact clause content if found",
      "section": "specific section reference with evidence",
      "aiGeneratedDraft": "🧠 Suggested Draft Language (AI-Generated — Review Required): [draft text]",
      "reasoning": "explanation of why this clause is important for this document type",
      "confidenceLevel": "high|medium|low based on clarity of evidence"
    }
  ],
  "confidence": number between 0-100,
  "uncertainties": ["list any ambiguous clause identifications requiring review"]
}

Document content:
${content}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are FIRMSYNC's AI Legal Assistant. Extract clauses with evidence-based analysis. Mark AI-generated drafts clearly. Use measured language and cite specific sections. Support paralegals - never provide legal advice."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!);
}

export async function checkCrossReferences(content: string): Promise<CrossReferenceCheck> {
  const prompt = `
You are FIRMSYNC's AI Legal Assistant performing cross-reference verification with trust layer principles.

VERIFICATION REQUIREMENTS:
- Only flag references with clear evidence of errors
- Cite specific line numbers or sections where issues appear
- Use measured language: "May require clarification" not "This is wrong"
- Flag ambiguous references that need attorney review
- Verify existence of referenced sections, exhibits, schedules

Verify all internal references in this legal document. Return JSON format:
{
  "references": [
    {
      "reference": "exact reference text found (e.g., 'see Section 5.2')",
      "location": "specific location where reference appears",
      "status": "valid|invalid|missing",
      "suggestion": "measured suggestion if correction needed",
      "evidenceOfIssue": "specific evidence of the problem",
      "requiresReview": boolean
    }
  ],
  "overallAssessment": "summary of cross-reference quality",
  "uncertainties": ["list any ambiguous references requiring attorney review"],
  "confidence": number between 0-100
}

Focus on: section references, defined terms, exhibits, schedules, appendices, inconsistent numbering.

Document content:
${content}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are FIRMSYNC's AI Legal Assistant. Verify cross-references with evidence-based analysis. Use measured language and cite specific evidence. Flag uncertainties for review."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!);
}

export async function analyzeFormatting(content: string): Promise<FormattingAnalysis> {
  const prompt = `
You are FIRMSYNC's AI Legal Assistant performing formatting analysis with trust layer verification.

FORMATTING REVIEW PRINCIPLES:
- Only flag clear formatting inconsistencies with specific evidence
- Cite exact line numbers or sections where issues appear
- Use professional language: "Consider standardizing..." not "This is wrong"
- Distinguish between style preferences and actual formatting errors
- Focus on issues that could affect document enforceability or clarity

Analyze the formatting of this legal document. Return JSON format:
{
  "issues": {
    "numbering": [{"issue": "specific description with location", "severity": "high|medium|low", "evidence": "exact text showing the issue"}],
    "capitalization": [{"issue": "specific description with location", "severity": "high|medium|low", "evidence": "exact text showing the issue"}],
    "layout": [{"issue": "specific description with location", "severity": "high|medium|low", "evidence": "exact text showing the issue"}]
  },
  "score": number between 0-100,
  "improvementSuggestions": ["actionable formatting improvements"],
  "uncertainties": ["formatting elements that may require style guide clarification"],
  "confidence": number between 0-100
}

Focus on: section numbering consistency, defined term capitalization, indentation patterns, bullet/list formatting, legal citation consistency, paragraph structure.

Document content:
${content}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are FIRMSYNC's AI Legal Assistant. Analyze formatting with evidence-based assessment. Use professional language and cite specific examples. Support document quality without imposing style preferences."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!);
}

export async function identifyDocumentType(content: string): Promise<string> {
  const prompt = `
Identify the type of this legal document. Respond with just the document type (e.g., "Commercial Lease Agreement", "Employment Contract", "Non-Disclosure Agreement", etc.).

Document content (first 1000 characters):
${content.substring(0, 1000)}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a legal document classification expert. Identify document types accurately and concisely."
      },
      {
        role: "user",
        content: prompt
      }
    ],
  });

  return response.choices[0].message.content?.trim() || "Unknown Document Type";
}
