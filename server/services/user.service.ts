import { BaseService } from './base.service';
import { UserRepository, User, UpdateUser } from '../repositories/user.repository';
import { ValidationError } from '../middleware/validation.middleware';
import { PasswordService } from './password.service';
import { authService } from './auth.service';
import { NotFoundError } from '../utils/errors';
import { cacheService } from './cache.service';

/**
 * User Service handles all user-related business logic
 */
export class UserService extends BaseService<User, UserRepository> {
  private passwordService: PasswordService;
  private readonly USER_CACHE_PREFIX = 'user:';
  private readonly USER_CACHE_TTL = 3600; // 1 hour
  
  constructor() {
    super(new UserRepository(), 'user');
    this.passwordService = new PasswordService();
  }

  /**
   * Create a new user
   */
  async createUser(userData: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    oauthProvider?: string;
    oauthId?: string;
  }) {
    // Check if user already exists
    const existingUser = await this.repository.findByEmail(userData.email);
    if (existingUser) {
      throw new ValidationError({ email: ['Email is already in use'] });
    }

    // For non-OAuth users, password is required
    if (!userData.oauthProvider && !userData.password) {
      throw new ValidationError({ password: ['Password is required'] });
    }

    // Hash password if provided
    let passwordHash = undefined;
    if (userData.password) {
      passwordHash = await this.passwordService.hashPassword(userData.password);
    }

    // Create the user
    const user = await this.repository.create({
      email: userData.email.toLowerCase(),
      passwordHash,
      role: (userData.role as any) || 'firm_user',
      firstName: userData.firstName,
      lastName: userData.lastName,
      oauthProvider: userData.oauthProvider as any,
      oauthId: userData.oauthId,
      createdAt: new Date()
    });

    this.auditService.log('user:created', { 
      userId: user.id, 
      email: user.email,
      role: user.role
    });

    // Cache the new user
    await cacheService.set(
      `${this.USER_CACHE_PREFIX}id:${user.id}`, 
      user, 
      this.USER_CACHE_TTL
    );
    await cacheService.set(
      `${this.USER_CACHE_PREFIX}email:${user.email.toLowerCase()}`, 
      user, 
      this.USER_CACHE_TTL
    );

    // Don't return the password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update a user
   */
  async updateUser(id: number, userData: {
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
    password?: string;
  }) {
    // Check if user exists
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new ValidationError({ user: ['User not found'] });
    }

    // Check if email is being changed and if it's already in use
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await this.repository.findByEmail(userData.email);
      if (userWithEmail) {
        throw new ValidationError({ email: ['Email is already in use'] });
      }
    }

    // Hash password if provided
    let passwordHash = undefined;
    if (userData.password) {
      passwordHash = await this.passwordService.hashPassword(userData.password);
    }

    // Prepare update data
    const updateData: UpdateUser = {
      ...(userData.firstName && { firstName: userData.firstName }),
      ...(userData.lastName && { lastName: userData.lastName }),
      ...(userData.role && { role: userData.role as any }),
      ...(userData.email && { email: userData.email.toLowerCase() }),
      ...(passwordHash && { passwordHash }),
      updatedAt: new Date()
    };

    // Update the user
    const updatedUser = await this.repository.updateById(id, updateData);
    
    this.auditService.log('user:updated', { 
      userId: id,
      updatedFields: Object.keys(userData)
    });
    
    // Invalidate cache
    await cacheService.delete(`${this.USER_CACHE_PREFIX}id:${id}`);
    // If email was updated, invalidate the old email cache key as well
    if (userData.email) {
      await cacheService.delete(`${this.USER_CACHE_PREFIX}email:${existingUser.email.toLowerCase()}`);
    }

    // Don't return the password hash
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const cacheKey = `${this.USER_CACHE_PREFIX}email:${email.toLowerCase()}`;
    
    // Try to get user from cache first
    const cachedUser = await cacheService.get<User>(cacheKey);
    if (cachedUser) {
      // Don't return the password hash
      const { passwordHash, ...userWithoutPassword } = cachedUser;
      return userWithoutPassword;
    }
    
    // If not in cache, get from database
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new NotFoundError(`User with email ${email} not found`);
    }
    
    // Cache the user
    await cacheService.set(cacheKey, user, this.USER_CACHE_TTL);
    
    // Don't return the password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number) {
    const cacheKey = `${this.USER_CACHE_PREFIX}id:${id}`;
    
    // Try to get user from cache first
    const cachedUser = await cacheService.get<User>(cacheKey);
    if (cachedUser) {
      // Don't return the password hash
      const { passwordHash, ...userWithoutPassword } = cachedUser;
      return userWithoutPassword;
    }
    
    // If not in cache, get from database
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    
    // Cache the user
    await cacheService.set(cacheKey, user, this.USER_CACHE_TTL);
    
    // Don't return the password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string) {
    const users = await this.repository.findByRole(role);
    
    // Don't return password hashes
    return users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    // Get user with password hash
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new ValidationError({ user: ['User not found'] });
    }

    // Verify current password
    const isPasswordValid = await this.passwordService.verifyPassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ValidationError({ currentPassword: ['Current password is incorrect'] });
    }

    // Hash new password
    const passwordHash = await this.passwordService.hashPassword(newPassword);

    // Update the password
    await this.repository.updatePassword(userId, passwordHash);
    
    this.auditService.log('user:password:changed', { userId });

    return { success: true };
  }

  /**
   * Delete a user (soft delete)
   */
  async deleteUser(id: number) {
    const success = await this.repository.softDelete(id);
    
    if (success) {
      this.auditService.log('user:deleted', { userId: id });
    }
    
    return { success };
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: number) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new ValidationError({ user: ['User not found'] });
    }
    
    // Don't return the password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

// Export a singleton instance
export const userService = new UserService();
