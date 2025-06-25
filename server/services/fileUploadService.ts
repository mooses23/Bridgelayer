import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { Request } from 'express';
import path from 'path';
import fs from 'fs/promises';

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  },
});

export const documentUpload = upload.single('document');

export class FileParsingService {
  // Extract text from uploaded file based on mime type
  static async extractText(file: Express.Multer.File): Promise<string> {
    try {
      switch (file.mimetype) {
        case 'application/pdf':
          return await this.extractPdfText(file.buffer);
          
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await this.extractDocxText(file.buffer);
          
        case 'text/plain':
          return file.buffer.toString('utf-8');
          
        default:
          throw new Error(`Unsupported file type: ${file.mimetype}`);
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error(`Failed to extract text from ${file.originalname}: ${(error as Error).message}`);
    }
  }

  // Extract text from PDF buffer
  private static async extractPdfText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text.trim();
    } catch (error) {
      throw new Error('Failed to parse PDF file. The file may be corrupted or password-protected.');
    }
  }

  // Extract text from DOCX buffer
  private static async extractDocxText(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    } catch (error) {
      throw new Error('Failed to parse DOCX file. The file may be corrupted.');
    }
  }

  // Validate extracted text
  static validateExtractedText(text: string, fileName: string): void {
    if (!text || text.trim().length === 0) {
      throw new Error(`No text could be extracted from ${fileName}. The file may be empty or unreadable.`);
    }

    if (text.length < 50) {
      console.warn(`Warning: Extracted text from ${fileName} is very short (${text.length} characters)`);
    }

    if (text.length > 500000) { // 500KB of text
      console.warn(`Warning: Extracted text from ${fileName} is very large (${text.length} characters)`);
    }
  }

  // Clean and normalize extracted text
  static cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that might interfere with LLM processing
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Trim
      .trim();
  }

  // Get file type from buffer (fallback detection)
  static getFileTypeFromBuffer(buffer: Buffer): string {
    // PDF signature
    if (buffer.subarray(0, 4).toString() === '%PDF') {
      return 'application/pdf';
    }
    
    // DOCX signature (ZIP-based)
    if (buffer.subarray(0, 2).toString('hex') === '504b') {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    // Try to detect as text (simple check)
    const sample = buffer.subarray(0, 1000).toString('utf-8', 0, 100);
    if (/^[\x20-\x7E\s]*$/.test(sample)) {
      return 'text/plain';
    }
    
    return 'unknown';
  }

  // Process uploaded file and return extracted text with metadata
  static async processUploadedFile(file: Express.Multer.File): Promise<{
    text: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    wordCount: number;
    characterCount: number;
  }> {
    // Extract text
    const rawText = await this.extractText(file);
    
    // Validate text
    this.validateExtractedText(rawText, file.originalname);
    
    // Clean text
    const cleanedText = this.cleanText(rawText);
    
    // Calculate metadata
    const wordCount = cleanedText.split(/\s+/).filter(word => word.length > 0).length;
    
    return {
      text: cleanedText,
      fileName: file.filename || file.originalname,
      originalName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      wordCount,
      characterCount: cleanedText.length,
    };
  }
}

// Error handling middleware for file uploads
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 10MB',
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: error.message,
    });
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only PDF, DOCX, DOC, and TXT files are allowed',
    });
  }
  
  next(error);
};
