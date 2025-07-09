import { HybridAuthRepository, User } from '../repositories/hybrid-auth.repository';
import { FirmRepository } from '../repositories/firm.repository';
import { ValidationError } from '../middleware/validation.middleware';
import { AuditService } from './audit.service';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { NotFoundError, AuthenticationError } from '../utils/errors';

/**
 * Service for Hybrid Authentication operations
 */
export class HybridAuthService {
  private repository: HybridAuthRepository;
  private firmRepository: FirmRepository;
  private auditService: AuditService;
  private googleClient: OAuth2Client;
  
  private JWT_SECRET: string;
  private JWT_EXPIRES_IN: string;
  private REFRESH_EXPIRES_IN: string;
  private isProduction: boolean;

  constructor() {
    this.repository = new HybridAuthRepository();
    this.firmRepository = new FirmRepository();
    this.auditService = new AuditService();

    this.JWT_SECRET = process.env.JWT_SECRET || 'firmsync-jwt-secret-change-in-production';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
    this.REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    this.isProduction = process.env.NODE_ENV === 'production';

    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(user: User, tenantId?: string): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        firmId: user.firmId,
        ...(tenantId && { tenantId }),
        type: 'access'
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  /**
   * Generate refresh token and store hashed version
   */
  async generateRefreshToken(user: User): Promise<{
    refreshToken: string;
    expiresAt: Date;
  }> {
    // Generate a secure random token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    
    // Calculate expiration date
    const expiresAt = new Date();
    const days = parseInt(this.REFRESH_EXPIRES_IN) || 7;
    expiresAt.setDate(expiresAt.getDate() + days);
    
    // Store hashed token in database
    await this.repository.storeRefreshToken(user.id, hashedRefreshToken, expiresAt);
    
    return {
      refreshToken,
      expiresAt
    };
  }

  /**
   * Get token cookie options
   */
  getTokenCookieOptions(isRefreshToken = false) {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: isRefreshToken
        ? 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token
        : 15 * 60 * 1000 // 15 minutes for access token
    };
  }

  /**
   * Login a user
   */
  async login(email: string, password: string, mode: 'bridgelayer' | 'firm'): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    redirect: string;
  }> {
    // Find user by email
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new ValidationError({ email: ['Invalid email or password'] });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      this.auditService.log('auth:login:failed', { email, reason: 'invalid_password' });
      throw new ValidationError({ password: ['Invalid email or password'] });
    }

    // Mode-specific validation
    if (mode === 'bridgelayer' && user.role !== 'admin' && user.role !== 'platform_admin' && user.role !== 'super_admin') {
      this.auditService.log('auth:login:failed', { email, reason: 'insufficient_permissions' });
      throw new ValidationError({ mode: ['This account cannot access BridgeLayer platform'] });
    }

    if (mode === 'firm' && user.firmId === null) {
      this.auditService.log('auth:login:failed', { email, reason: 'no_firm_association' });
      throw new ValidationError({ mode: ['This account is not associated with any firm'] });
    }

    // Check if firm is active (for firm users)
    if (mode === 'firm' && user.firmId) {
      const firm = await this.firmRepository.findById(user.firmId);
      if (!firm || firm.status !== 'active') {
        this.auditService.log('auth:login:failed', { email, reason: 'inactive_firm' });
        throw new ValidationError({ mode: ['This firm account is not active'] });
      }
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const { refreshToken, expiresAt } = await this.generateRefreshToken(user);
    
    // Update last login timestamp
    await this.repository.updateLastLogin(user.id);

    // Determine redirect path
    const redirect = this.getRedirectPath(user, mode);

    // Log successful login
    this.auditService.log('auth:login:success', { 
      userId: user.id,
      email: user.email,
      mode
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firmId: user.firmId
      },
      accessToken,
      refreshToken,
      expiresAt,
      redirect
    };
  }

  /**
   * Refresh a token
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    // Find token in database
    const token = await this.repository.findRefreshToken(refreshToken);
    if (!token) {
      throw new ValidationError({ refreshToken: ['Invalid or expired refresh token'] });
    }

    // Get user data
    const user = await this.repository.findUserById(token.userId);
    if (!user) {
      // If user doesn't exist, revoke the token
      await this.repository.revokeRefreshToken(token.id);
      throw new ValidationError({ refreshToken: ['User not found'] });
    }

    // Generate new tokens
    const accessToken = this.generateAccessToken(user);
    const { refreshToken: newRefreshToken, expiresAt } = await this.generateRefreshToken(user);
    
    // Revoke old token
    await this.repository.revokeRefreshToken(token.id);
    
    // Log token refresh
    this.auditService.log('auth:token:refreshed', { 
      userId: user.id
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt
    };
  }

  /**
   * Logout a user
   */
  async logout(refreshToken: string): Promise<boolean> {
    if (!refreshToken) {
      return false;
    }
    
    // Find token in database
    const token = await this.repository.findRefreshToken(refreshToken);
    if (!token) {
      return false;
    }
    
    // Revoke the token
    await this.repository.revokeRefreshToken(token.id);
    
    // Log logout
    this.auditService.log('auth:logout', { 
      userId: token.userId
    });
    
    return true;
  }

  /**
   * Handle OAuth login flow
   */
  async oauthLogin(provider: string, code: string): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    isNewUser: boolean;
    redirect: string;
  }> {
    let userInfo;
    
    // Verify token with provider
    switch (provider) {
      case 'google':
        userInfo = await this.verifyGoogleToken(code);
        break;
      default:
        throw new ValidationError({ provider: [`Unsupported provider: ${provider}`] });
    }
    
    if (!userInfo || !userInfo.email) {
      throw new ValidationError({ code: ['Invalid OAuth authorization code'] });
    }
    
    // Find or create user
    let user = await this.repository.findUserByEmail(userInfo.email);
    let isNewUser = false;
    
    if (!user) {
      // Try to find by OAuth provider ID
      user = await this.repository.findUserByOAuth(provider, userInfo.id);
    }
    
    if (!user) {
      // Create new user
      user = await this.repository.createOAuthUser({
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        oauthProvider: provider,
        oauthId: userInfo.id,
        role: 'user' // Default role for OAuth users
      });
      isNewUser = true;
    }
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const { refreshToken, expiresAt } = await this.generateRefreshToken(user);
    
    // Update last login timestamp
    await this.repository.updateLastLogin(user.id);
    
    // Determine redirect path (always use firm mode for OAuth logins)
    const redirect = this.getRedirectPath(user, 'firm');
    
    // Log successful login
    this.auditService.log('auth:oauth:success', { 
      userId: user.id,
      email: user.email,
      provider,
      isNewUser
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firmId: user.firmId
      },
      accessToken,
      refreshToken,
      expiresAt,
      isNewUser,
      redirect
    };
  }

  /**
   * Verify Google OAuth token
   */
  private async verifyGoogleToken(code: string): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }> {
    try {
      const { tokens } = await this.googleClient.getToken(code);
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('No payload in ID token');
      }
      
      return {
        id: payload.sub,
        email: payload.email!,
        firstName: payload.given_name || '',
        lastName: payload.family_name || ''
      };
    } catch (error) {
      console.error('Google token verification error:', error);
      throw new ValidationError({ code: ['Failed to verify Google token'] });
    }
  }

  /**
   * Get redirect path based on user role and mode
   */
  private getRedirectPath(user: User, mode: 'bridgelayer' | 'firm'): string {
    if (mode === 'bridgelayer') {
      if (user.role === 'super_admin' || user.role === 'platform_admin') {
        return '/admin/platform';
      }
      return '/admin';
    }
    
    // Firm mode
    if (user.firmId) {
      // Check if onboarding is complete
      return '/dashboard'; // You can add onboarding check here
    }
    
    return '/dashboard';
  }

  /**
   * Authenticate user with email and password
   */
  async authenticate(email: string, password: string, tenantId: string): Promise<User> {
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new NotFoundError(`User with email ${email} not found`);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    return user;
  }

  /**
   * Authenticate user with OAuth provider
   */
  async authenticateOAuth(provider: string, oauthId: string, tenantId: string): Promise<User> {
    const user = await this.repository.findUserByOAuth(provider, oauthId);
    if (!user) {
      throw new NotFoundError(`OAuth user not found for provider ${provider}`);
    }

    return user;
  }
}
