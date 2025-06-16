
import { google } from "googleapis";
import { Dropbox } from "dropbox";
import axios from "axios";
import { db } from "../db";
import { firms, firmSettings } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "../utils/encryption";
import { refreshOneDriveToken } from "../utils/onedrive";

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  modifiedTime: string;
  downloadUrl?: string;
}

export interface SignedUploadUrl {
  uploadUrl: string;
  fileId: string;
  expiresAt: Date;
}

export class StorageService {
  private static async getProviderTokens(tenantId: string, provider: 'google' | 'dropbox' | 'onedrive') {
    const [firm] = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, tenantId))
      .limit(1);

    if (!firm) {
      throw new Error('Firm not found');
    }

    const [settings] = await db
      .select()
      .from(firmSettings)
      .where(eq(firmSettings.firmId, firm.id))
      .limit(1);

    if (!settings?.oauthTokens) {
      throw new Error('No OAuth tokens found');
    }

    const oauthTokens = JSON.parse(settings.oauthTokens);
    
    if (!oauthTokens[provider]) {
      throw new Error(`No ${provider} token found`);
    }

    return {
      tokens: JSON.parse(decrypt(oauthTokens[provider])),
      firm,
      settings
    };
  }

  // Google Drive Methods
  private static async getGoogleDriveClient(tenantId: string) {
    const { tokens } = await this.getProviderTokens(tenantId, 'google');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/oauth/google/callback`
    );
    
    oauth2Client.setCredentials(tokens);
    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  static async listGoogleDriveFiles(tenantId: string, folderId?: string): Promise<FileMetadata[]> {
    const drive = await this.getGoogleDriveClient(tenantId);
    
    const response = await drive.files.list({
      q: folderId ? `'${folderId}' in parents` : undefined,
      fields: 'files(id,name,size,mimeType,modifiedTime)',
      pageSize: 100
    });

    return response.data.files?.map(file => ({
      id: file.id!,
      name: file.name!,
      size: parseInt(file.size || '0'),
      mimeType: file.mimeType!,
      modifiedTime: file.modifiedTime!
    })) || [];
  }

  static async getGoogleDriveSignedDownloadUrl(tenantId: string, fileId: string): Promise<string> {
    const drive = await this.getGoogleDriveClient(tenantId);
    
    // For Google Drive, we generate a temporary access URL
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'stream' });
    
    // Google Drive doesn't provide signed URLs like S3, so we create a proxy endpoint
    return `/api/storage/google/download/${fileId}?tenant=${tenantId}`;
  }

  static async generateGoogleDriveUploadUrl(tenantId: string, fileName: string, mimeType: string): Promise<SignedUploadUrl> {
    // Google Drive uses resumable uploads - we'll create a session
    const drive = await this.getGoogleDriveClient(tenantId);
    
    const response = await drive.files.create({
      requestBody: {
        name: fileName
      },
      media: {
        mimeType
      }
    });

    return {
      uploadUrl: `/api/storage/google/upload?tenant=${tenantId}`,
      fileId: response.data.id!,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    };
  }

  // Dropbox Methods
  private static async getDropboxClient(tenantId: string) {
    const { tokens } = await this.getProviderTokens(tenantId, 'dropbox');
    
    return new Dropbox({ 
      accessToken: tokens.access_token,
      fetch: fetch
    });
  }

  static async listDropboxFiles(tenantId: string, path: string = ''): Promise<FileMetadata[]> {
    const dbx = await this.getDropboxClient(tenantId);
    
    const response = await dbx.filesListFolder({ path });
    
    return response.result.entries
      .filter(entry => entry['.tag'] === 'file')
      .map(file => ({
        id: file.id!,
        name: file.name,
        size: (file as any).size || 0,
        mimeType: 'application/octet-stream', // Dropbox doesn't provide MIME types
        modifiedTime: (file as any).client_modified || new Date().toISOString()
      }));
  }

  static async getDropboxSignedDownloadUrl(tenantId: string, path: string): Promise<string> {
    const dbx = await this.getDropboxClient(tenantId);
    
    const response = await dbx.filesGetTemporaryLink({ path });
    return response.result.link;
  }

  // OneDrive Methods
  private static async getOneDriveHeaders(tenantId: string) {
    const { tokens } = await this.getProviderTokens(tenantId, 'onedrive');
    
    return {
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json'
    };
  }

  static async listOneDriveFiles(tenantId: string, folderId?: string): Promise<FileMetadata[]> {
    const headers = await this.getOneDriveHeaders(tenantId);
    
    const url = folderId 
      ? `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`
      : 'https://graph.microsoft.com/v1.0/me/drive/root/children';
    
    const response = await axios.get(url, { headers });
    
    return response.data.value
      .filter((item: any) => item.file) // Only files, not folders
      .map((file: any) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        mimeType: file.file.mimeType,
        modifiedTime: file.lastModifiedDateTime
      }));
  }

  static async getOneDriveSignedDownloadUrl(tenantId: string, fileId: string): Promise<string> {
    const headers = await this.getOneDriveHeaders(tenantId);
    
    const response = await axios.get(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
      { headers }
    );
    
    return response.data['@microsoft.graph.downloadUrl'];
  }

  // Unified Methods
  static async listFiles(tenantId: string, provider: 'google' | 'dropbox' | 'onedrive', path?: string): Promise<FileMetadata[]> {
    switch (provider) {
      case 'google':
        return this.listGoogleDriveFiles(tenantId, path);
      case 'dropbox':
        return this.listDropboxFiles(tenantId, path || '');
      case 'onedrive':
        return this.listOneDriveFiles(tenantId, path);
      default:
        throw new Error('Unsupported provider');
    }
  }

  static async getSignedDownloadUrl(tenantId: string, provider: 'google' | 'dropbox' | 'onedrive', fileId: string): Promise<string> {
    switch (provider) {
      case 'google':
        return this.getGoogleDriveSignedDownloadUrl(tenantId, fileId);
      case 'dropbox':
        return this.getDropboxSignedDownloadUrl(tenantId, fileId);
      case 'onedrive':
        return this.getOneDriveSignedDownloadUrl(tenantId, fileId);
      default:
        throw new Error('Unsupported provider');
    }
  }

  static async getActiveProvider(tenantId: string): Promise<string | null> {
    const [firm] = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, tenantId))
      .limit(1);

    if (!firm) return null;

    const [settings] = await db
      .select()
      .from(firmSettings)
      .where(eq(firmSettings.firmId, firm.id))
      .limit(1);

    return settings?.storageProvider || null;
  }
}
