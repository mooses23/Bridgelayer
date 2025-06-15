import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { assemblePrompt, loadDocumentConfig } from '../../shared/assemblePrompt.js';
import { detectDocumentType } from './documentTypeDetection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DocumentMetadata {
  doc_type: string;
  uploaded_by: string;
  timestamp: string;
  features_enabled: string[];
  assigned_reviewer: string;
  filename: string;
  file_size: number;
  auto_detected: boolean;
}

interface ProcessedDocument {
  metadata: DocumentMetadata;
  promptPath: string;
  metaPath: string;
}

/**
 * Processes uploaded document and generates prompt routing files
 */
export async function processDocumentUpload(
  firmId: string,
  filename: string,
  content: string,
  fileSize: number,
  uploadedBy: string,
  selectedDocType?: string
): Promise<ProcessedDocument> {
  
  // Determine document type (user selection or auto-detection)
  let docType = selectedDocType;
  let autoDetected = false;
  
  if (!docType) {
    const detected = detectDocumentType(content);
    docType = detected || 'contract';
    autoDetected = true;
  }
  
  // Load document configuration
  const config = loadDocumentConfig(docType);
  
  // Generate the assembled prompt
  const assembledPrompt = assemblePrompt(docType, config);
  
  // Create metadata
  const metadata: DocumentMetadata = {
    doc_type: docType,
    uploaded_by: uploadedBy,
    timestamp: new Date().toISOString(),
    features_enabled: getEnabledFeatures(config),
    assigned_reviewer: getAssignedReviewer(docType),
    filename: filename,
    file_size: fileSize,
    auto_detected: autoDetected
  };
  
  // Ensure firm directories exist
  const firmDir = path.join(process.cwd(), 'firms', firmId);
  const filesDir = path.join(firmDir, 'files');
  const reviewLogsDir = path.join(firmDir, 'review_logs');
  
  await ensureDirectoryExists(filesDir);
  await ensureDirectoryExists(reviewLogsDir);
  
  // Generate file paths
  const baseFilename = path.parse(filename).name;
  const promptPath = path.join(reviewLogsDir, `${baseFilename}_prompt.txt`);
  const metaPath = path.join(reviewLogsDir, `${baseFilename}_meta.json`);
  const documentPath = path.join(filesDir, filename);
  
  // Save files
  await fs.promises.writeFile(promptPath, assembledPrompt, 'utf-8');
  await fs.promises.writeFile(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
  await fs.promises.writeFile(documentPath, content, 'utf-8');
  
  return {
    metadata,
    promptPath,
    metaPath
  };
}

/**
 * Gets enabled features from configuration
 */
function getEnabledFeatures(config: any): string[] {
  const features: string[] = [];
  
  if (config.summarize) features.push('summarize');
  if (config.risk) features.push('risk');
  if (config.clauses) features.push('clauses');
  if (config.crossref) features.push('crossref');
  if (config.formatting) features.push('formatting');
  
  return features;
}

/**
 * Gets assigned reviewer based on document type
 */
function getAssignedReviewer(docType: string): string {
  try {
    const configPath = path.join(__dirname, '../../shared/filetypes', `${docType.toLowerCase()}.json`);
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    return config.reviewerRole || 'paralegal';
  } catch (error) {
    // Default reviewer if config not found
    return 'paralegal';
  }
}

/**
 * Ensures directory exists, creates if not
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.promises.access(dirPath);
  } catch (error) {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Gets list of processed documents for a firm
 */
export async function getFirmProcessedDocuments(firmId: string): Promise<DocumentMetadata[]> {
  const reviewLogsDir = path.join(process.cwd(), 'firms', firmId, 'review_logs');
  
  try {
    const files = await fs.promises.readdir(reviewLogsDir);
    const metaFiles = files.filter(file => file.endsWith('_meta.json'));
    
    const documents: DocumentMetadata[] = [];
    
    for (const metaFile of metaFiles) {
      try {
        const metaPath = path.join(reviewLogsDir, metaFile);
        const metaContent = await fs.promises.readFile(metaPath, 'utf-8');
        const metadata = JSON.parse(metaContent);
        documents.push(metadata);
      } catch (error) {
        console.warn(`Failed to read metadata file: ${metaFile}`, error);
      }
    }
    
    // Sort by timestamp, newest first
    return documents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
  } catch (error) {
    console.warn(`Failed to read review logs directory for firm ${firmId}:`, error);
    return [];
  }
}