import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Base schemas for reuse
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must include uppercase, lowercase, number and special character'
  );

const emailSchema = z.string()
  .email('Invalid email format')
  .transform(email => email.toLowerCase());

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mode: z.enum(['bridgelayer', 'firm'], {
    errorMap: () => ({ message: 'Invalid login mode' })
  })
});

// Create firm validation schema
export const createFirmSchema = z.object({
  name: z.string()
    .min(2, 'Firm name must be at least 2 characters')
    .max(100, 'Firm name is too long'),
  email: emailSchema,
  openaiApiKey: z.string()
    .regex(/^sk-[a-zA-Z0-9]{48}$/, 'Invalid OpenAI API key format'),
  practiceAreas: z.array(z.string()).min(1, 'At least one practice area is required'),
  branding: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
    logo: z.string().url().optional()
  })
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string(),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export function validate(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}
