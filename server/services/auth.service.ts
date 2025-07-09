import { ValidationError } from '../middleware/validation.middleware';
import { UserRepository, User } from '../repositories/user.repository';
import { PasswordService } from './password.service';
import { AuditService } from './audit.service';
import { refreshTokenService } from './refresh-token.service';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env';
import { NotFoundError, AuthenticationError } from '../utils/errors';
import { env } from '../config/env';

/**
 * Auth Service handles all authentication related business logic
 */
export class AuthService {
  private userRepository: UserRepository;
  private passwordService: PasswordService;
  private auditService: AuditService;

  constructor() {
    this.userRepository = new UserRepository();
    this.passwordService = new PasswordService();
    this.auditService = new AuditService();
  }

  /**
   * Authenticate a user by email and password
   */
  async login(email: string, password: string, mode?: string): Promise<{
    success: boolean;
    user?: Omit<User, 'passwordHash'>;
    token?: string;
    refreshToken?: string;
  }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      this.auditService.log('auth:login:failed', { email, reason: 'user_not_found' });
      throw new ValidationError({ email: ['Invalid credentials'] });
    }

    // Check password
    const isPasswordValid = await this.passwordService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      this.auditService.log('auth:login:failed', { userId: user.id, email, reason: 'invalid_password' });
      throw new ValidationError({ password: ['Invalid credentials'] });
    }

    // Check if user is of the correct role if mode is specified
    if (mode === 'admin' && user.role !== 'admin') {
      this.auditService.log('auth:login:failed', { userId: user.id, email, reason: 'unauthorized_role' });
      throw new ValidationError({ email: ['Unauthorized access'] });
    }

    // Update last login timestamp
    await this.userRepository.updateLastLogin(user.id);
    
    // Generate tokens
    const { token, refreshToken } = await this.generateTokens(user);

    this.auditService.log('auth:login:success', { userId: user.id, email });
    
    // Return user data and tokens
    const { passwordHash, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword,
      token,
      refreshToken
    };
  }

  /**
   * Admin-specific login
   */
  async adminLogin(email: string, password: string): Promise<{
    success: boolean;
    user?: Omit<User, 'passwordHash'>;
    token?: string;
    refreshToken?: string;
  }> {
    return this.login(email, password, 'admin');
  }

  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<{ 
    success: boolean;
    user?: Omit<User, 'passwordHash'>;
    token?: string;
    refreshToken?: string;
  }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      this.auditService.log('auth:register:failed', { email: userData.email, reason: 'email_in_use' });
      throw new ValidationError({ email: ['Email is already in use'] });
    }

    // Hash password
    const passwordHash = await this.passwordService.hashPassword(userData.password);

    // Create user
    const newUser = await this.userRepository.create({
      email: userData.email.toLowerCase(),
      passwordHash,
      role: (userData.role as any) || 'firm_user',
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: new Date()
    });

    // Generate tokens
    const { token, refreshToken } = await this.generateTokens(newUser);

    this.auditService.log('auth:register:success', { userId: newUser.id, email: newUser.email });

    // Return user data and tokens
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return {
      success: true,
      user: userWithoutPassword,
      token,
      refreshToken
    };
  }

  /**
   * Refresh an access token using a refresh token
   */
  async refreshToken(refreshTokenString: string): Promise<{
    success: boolean;
    token?: string;
    refreshToken?: string;
  }> {
    // Verify if refresh token exists and is valid
    const refreshTokenRecord = await refreshTokenService.findByToken(refreshTokenString);
    
    if (!refreshTokenRecord || refreshTokenRecord.revokedAt || new Date() > refreshTokenRecord.expiresAt) {
      this.auditService.log('auth:refreshToken:failed', { refreshToken: refreshTokenString, reason: 'invalid_token' });
      throw new ValidationError({ refreshToken: ['Invalid refresh token'] });
    }

    // Get user
    const user = await this.userRepository.findById(refreshTokenRecord.userId);
    if (!user) {
      this.auditService.log('auth:refreshToken:failed', { refreshToken: refreshTokenString, reason: 'user_not_found' });
      throw new ValidationError({ refreshToken: ['Invalid refresh token'] });
    }

    // Revoke the used refresh token
    await refreshTokenService.revokeToken(refreshTokenRecord.id);

    // Generate new tokens
    const { token, refreshToken } = await this.generateTokens(user);

    this.auditService.log('auth:refreshToken:success', { userId: user.id });

    return {
      success: true,
      token,
      refreshToken
    };
  }

  /**
   * Initiate password reset process
   */
  async initiatePasswordReset(email: string): Promise<{ success: boolean }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      // Don't reveal that the user doesn't exist
      return { success: true };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await this.passwordService.hashPassword(resetToken);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token (using custom method on user repository)
    await this.userRepository.setPasswordResetToken(user.id, resetTokenHash, expiresAt);

    // TODO: Send email with reset token
    // This would be handled by an email service

    this.auditService.log('auth:passwordReset:initiated', { userId: user.id, email });

    return { success: true };
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    // Find user by reset token
    // Note: This method needs to be implemented in the user repository
    const user = await this.userRepository.findByResetToken(token);
    
    if (!user || !user.resetTokenExpiresAt || new Date() > user.resetTokenExpiresAt) {
      this.auditService.log('auth:passwordReset:failed', { reason: 'invalid_token' });
      throw new ValidationError({ token: ['Invalid or expired token'] });
    }

    // Hash new password
    const passwordHash = await this.passwordService.hashPassword(newPassword);

    // Update password and clear reset token
    await this.userRepository.updatePassword(user.id, passwordHash);

    this.auditService.log('auth:passwordReset:completed', { userId: user.id });

    return { success: true };
  }

  /**
   * Logout user by revoking their refresh token
   */
  async logout(refreshTokenString: string): Promise<{ success: boolean }> {
    try {
      await refreshTokenService.revokeToken(refreshTokenString);
      this.auditService.log('auth:logout', { refreshToken: refreshTokenString });
      
      return { success: true };
    } catch (error) {
      // If token not found or already revoked, still consider logout successful
      if (error instanceof NotFoundError) {
        return { success: true };
      }
      throw error;
    }
  }

  /**
   * Generate access and refresh tokens for a user
   */
  private async generateTokens(user: User): Promise<{ token: string, refreshToken: string }> {
    // Generate JWT
    const token = jwt.sign(
      { 
        sub: user.id, 
        email: user.email,
        role: user.role
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshTokenString = crypto.randomBytes(40).toString('hex');
    const expiryDays = 7; // Default to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Save refresh token using the service
    await refreshTokenService.createToken({
      token: refreshTokenString,
      userId: user.id,
      expiresAt,
      createdAt: new Date(),
      tenantId: user.tenantId || 'platform'
    });

    return { token, refreshToken: refreshTokenString };
  }

  async authenticate(email: string, password: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError(`User with email ${email} not found`);
    }

    const isValidPassword = await this.passwordService.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    return user;
  }

  async refreshAccessToken(refreshTokenString: string, tenantId: string): Promise<string> {
    // Get the token from the cache or database
    const token = await refreshTokenService.getByToken(refreshTokenString);
    if (!token) {
      throw new NotFoundError('Refresh token not found or revoked');
    }

    // Check if the token is expired
    if (token.expiresAt < new Date()) {
      await refreshTokenService.revokeToken(refreshTokenString);
      throw new AuthenticationError('Refresh token expired');
    }

    // Get the user
    const user = await this.userRepository.findById(token.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { 
        sub: user.id, 
        email: user.email,
        role: user.role
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return newAccessToken;
  }

  /**
   * Refresh token - generates new access and refresh tokens
   */
  async refreshToken(refreshTokenString: string): Promise<{ 
    success: boolean; 
    token?: string; 
    refreshToken?: string;
    user?: Omit<User, 'passwordHash'>;
  }> {
    try {
      // Get the token from the cache or database
      const token = await refreshTokenService.getByToken(refreshTokenString);
      if (!token) {
        throw new NotFoundError('Refresh token not found or revoked');
      }

      // Check if the token is expired
      if (token.expiresAt < new Date()) {
        await refreshTokenService.revokeToken(refreshTokenString);
        throw new AuthenticationError('Refresh token expired');
      }

      // Get the user
      const user = await this.userRepository.findById(token.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Revoke the old token
      await refreshTokenService.revokeToken(refreshTokenString);
      
      // Generate new tokens
      const { token: newAccessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);
      
      this.auditService.log('auth:token:refreshed', { userId: user.id });
      
      // Return the new tokens and user data
      const { passwordHash, ...userWithoutPassword } = user;
      return {
        success: true,
        token: newAccessToken,
        refreshToken: newRefreshToken,
        user: userWithoutPassword
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthenticationError) {
        this.auditService.log('auth:token:refresh:failed', { error: error.message });
        return { success: false };
      }
      throw error;
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
