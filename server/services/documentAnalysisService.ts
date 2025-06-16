
import OpenAI from "openai";
import { db } from "../db";
import { documents, documentAnalyses } from "../../shared/schema";
import { eq } from "drizzle-orm";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface DocumentAnalysisRequest {
  documentId: number;
  documentType: string;
  content: string;
  fileName: string;
  tenantId: string;
  userId: number;
}

export interface DocumentAnalysisResult {
  summary: string;
  keyPoints: string[];
  riskFlags: string[];
  extractedClauses: {
    type: string;
    content: string;
    location: string;
  }[];
  confidence: number;
  analysisType: string;
}

export class DocumentAnalysisService {
  
  // Extract text from different file types
  static async extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
    try {
      switch (mimeType) {
        case 'application/pdf':
          const pdfData = await pdfParse(buffer);
          return pdfData.text;
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          const docxData = await mammoth.extractRawText({ buffer });
          return docxData.value;
        
        case 'text/plain':
          return buffer.toString('utf-8');
        
        default:
          // Try to parse as text
          return buffer.toString('utf-8');
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error(`Failed to extract text from ${mimeType} file`);
    }
  }

  // Get prompt template for document type
  static getPromptTemplate(documentType: string): string {
    const templates: Record<string, string> = {
      'nda': `You are a legal AI assistant. Analyze the following NDA and extract:
- Parties involved
- Effective date  
- Confidentiality period
- Key obligations and restrictions
- Termination clauses
- Jurisdiction
- Risk assessment (high/medium/low)

Respond in JSON format with fields: parties, effectiveDate, confidentialityPeriod, obligations, termination, jurisdiction, riskLevel, summary, keyPoints, riskFlags.`,

      'employment': `Act as a legal document analyst. Analyze this employment agreement and extract:
- Employee and employer names
- Position and job description
- Compensation details
- Benefits and perquisites  
- Termination conditions
- Non-compete/non-disclosure clauses
- Key deadlines and dates

Respond in JSON format with fields: parties, position, compensation, benefits, termination, restrictiveClauses, summary, keyPoints, riskFlags.`,

      'lease': `Review this lease agreement and analyze:
- Landlord and tenant information
- Property details and address
- Lease term and renewal options
- Rent amount and escalation clauses
- Security deposit terms
- Maintenance responsibilities
- Early termination provisions
- High-risk or unusual clauses

Respond in JSON format with fields: parties, property, leaseTerm, rentDetails, securityDeposit, maintenance, termination, summary, keyPoints, riskFlags.`,

      'contract': `Analyze this contract and extract:
- Contracting parties
- Scope of work/services
- Payment terms and conditions
- Performance deadlines
- Liability and indemnification clauses
- Termination provisions
- Dispute resolution mechanisms

Respond in JSON format with fields: parties, scope, paymentTerms, deadlines, liability, termination, disputeResolution, summary, keyPoints, riskFlags.`,

      'default': `Analyze this legal document and provide:
- Document type identification
- Key parties involved
- Main terms and conditions
- Important dates and deadlines
- Risk assessment
- Summary of key provisions

Respond in JSON format with fields: documentType, parties, mainTerms, importantDates, riskLevel, summary, keyPoints, riskFlags.`
    };

    return templates[documentType] || templates['default'];
  }

  // Perform AI analysis
  static async analyzeDocument(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResult> {
    try {
      const prompt = this.getPromptTemplate(request.documentType);
      
      const systemMessage = `You are a professional legal document analysis AI. Provide thorough, accurate analysis while maintaining confidentiality. Always respond in valid JSON format.`;
      
      const userMessage = `${prompt}

--- DOCUMENT CONTENT ---
${request.content}`;

      console.log(`[AI Analysis] Starting analysis for ${request.fileName} (type: ${request.documentType})`);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      });

      const analysisContent = response.choices[0].message.content;
      
      if (!analysisContent) {
        throw new Error("No analysis response received from AI");
      }

      let parsedAnalysis;
      try {
        parsedAnalysis = JSON.parse(analysisContent);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        throw new Error("Invalid JSON response from AI analysis");
      }

      // Store analysis in database (metadata only, not full content)
      const analysisRecord = await db.insert(documentAnalyses).values({
        documentId: request.documentId,
        analysisType: 'ai_powered',
        summary: parsedAnalysis.summary || 'Analysis completed',
        keyFindings: JSON.stringify(parsedAnalysis.keyPoints || []),
        riskAssessment: parsedAnalysis.riskLevel || 'medium',
        confidence: 0.85,
        metadata: JSON.stringify({
          documentType: request.documentType,
          fileName: request.fileName,
          analysisTimestamp: new Date().toISOString(),
          model: 'gpt-4o'
        }),
        createdAt: new Date(),
        createdBy: request.userId
      }).returning();

      console.log(`[AI Analysis] Completed for ${request.fileName}, analysis ID: ${analysisRecord[0].id}`);

      return {
        summary: parsedAnalysis.summary || 'Document analysis completed',
        keyPoints: parsedAnalysis.keyPoints || [],
        riskFlags: parsedAnalysis.riskFlags || [],
        extractedClauses: this.formatExtractedClauses(parsedAnalysis),
        confidence: 0.85,
        analysisType: 'ai_powered'
      };

    } catch (error) {
      console.error('Document analysis error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('insufficient_quota')) {
          throw new Error('OpenAI API quota exceeded. Please contact administrator.');
        }
        if (error.message.includes('invalid_api_key')) {
          throw new Error('AI service configuration error. Please contact administrator.');
        }
      }
      
      throw new Error('Document analysis failed. Please try again.');
    }
  }

  // Format extracted clauses from AI response
  private static formatExtractedClauses(analysisData: any): Array<{type: string, content: string, location: string}> {
    const clauses = [];
    
    // Map common fields to clause format
    if (analysisData.obligations) {
      clauses.push({
        type: 'Obligations',
        content: Array.isArray(analysisData.obligations) ? analysisData.obligations.join('; ') : analysisData.obligations,
        location: 'Main Terms'
      });
    }
    
    if (analysisData.termination) {
      clauses.push({
        type: 'Termination',
        content: analysisData.termination,
        location: 'Termination Clause'
      });
    }
    
    if (analysisData.liability) {
      clauses.push({
        type: 'Liability',
        content: analysisData.liability,
        location: 'Liability Section'
      });
    }
    
    if (analysisData.paymentTerms) {
      clauses.push({
        type: 'Payment Terms',
        content: analysisData.paymentTerms,
        location: 'Financial Terms'
      });
    }

    return clauses;
  }

  // Get analysis history for a document
  static async getDocumentAnalyses(documentId: number): Promise<any[]> {
    return await db
      .select()
      .from(documentAnalyses)
      .where(eq(documentAnalyses.documentId, documentId))
      .orderBy(documentAnalyses.createdAt);
  }
}
