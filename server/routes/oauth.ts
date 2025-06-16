
import express from "express";
import { google } from "googleapis";
import { Dropbox } from "dropbox";
import { getOneDriveAuthUrl, exchangeOneDriveCode, refreshOneDriveToken } from "../utils/onedrive";
import { encrypt, decrypt } from "../utils/encryption";
import { db } from "../db";
import { getTenantIdFromRequest } from "../utils/tenant";
import { firms, firmSettings } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// Google Drive OAuth
router.get("/oauth/google/start", (req, res) => {
  try {
    const tenantId = getTenantIdFromRequest(req);
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL || 'http://0.0.0.0:5000'}/api/oauth/google/callback`
    );
    
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/drive.file"],
      state: tenantId,
    });
    
    res.redirect(url);
  } catch (error) {
    console.error('Google OAuth start error:', error);
    res.status(500).json({ error: 'Failed to start Google OAuth' });
  }
});

router.get("/oauth/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query; // state = tenantId
    
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL || 'http://0.0.0.0:5000'}/api/oauth/google/callback`
    );
    
    const { tokens } = await oauth2Client.getToken(code as string);
    
    // Find firm by tenant ID (subdomain)
    const [firm] = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, state as string))
      .limit(1);
    
    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }
    
    // Update or create firm settings with encrypted tokens
    const existingSettings = await db
      .select()
      .from(firmSettings)
      .where(eq(firmSettings.firmId, firm.id))
      .limit(1);
    
    const oauthTokens = existingSettings[0]?.oauthTokens ? 
      JSON.parse(existingSettings[0].oauthTokens) : {};
    
    oauthTokens.google = encrypt(JSON.stringify(tokens));
    
    if (existingSettings.length > 0) {
      await db
        .update(firmSettings)
        .set({
          storageProvider: 'google',
          oauthTokens: JSON.stringify(oauthTokens),
          updatedAt: new Date()
        })
        .where(eq(firmSettings.firmId, firm.id));
    } else {
      await db
        .insert(firmSettings)
        .values({
          firmId: firm.id,
          storageProvider: 'google',
          oauthTokens: JSON.stringify(oauthTokens),
          apiKeys: '{}',
          features: '{}',
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    res.redirect(`/dashboard?connected=google&tenant=${state}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});

// Dropbox OAuth
router.get("/oauth/dropbox/start", (req, res) => {
  try {
    const tenantId = getTenantIdFromRequest(req);
    const dbx = new Dropbox({ 
      clientId: process.env.DROPBOX_CLIENT_ID,
      fetch: fetch
    });
    
    const url = dbx.getAuthenticationUrl(
      `${process.env.BACKEND_URL || 'http://0.0.0.0:5000'}/api/oauth/dropbox/callback`,
      tenantId,
      "code",
      "offline",
      undefined,
      "none",
      false
    );
    
    res.redirect(url);
  } catch (error) {
    console.error('Dropbox OAuth start error:', error);
    res.status(500).json({ error: 'Failed to start Dropbox OAuth' });
  }
});

router.get("/oauth/dropbox/callback", async (req, res) => {
  try {
    const { code, state } = req.query; // state = tenantId
    
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }
    
    const dbx = new Dropbox({ 
      clientId: process.env.DROPBOX_CLIENT_ID, 
      clientSecret: process.env.DROPBOX_CLIENT_SECRET,
      fetch: fetch
    });
    
    const tokenRes = await dbx.auth.getAccessTokenFromCode(
      `${process.env.BACKEND_URL || 'http://0.0.0.0:5000'}/api/oauth/dropbox/callback`, 
      code as string
    );
    
    // Find firm by tenant ID (subdomain)
    const [firm] = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, state as string))
      .limit(1);
    
    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }
    
    // Update or create firm settings with encrypted tokens
    const existingSettings = await db
      .select()
      .from(firmSettings)
      .where(eq(firmSettings.firmId, firm.id))
      .limit(1);
    
    const oauthTokens = existingSettings[0]?.oauthTokens ? 
      JSON.parse(existingSettings[0].oauthTokens) : {};
    
    oauthTokens.dropbox = encrypt(JSON.stringify(tokenRes.result));
    
    if (existingSettings.length > 0) {
      await db
        .update(firmSettings)
        .set({
          storageProvider: 'dropbox',
          oauthTokens: JSON.stringify(oauthTokens),
          updatedAt: new Date()
        })
        .where(eq(firmSettings.firmId, firm.id));
    } else {
      await db
        .insert(firmSettings)
        .values({
          firmId: firm.id,
          storageProvider: 'dropbox',
          oauthTokens: JSON.stringify(oauthTokens),
          apiKeys: '{}',
          features: '{}',
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    res.redirect(`/dashboard?connected=dropbox&tenant=${state}`);
  } catch (error) {
    console.error('Dropbox OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});

// OneDrive OAuth
router.get("/oauth/onedrive/start", (req, res) => {
  try {
    const tenantId = getTenantIdFromRequest(req);
    const url = getOneDriveAuthUrl(tenantId);
    res.redirect(url);
  } catch (error) {
    console.error('OneDrive OAuth start error:', error);
    res.status(500).json({ error: 'Failed to start OneDrive OAuth' });
  }
});

router.get("/oauth/onedrive/callback", async (req, res) => {
  try {
    const { code, state } = req.query; // state = tenantId
    
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }
    
    const tokenData = await exchangeOneDriveCode(code as string);
    
    // Find firm by tenant ID (subdomain)
    const [firm] = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, state as string))
      .limit(1);
    
    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }
    
    // Update or create firm settings with encrypted tokens
    const existingSettings = await db
      .select()
      .from(firmSettings)
      .where(eq(firmSettings.firmId, firm.id))
      .limit(1);
    
    const oauthTokens = existingSettings[0]?.oauthTokens ? 
      JSON.parse(existingSettings[0].oauthTokens) : {};
    
    oauthTokens.onedrive = encrypt(JSON.stringify(tokenData));
    
    if (existingSettings.length > 0) {
      await db
        .update(firmSettings)
        .set({
          storageProvider: 'onedrive',
          oauthTokens: JSON.stringify(oauthTokens),
          updatedAt: new Date()
        })
        .where(eq(firmSettings.firmId, firm.id));
    } else {
      await db
        .insert(firmSettings)
        .values({
          firmId: firm.id,
          storageProvider: 'onedrive',
          oauthTokens: JSON.stringify(oauthTokens),
          apiKeys: '{}',
          features: '{}',
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    res.redirect(`/dashboard?connected=onedrive&tenant=${state}`);
  } catch (error) {
    console.error('OneDrive OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});

// Token refresh endpoints
router.post("/oauth/google/refresh", async (req, res) => {
  try {
    const { tenantId } = req.body;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Missing tenantId' });
    }
    
    // Find firm and settings
    const [firm] = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, tenantId))
      .limit(1);
    
    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }
    
    const [settings] = await db
      .select()
      .from(firmSettings)
      .where(eq(firmSettings.firmId, firm.id))
      .limit(1);
    
    if (!settings?.oauthTokens) {
      return res.status(404).json({ error: 'No OAuth tokens found' });
    }
    
    const oauthTokens = JSON.parse(settings.oauthTokens);
    
    if (!oauthTokens.google) {
      return res.status(404).json({ error: 'No Google token found' });
    }
    
    const tokens = JSON.parse(decrypt(oauthTokens.google));
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL || 'http://0.0.0.0:5000'}/api/oauth/google/callback`
    );
    
    oauth2Client.setCredentials(tokens);
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Update stored tokens
    oauthTokens.google = encrypt(JSON.stringify(credentials));
    
    await db
      .update(firmSettings)
      .set({
        oauthTokens: JSON.stringify(oauthTokens),
        updatedAt: new Date()
      })
      .where(eq(firmSettings.firmId, firm.id));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Google token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

router.post("/oauth/onedrive/refresh", async (req, res) => {
  try {
    const { tenantId } = req.body;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Missing tenantId' });
    }
    
    // Find firm and settings
    const [firm] = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, tenantId))
      .limit(1);
    
    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }
    
    const [settings] = await db
      .select()
      .from(firmSettings)
      .where(eq(firmSettings.firmId, firm.id))
      .limit(1);
    
    if (!settings?.oauthTokens) {
      return res.status(404).json({ error: 'No OAuth tokens found' });
    }
    
    const oauthTokens = JSON.parse(settings.oauthTokens);
    
    if (!oauthTokens.onedrive) {
      return res.status(404).json({ error: 'No OneDrive token found' });
    }
    
    const tokens = JSON.parse(decrypt(oauthTokens.onedrive));
    const newTokens = await refreshOneDriveToken(tokens.refresh_token);
    
    // Update stored tokens
    oauthTokens.onedrive = encrypt(JSON.stringify(newTokens));
    
    await db
      .update(firmSettings)
      .set({
        oauthTokens: JSON.stringify(oauthTokens),
        updatedAt: new Date()
      })
      .where(eq(firmSettings.firmId, firm.id));
    
    res.json({ success: true });
  } catch (error) {
    console.error('OneDrive token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Get OAuth status for a tenant
router.get("/oauth/status/:tenantId", async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Find firm and settings
    const [firm] = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, tenantId))
      .limit(1);
    
    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }
    
    const [settings] = await db
      .select()
      .from(firmSettings)
      .where(eq(firmSettings.firmId, firm.id))
      .limit(1);
    
    const oauthTokens = settings?.oauthTokens ? JSON.parse(settings.oauthTokens) : {};
    
    const status = {
      google: !!oauthTokens.google,
      dropbox: !!oauthTokens.dropbox,
      onedrive: !!oauthTokens.onedrive,
      activeProvider: settings?.storageProvider || null
    };
    
    res.json(status);
  } catch (error) {
    console.error('OAuth status error:', error);
    res.status(500).json({ error: 'Failed to get OAuth status' });
  }
});

export default router;
