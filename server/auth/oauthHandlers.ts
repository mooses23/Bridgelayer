import { Request, Response } from 'express';
import { JWTUtils } from './jwtUtils';
import { storage } from '../storage';
import { auditLogger } from '../services/auditLogger';

interface OAuthProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  provider: 'google' | 'microsoft' | 'dropbox';
  picture?: string;
}

export class OAuthHandlers {
  /**
   * Handle Google OAuth2 callback
   */
  static async handleGoogleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.query;
      
      if (!code) {
        res.status(400).json({ error: 'Authorization code missing' });
        return;
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/google/callback`
        })
      });

      const tokens = await tokenResponse.json();
      
      if (!tokens.access_token) {
        res.status(400).json({ error: 'Failed to obtain access token' });
        return;
      }

      // Get user profile
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });

      const profile = await profileResponse.json();

      const oauthProfile: OAuthProfile = {
        id: profile.id,
        email: profile.email,
        firstName: profile.given_name || '',
        lastName: profile.family_name || '',
        provider: 'google',
        picture: profile.picture
      };

      await this.processOAuthLogin(req, res, oauthProfile);
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.status(500).json({ error: 'OAuth authentication failed' });
    }
  }

  /**
   * Handle Microsoft OAuth2 callback
   */
  static async handleMicrosoftCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.query;
      
      if (!code) {
        res.status(400).json({ error: 'Authorization code missing' });
        return;
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/microsoft/callback`,
          scope: 'https://graph.microsoft.com/user.read'
        })
      });

      const tokens = await tokenResponse.json();
      
      if (!tokens.access_token) {
        res.status(400).json({ error: 'Failed to obtain access token' });
        return;
      }

      // Get user profile
      const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });

      const profile = await profileResponse.json();

      const oauthProfile: OAuthProfile = {
        id: profile.id,
        email: profile.mail || profile.userPrincipalName,
        firstName: profile.givenName || '',
        lastName: profile.surname || '',
        provider: 'microsoft'
      };

      await this.processOAuthLogin(req, res, oauthProfile);
    } catch (error) {
      console.error('Microsoft OAuth error:', error);
      res.status(500).json({ error: 'OAuth authentication failed' });
    }
  }

  /**
   * Process OAuth login and create JWT tokens
   */
  private static async processOAuthLogin(req: Request, res: Response, profile: OAuthProfile): Promise<void> {
    try {
      // Extract tenant from subdomain or request
      const tenantId = JWTUtils.extractTenantFromRequest(req) || 'default';
      
      // Find or create user
      let user = await storage.getUserByEmail(profile.email);
      
      if (!user) {
        // Auto-provision user for SSO
        const firm = await storage.getFirmBySlug(tenantId);
        if (!firm) {
          res.status(400).json({ 
            error: 'Invalid tenant',
            message: `No firm found for tenant: ${tenantId}`
          });
          return;
        }

        user = await storage.createUser({
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: 'paralegal', // Default role for SSO users
          firmId: firm.id,
          password: '' // No password for SSO users
        });

        await auditLogger.logUserCreated(user.id, firm.id, 'oauth_sso', req.ip, req.get('User-Agent'));
      }

      // Verify user belongs to the correct tenant
      if (user.firmId) {
        const userFirm = await storage.getFirm(user.firmId);
        if (!userFirm || userFirm.slug !== tenantId) {
          res.status(403).json({
            error: 'Tenant mismatch',
            message: 'User does not belong to this tenant'
          });
          return;
        }
      }

      // Generate JWT tokens
      const accessToken = JWTUtils.generateAccessToken({
        userId: user.id,
        tenantId,
        role: user.role,
        email: user.email,
        firmId: user.firmId
      });

      const refreshToken = JWTUtils.generateRefreshToken({
        userId: user.id,
        tenantId,
        tokenVersion: 1 // TODO: implement token versioning in database
      });

      // Set secure cookies
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', accessToken, JWTUtils.getCookieOptions(isProduction));
      res.cookie('refreshToken', refreshToken, JWTUtils.getRefreshCookieOptions(isProduction));

      // Log successful login
      await auditLogger.logLogin(user.id, user.firmId, req.ip, req.get('User-Agent'));

      // Determine redirect path
      let redirectPath = '/dashboard';
      if (['platform_admin', 'admin', 'super_admin'].includes(user.role)) {
        redirectPath = '/admin';
      } else if (user.firmId) {
        const firm = await storage.getFirm(user.firmId);
        if (firm && !firm.onboarded) {
          redirectPath = '/onboarding';
        }
      }

      // Redirect to frontend with success
      res.redirect(`${redirectPath}?auth=success`);
    } catch (error) {
      console.error('OAuth processing error:', error);
      res.status(500).json({ error: 'Authentication processing failed' });
    }
  }

  /**
   * Initiate Google OAuth flow
   */
  static initiateGoogleAuth(req: Request, res: Response): void {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=email profile&` +
      `access_type=offline&` +
      `prompt=consent`;

    res.redirect(authUrl);
  }

  /**
   * Initiate Microsoft OAuth flow
   */
  static initiateMicrosoftAuth(req: Request, res: Response): void {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/microsoft/callback`;
    
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=https://graph.microsoft.com/user.read&` +
      `response_mode=query`;

    res.redirect(authUrl);
  }
}