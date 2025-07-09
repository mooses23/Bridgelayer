import { z } from 'zod';
import { Request } from 'express';

// Base schemas for reusable validation patterns
const emailSchema = z.string().email('Invalid email format');
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mode: z.enum(['bridgelayer', 'firm']),
  remember: z.boolean().optional()
});

// Hybrid auth schemas
export const hybridLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional()
});

export const hybridRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  firmCode: z.string().optional()
});

export const oauthLoginSchema = z.object({
  provider: z.enum(['google', 'microsoft', 'github']),
  token: z.string()
});

export const resetPasswordRequestSchema = z.object({
  email: emailSchema
});

// Original schemas
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  firmName: z.string().min(2, 'Firm name must be at least 2 characters').optional(),
  mode: z.enum(['bridgelayer', 'firm'])
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// User schemas
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema.optional(),
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  role: z.enum(['admin', 'firm_user']).optional(),
  oauthProvider: z.enum(['google', 'microsoft', 'github']).optional(),
  oauthId: z.string().optional()
});

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  role: z.enum(['admin', 'firm_user']).optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Current password must be at least 8 characters'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Firm schemas
export const createFirmSchema = z.object({
  name: z.string().min(2, 'Firm name must be at least 2 characters'),
  subdomain: z.string().regex(/^[a-z0-9-]+$/, 'Subdomain must contain only lowercase letters, numbers, and hyphens').optional(),
  practiceAreas: z.array(z.string()).optional(),
  billingPlan: z.string().optional(),
  ownerEmail: emailSchema.optional(),
  ownerPassword: passwordSchema.optional(),
  ownerFirstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  ownerLastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  openaiKey: z.string().optional()
}).refine(data => {
  // If any owner field is provided, all owner fields must be provided
  const hasOwnerFields = data.ownerEmail || data.ownerPassword || data.ownerFirstName || data.ownerLastName;
  const hasAllOwnerFields = data.ownerEmail && data.ownerPassword && data.ownerFirstName && data.ownerLastName;
  
  return !hasOwnerFields || hasAllOwnerFields;
}, {
  message: "All owner fields (email, password, firstName, lastName) must be provided if any are present",
  path: ["ownerEmail"]
});

export const updateFirmSchema = z.object({
  name: z.string().min(2, 'Firm name must be at least 2 characters').optional(),
  subdomain: z.string().regex(/^[a-z0-9-]+$/, 'Subdomain must contain only lowercase letters, numbers, and hyphens').optional(),
  practiceAreas: z.array(z.string()).optional(),
  billingPlan: z.string().optional(),
  openaiKey: z.string().optional()
});

export const addUserToFirmSchema = z.object({
  userId: z.number().int('User ID must be an integer'),
  isOwner: z.boolean().optional(),
  role: z.string().optional()
});

// Onboarding schemas
export const initOnboardingSchema = z.object({
  firmName: z.string().min(2, 'Firm name must be at least 2 characters'),
  subdomain: z.string().regex(/^[a-z0-9-]+$/, 'Subdomain must contain only lowercase letters, numbers, and hyphens'),
  adminEmail: emailSchema,
  vertical: z.string().optional()
});

export const saveProgressSchema = z.object({
  step: z.number().int().min(1).max(6),
  firmName: z.string().optional(),
  subdomain: z.string().optional(),
  adminEmail: emailSchema.optional(),
  adminName: z.string().optional(),
  phoneNumber: z.string().optional(),
  practiceAreas: z.array(z.string()).optional(),
  planTier: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  theme: z.string().optional(),
  integrations: z.record(z.boolean()).optional()
});

export const completeOnboardingSchema = z.object({
  adminName: z.string().min(2, 'Admin name is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
  phoneNumber: z.string().optional(),
  practiceAreas: z.array(z.string()).optional(),
  planTier: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Validation service class
export class ValidationService {
  private static sanitizeInput(input: unknown): unknown {
    if (typeof input === 'string') {
      // Remove any HTML tags and suspicious patterns
      return input
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    }
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    if (input && typeof input === 'object') {
      return Object.fromEntries(
        Object.entries(input).map(([key, value]) => [
          key,
          this.sanitizeInput(value)
        ])
      );
    }
    return input;
  }

  static validate<T extends z.ZodType>(
    schema: T,
    data: unknown
  ): z.infer<T> {
    // First sanitize the input
    const sanitizedData = this.sanitizeInput(data);
    // Then validate against schema
    return schema.parse(sanitizedData);
  }

  static validateRequest<T extends z.ZodType>(
    schema: T,
    req: Request
  ): z.infer<T> {
    const data = {
      ...req.body,
      ...req.query,
      ...req.params
    };
    return this.validate(schema, data);
  }
}
