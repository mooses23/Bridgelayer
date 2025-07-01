import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class PasswordService {
  private readonly SALT_ROUNDS = 12;
  private readonly RESET_TOKEN_BYTES = 32;
  private readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateResetToken(): Promise<{ token: string; hashedToken: string }> {
    const token = crypto.randomBytes(this.RESET_TOKEN_BYTES).toString('hex');
    const hashedToken = await this.hashPassword(token);
    
    return { token, hashedToken };
  }

  validatePasswordStrength(password: string): { 
    isValid: boolean; 
    errors: string[] 
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    // Check for common patterns
    const commonPatterns = [
      'password',
      '123456',
      'qwerty',
      'admin',
      'letmein'
    ];

    if (commonPatterns.some(pattern => 
      password.toLowerCase().includes(pattern)
    )) {
      errors.push('Password contains a common pattern that is too easy to guess');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async generateTemporaryPassword(): Promise<string> {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Fill the rest randomly
    while (password.length < length) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}
