
import express from "express";
import { StorageService } from "../services/storageService";
import { getTenantIdFromRequest } from "../utils/tenant";
import { requireAuth } from "../auth/middleware/auth-middleware";

const router = express.Router();

// List files from active storage provider
router.get("/files", requireAuth, async (req, res) => {
  try {
    const tenantId = getTenantIdFromRequest(req);
    const { path } = req.query;
    
    const activeProvider = await StorageService.getActiveProvider(tenantId);
    
    if (!activeProvider) {
      return res.status(404).json({ error: 'No storage provider configured' });
    }
    
    const files = await StorageService.listFiles(
      tenantId, 
      activeProvider as 'google' | 'dropbox' | 'onedrive',
      path as string
    );
    
    res.json({ files, provider: activeProvider });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Get signed download URL (expires after use)
router.get("/download/:fileId", requireAuth, async (req, res) => {
  try {
    const tenantId = getTenantIdFromRequest(req);
    const { fileId } = req.params;
    
    const activeProvider = await StorageService.getActiveProvider(tenantId);
    
    if (!activeProvider) {
      return res.status(404).json({ error: 'No storage provider configured' });
    }
    
    const downloadUrl = await StorageService.getSignedDownloadUrl(
      tenantId,
      activeProvider as 'google' | 'dropbox' | 'onedrive',
      fileId
    );
    
    // Return the signed URL with expiration info
    res.json({ 
      downloadUrl,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      fileId
    });
  } catch (error) {
    console.error('Get download URL error:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

// Proxy endpoint for Google Drive downloads (since they don't provide signed URLs)
router.get("/google/download/:fileId", requireAuth, async (req, res) => {
  try {
    const tenantId = getTenantIdFromRequest(req);
    const { fileId } = req.params;
    
    // Verify tenant has Google Drive access
    const activeProvider = await StorageService.getActiveProvider(tenantId);
    if (activeProvider !== 'google') {
      return res.status(403).json({ error: 'Google Drive not configured for this tenant' });
    }
    
    // This would stream the file directly from Google Drive
    // Implementation would use the Google Drive API to pipe the file
    res.status(501).json({ error: 'Google Drive proxy download not yet implemented' });
  } catch (error) {
    console.error('Google Drive download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Get storage provider status
router.get("/status", requireAuth, async (req, res) => {
  try {
    const tenantId = getTenantIdFromRequest(req);
    const activeProvider = await StorageService.getActiveProvider(tenantId);
    
    res.json({ 
      hasStorage: !!activeProvider,
      activeProvider: activeProvider || null
    });
  } catch (error) {
    console.error('Storage status error:', error);
    res.status(500).json({ error: 'Failed to get storage status' });
  }
});

export default router;
