import { Router } from 'express';
import { OAuthManager } from '../oauth/oauth-manager';
import { requireAuth } from '../middleware/auth';

const router = Router();
const oauthManager = new OAuthManager();

// Initialize OAuth flow
router.get(
  '/oauth/:provider/start',
  requireAuth,
  async (req, res) => {
    await oauthManager.initiateOAuth(req, res, req.params.provider);
  }
);

// Handle OAuth callback
router.get(
  '/oauth/:provider/callback',
  async (req, res) => {
    await oauthManager.handleCallback(req, res, req.params.provider);
  }
);

// Refresh OAuth tokens
router.post(
  '/oauth/:provider/refresh',
  requireAuth,
  async (req, res) => {
    try {
      const { tenantId } = req.body;
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      await oauthManager.refreshTokens(tenantId, req.params.provider);
      res.json({ success: true });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        error: 'Token refresh failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Revoke OAuth access
router.post(
  '/oauth/:provider/revoke',
  requireAuth,
  async (req, res) => {
    try {
      const { tenantId } = req.body;
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      await oauthManager.revokeAccess(tenantId, req.params.provider);
      res.json({ success: true });
    } catch (error) {
      console.error('Access revocation error:', error);
      res.status(500).json({
        error: 'Access revocation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get OAuth integration status
router.get(
  '/oauth/status',
  requireAuth,
  async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string;
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      const status = await oauthManager.getIntegrationStatus(tenantId);
      res.json(status);
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({
        error: 'Failed to get integration status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
