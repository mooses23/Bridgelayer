import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number');
export const requiredStringSchema = z.string().min(1, 'This field is required');

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Client intake form validation
export const clientIntakeSchema = z.object({
  firstName: requiredStringSchema.max(50, 'First name must be less than 50 characters'),
  lastName: requiredStringSchema.max(50, 'Last name must be less than 50 characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
  matterType: requiredStringSchema,
  region: requiredStringSchema,
  description: requiredStringSchema.min(10, 'Please provide at least 10 characters describing your legal matter'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
});

// User profile update validation
export const userProfileSchema = z.object({
  firstName: requiredStringSchema.max(50, 'First name must be less than 50 characters'),
  lastName: requiredStringSchema.max(50, 'Last name must be less than 50 characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
});

// Firm settings validation
export const firmSettingsSchema = z.object({
  name: requiredStringSchema.max(100, 'Firm name must be less than 100 characters'),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  phone: phoneSchema.optional(),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  billingSettings: z.object({
    defaultHourlyRate: z.number().min(0, 'Rate must be positive').max(10000, 'Rate seems unusually high'),
    currency: z.string().default('USD'),
    invoiceTerms: z.string().max(500, 'Terms must be less than 500 characters').optional(),
  }).optional(),
});

// Time entry validation
export const timeEntrySchema = z.object({
  clientId: z.number().positive('Please select a client'),
  caseId: z.number().positive('Please select a case').optional(),
  description: requiredStringSchema.min(5, 'Please provide a meaningful description (at least 5 characters)'),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()),
  billableRate: z.number().min(0, 'Rate must be positive').max(10000, 'Rate seems unusually high').optional(),
  tags: z.array(z.string()).optional(),
});

// Document upload validation
export const documentUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
  documentType: requiredStringSchema,
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  clientId: z.number().positive('Please select a client').optional(),
  caseId: z.number().positive('Please select a case').optional(),
});

// Case creation validation
export const caseSchema = z.object({
  title: requiredStringSchema.max(200, 'Case title must be less than 200 characters'),
  clientId: z.number().positive('Please select a client'),
  caseType: requiredStringSchema,
  status: z.enum(['active', 'pending', 'closed', 'on_hold']).default('active'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  assignedTo: z.number().positive('Please assign the case to a team member').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  estimatedHours: z.number().min(0, 'Hours must be positive').max(10000, 'Hours seem unusually high').optional(),
});

// Client creation validation
export const clientSchema = z.object({
  name: requiredStringSchema.max(100, 'Client name must be less than 100 characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
  address: z.string().max(300, 'Address must be less than 300 characters').optional(),
  billingAddress: z.string().max(300, 'Billing address must be less than 300 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

// Admin user creation validation
export const adminUserSchema = z.object({
  firstName: requiredStringSchema.max(50, 'First name must be less than 50 characters'),
  lastName: requiredStringSchema.max(50, 'Last name must be less than 50 characters'),
  email: emailSchema,
  role: z.enum(['platform_admin', 'admin', 'super_admin', 'firm_admin', 'paralegal', 'client']),
  firmId: z.number().positive('Please select a firm').optional(),
  password: passwordSchema,
});

// Form validation helper functions
export function validateField<T>(schema: z.ZodSchema<T>, value: any): string | null {
  try {
    schema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid value';
    }
    return 'Validation error';
  }
}

export function validateForm<T>(schema: z.ZodSchema<T>, data: any): { 
  isValid: boolean; 
  errors: Record<string, string>; 
  data?: T 
} {
  try {
    const validData = schema.parse(data);
    return { isValid: true, errors: {}, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
}

// Custom validation hooks
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: any) => validateForm(schema, data),
    validateField: (field: keyof T, value: any) => {
      try {
        const fieldSchema = schema.shape[field as string];
        if (fieldSchema) {
          fieldSchema.parse(value);
        }
        return null;
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0]?.message || 'Invalid value';
        }
        return 'Validation error';
      }
    }
  };
}