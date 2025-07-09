import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { EncryptionService } from './encryption.service';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

/**
 * Storage Service for handling file operations
 */
export class StorageService {
  private encryptionService: EncryptionService;
  private basePath: string;

  constructor() {
    this.encryptionService = new EncryptionService();
    this.basePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'uploads');
  }

  /**
   * Upload a file to storage
   */
  async uploadFile(file: Express.Multer.File | any, fileName: string, folder: string = 'default'): Promise<string> {
    try {
      // Ensure directory exists
      const dirPath = path.join(this.basePath, folder);
      await this.ensureDirectory(dirPath);

      // Generate unique file name with original extension
      let ext = '';
      if (file.originalname) {
        ext = path.extname(file.originalname);
      } else if (file.name) {
        ext = path.extname(file.name);
      }
      
      const uniqueFileName = `${fileName}${ext}`;
      const filePath = path.join(dirPath, uniqueFileName);

      // Get file buffer
      const buffer = file.buffer || file.data || await this.fileToBuffer(file.path);

      // Write file
      await writeFile(filePath, buffer);

      // Return path relative to base
      return `/uploads/${folder}/${uniqueFileName}`;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Download a file from storage
   */
  async getFile(filePath: string): Promise<Buffer> {
    try {
      const fullPath = path.join(this.basePath, filePath.replace(/^\/uploads\//, ''));
      return await readFile(fullPath);
    } catch (error) {
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, filePath.replace(/^\/uploads\//, ''));
      await promisify(fs.unlink)(fullPath);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Upload encrypted content (for sensitive files)
   */
  async uploadEncryptedContent(content: string, fileName: string, folder: string = 'encrypted'): Promise<string> {
    try {
      // Encrypt the content
      const encryptedContent = await this.encryptionService.encrypt(content);

      // Ensure directory exists
      const dirPath = path.join(this.basePath, folder);
      await this.ensureDirectory(dirPath);

      // Write encrypted file
      const filePath = path.join(dirPath, fileName);
      await writeFile(filePath, encryptedContent);

      // Return path relative to base
      return `/uploads/${folder}/${fileName}`;
    } catch (error) {
      throw new Error(`Failed to upload encrypted content: ${error.message}`);
    }
  }

  /**
   * Get decrypted content
   */
  async getDecryptedContent(filePath: string): Promise<string> {
    try {
      const fullPath = path.join(this.basePath, filePath.replace(/^\/uploads\//, ''));
      const encryptedContent = await readFile(fullPath, 'utf8');
      return await this.encryptionService.decrypt(encryptedContent);
    } catch (error) {
      throw new Error(`Failed to get decrypted content: ${error.message}`);
    }
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Convert file to buffer
   */
  private async fileToBuffer(filePath: string): Promise<Buffer> {
    return await readFile(filePath);
  }
}

// Export a singleton instance
export const storageService = new StorageService();
