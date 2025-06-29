import { z } from 'zod';

// Login Request Schema
export const loginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password required'),
  mode: z.enum(['bridgelayer', 'firm']).default('bridgelayer'),
  code: z.string().optional()
});
// Note: Code is optional for firm mode to allow subsequent logins without code

// Login Response Schema
export const loginResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
    firmId: z.number().nullable()
  }),
  redirectPath: z.string()
});

// Types
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
