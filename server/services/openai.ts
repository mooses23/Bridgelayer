import OpenAI from "openai";

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
}

export interface RiskAnalysis {
  risks: Array<{
    level: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    suggestedAction: string;
  }>;
  confidence: number;
}

export interface ClauseExtraction {
  clauses: Array<{
    type: string;
    status: 'found' | 'missing' | 'incomplete';
    content?: string;
    section?: string;
    aiGeneratedDraft?: string;
  }>;
  confidence: number;
}

export interface CrossReferenceCheck {
  references: Array<{
    reference: string;
    location: string;
    status: 'valid' | 'invalid' | 'missing';
    suggestion?: string;
  }>;
  confidence: number;
}

export interface FormattingAnalysis {
  issues: {
    numbering: Array<{ issue: string; severity: 'high' | 'medium' | 'low' }>;
    capitalization: Array<{ issue: string; severity: 'high' | 'medium' | 'low' }>;
    layout: Array<{ issue: string; severity: 'high' | 'medium' | 'low' }>;
  };
  score: number;
  confidence: number;
}

export async function analyzeDocumentSummary(content: string): Promise<DocumentSummary> {
  const prompt = `
Analyze this legal document and provide a structured summary. Return your response in JSON format with the following structure:
{
  "documentType": "type of document (e.g., lease, contract, brief)",
  "purpose": "brief description of document's purpose",
  "parties": [{"name": "party name", "role": "their role"}],
  "keyTerms": [{"term": "key obligation/term", "description": "description", "section": "section reference if available"}],
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
        content: "You are FIRMSYNC's AI Legal Assistant. Analyze documents with precision and provide structured, formal summaries. Use clause numbers where possible and avoid casual language."
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
  const prompt = `
Analyze this legal document for risks and missing provisions. Return your response in JSON format:
{
  "risks": [
    {
      "level": "high|medium|low",
      "title": "brief title of risk",
      "description": "description of the risk",
      "impact": "why this matters",
      "suggestedAction": "recommended action"
    }
  ],
  "confidence": number between 0-100
}

Look for: ambiguous language, missing clauses (indemnification, jurisdiction, payment terms), dates without context, undefined terms.

Document content:
${content}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a legal risk analysis expert. Identify potential legal risks and missing standard provisions. Be thorough but not overly cautious."
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
  const prompt = `
Extract major clauses from this legal document. Return your response in JSON format:
{
  "clauses": [
    {
      "type": "clause type (e.g., termination, confidentiality, payment)",
      "status": "found|missing|incomplete",
      "content": "clause content if found",
      "section": "section reference if available",
      "aiGeneratedDraft": "sample clause if missing (clearly marked as AI-generated)"
    }
  ],
  "confidence": number between 0-100
}

Focus on: termination, confidentiality, payment, indemnification, jurisdiction, force majeure, amendment clauses.

Document content:
${content}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a legal clause extraction specialist. Extract key clauses and suggest professional drafts for missing ones. Mark AI-generated content clearly."
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
Verify all internal references in this legal document. Return your response in JSON format:
{
  "references": [
    {
      "reference": "the reference text (e.g., 'see Section 5.2')",
      "location": "where the reference appears",
      "status": "valid|invalid|missing",
      "suggestion": "correction if needed"
    }
  ],
  "confidence": number between 0-100
}

Check for: section references, defined terms, exhibits, schedules, inconsistent numbering.

Document content:
${content}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a document cross-reference verification specialist. Check all internal references for accuracy and consistency."
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
Analyze the formatting of this legal document. Return your response in JSON format:
{
  "issues": {
    "numbering": [{"issue": "description", "severity": "high|medium|low"}],
    "capitalization": [{"issue": "description", "severity": "high|medium|low"}],
    "layout": [{"issue": "description", "severity": "high|medium|low"}]
  },
  "score": number between 0-100,
  "confidence": number between 0-100
}

Check for: section numbering consistency, defined term capitalization, indentation, bullet formatting, legal citation format.

Document content:
${content}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a legal document formatting specialist. Analyze layout, numbering, and formatting issues with professional standards."
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
