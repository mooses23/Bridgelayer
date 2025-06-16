import * as yup from 'yup';

// Base validation schemas
export const emailSchema = yup.string()
  .email('Please enter a valid email address')
  .required('Email is required');

export const phoneSchema = yup.string()
  .matches(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number must be at least 10 digits')
  .required('Phone number is required');

export const requiredStringSchema = yup.string()
  .trim()
  .min(1, 'This field is required')
  .required('This field is required');

export const optionalStringSchema = yup.string().trim();

export const positiveNumberSchema = yup.number()
  .positive('Must be a positive number')
  .required('This field is required');

export const currencySchema = yup.number()
  .min(0, 'Amount must be non-negative')
  .max(999999.99, 'Amount cannot exceed $999,999.99')
  .required('Amount is required');

export const hourlyRateSchema = yup.number()
  .min(0.01, 'Rate must be at least $0.01')
  .max(10000, 'Rate cannot exceed $10,000/hour')
  .required('Hourly rate is required');

export const hoursSchema = yup.number()
  .min(0.1, 'Minimum 0.1 hours required')
  .max(24, 'Cannot exceed 24 hours per entry')
  .required('Hours are required');

// Authentication schemas
export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  rememberMe: yup.boolean().default(false)
});

// Client intake schema
export const clientIntakeSchema = yup.object({
  clientName: requiredStringSchema.max(100, 'Name cannot exceed 100 characters'),
  email: emailSchema,
  phone: phoneSchema,
  address: optionalStringSchema.max(200, 'Address cannot exceed 200 characters'),
  region: requiredStringSchema,
  county: requiredStringSchema,
  matterType: requiredStringSchema,
  description: requiredStringSchema
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  priority: yup.string()
    .oneOf(['low', 'medium', 'high'], 'Invalid priority level')
    .default('medium'),
  estimatedValue: yup.number()
    .min(0, 'Value must be non-negative')
    .max(10000000, 'Value cannot exceed $10,000,000')
    .nullable()
    .optional()
});

// Time entry schema
export const timeEntrySchema = yup.object({
  clientId: yup.number()
    .integer('Invalid client')
    .positive('Invalid client')
    .required('Client is required'),
  caseId: yup.number()
    .integer('Invalid case')
    .positive('Invalid case')
    .nullable(),
  description: requiredStringSchema
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  hours: hoursSchema,
  billableRate: hourlyRateSchema,
  date: yup.date()
    .max(new Date(), 'Date cannot be in the future')
    .required('Date is required'),
  billable: yup.boolean().default(true)
});

// Invoice creation schema
export const invoiceSchema = yup.object({
  clientId: yup.number()
    .integer('Invalid client')
    .positive('Invalid client')
    .required('Client is required'),
  timeEntryIds: yup.array()
    .of(yup.number().integer().positive())
    .min(1, 'At least one time entry is required')
    .required('Time entries are required'),
  issueDate: yup.date()
    .max(new Date(), 'Issue date cannot be in the future')
    .required('Issue date is required'),
  dueDate: yup.date()
    .min(yup.ref('issueDate'), 'Due date must be after issue date')
    .required('Due date is required'),
  notes: optionalStringSchema.max(500, 'Notes cannot exceed 500 characters'),
  terms: optionalStringSchema.max(1000, 'Terms cannot exceed 1000 characters')
});

// Client creation schema
export const clientSchema = yup.object({
  name: requiredStringSchema.max(100, 'Name cannot exceed 100 characters'),
  email: emailSchema,
  phone: phoneSchema,
  address: optionalStringSchema.max(200, 'Address cannot exceed 200 characters'),
  city: optionalStringSchema.max(50, 'City cannot exceed 50 characters'),
  state: optionalStringSchema.max(2, 'State must be 2 characters'),
  zipCode: yup.string()
    .matches(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
    .nullable(),
  company: optionalStringSchema.max(100, 'Company cannot exceed 100 characters'),
  billingRate: hourlyRateSchema,
  retainerAmount: yup.number()
    .min(0, 'Retainer must be non-negative')
    .max(1000000, 'Retainer cannot exceed $1,000,000')
    .nullable()
});

// Case creation schema
export const caseSchema = yup.object({
  title: requiredStringSchema.max(150, 'Title cannot exceed 150 characters'),
  clientId: yup.number()
    .integer('Invalid client')
    .positive('Invalid client')
    .required('Client is required'),
  caseNumber: optionalStringSchema.max(50, 'Case number cannot exceed 50 characters'),
  description: requiredStringSchema
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  status: yup.string()
    .oneOf(['active', 'pending', 'closed'], 'Invalid status')
    .default('active'),
  priority: yup.string()
    .oneOf(['low', 'medium', 'high'], 'Invalid priority')
    .default('medium'),
  estimatedHours: yup.number()
    .min(0.1, 'Estimated hours must be at least 0.1')
    .max(10000, 'Estimated hours cannot exceed 10,000')
    .nullable(),
  hourlyRate: hourlyRateSchema
});

// Document upload schema
export const documentUploadSchema = yup.object({
  title: requiredStringSchema.max(100, 'Title cannot exceed 100 characters'),
  description: optionalStringSchema.max(500, 'Description cannot exceed 500 characters'),
  documentType: requiredStringSchema,
  clientId: yup.number()
    .integer('Invalid client')
    .positive('Invalid client')
    .nullable(),
  caseId: yup.number()
    .integer('Invalid case')
    .positive('Invalid case')
    .nullable(),
  file: yup.mixed()
    .required('File is required')
    .test('fileSize', 'File size cannot exceed 10MB', (value: any) => {
      return !value || value.size <= 10 * 1024 * 1024;
    })
    .test('fileType', 'Invalid file type', (value: any) => {
      if (!value) return true;
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];
      return allowedTypes.includes(value.type);
    })
});

// User profile schema
export const userProfileSchema = yup.object({
  firstName: requiredStringSchema.max(50, 'First name cannot exceed 50 characters'),
  lastName: requiredStringSchema.max(50, 'Last name cannot exceed 50 characters'),
  email: emailSchema,
  phone: phoneSchema,
  title: optionalStringSchema.max(100, 'Title cannot exceed 100 characters'),
  bio: optionalStringSchema.max(500, 'Bio cannot exceed 500 characters'),
  hourlyRate: yup.number()
    .min(0, 'Rate must be non-negative')
    .max(10000, 'Rate cannot exceed $10,000/hour')
    .nullable()
});

// Firm settings schema
export const firmSettingsSchema = yup.object({
  name: requiredStringSchema.max(100, 'Firm name cannot exceed 100 characters'),
  address: requiredStringSchema.max(200, 'Address cannot exceed 200 characters'),
  city: requiredStringSchema.max(50, 'City cannot exceed 50 characters'),
  state: requiredStringSchema.max(2, 'State must be 2 characters'),
  zipCode: yup.string()
    .matches(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
    .required('ZIP code is required'),
  phone: phoneSchema,
  email: emailSchema,
  website: yup.string()
    .url('Invalid website URL')
    .nullable(),
  taxId: yup.string()
    .matches(/^\d{2}-\d{7}$/, 'Tax ID must be in format XX-XXXXXXX')
    .nullable(),
  defaultHourlyRate: hourlyRateSchema,
  invoiceTerms: yup.string()
    .max(1000, 'Invoice terms cannot exceed 1000 characters')
    .default('Payment due within 30 days'),
  retainerRequired: yup.boolean().default(false),
  minimumRetainer: yup.number()
    .min(0, 'Minimum retainer must be non-negative')
    .max(100000, 'Minimum retainer cannot exceed $100,000')
    .when('retainerRequired', {
      is: true,
      then: (schema) => schema.required('Minimum retainer is required when retainer is required')
    })
});

// Admin user creation schema
export const adminUserSchema = yup.object({
  email: emailSchema,
  firstName: requiredStringSchema.max(50, 'First name cannot exceed 50 characters'),
  lastName: requiredStringSchema.max(50, 'Last name cannot exceed 50 characters'),
  role: yup.string()
    .oneOf(['admin', 'platform_admin', 'super_admin'], 'Invalid role')
    .required('Role is required'),
  permissions: yup.array()
    .of(yup.string())
    .default([]),
  active: yup.boolean().default(true)
});

// Communication log schema
export const communicationLogSchema = yup.object({
  type: yup.string()
    .oneOf(['call', 'email', 'meeting', 'note'], 'Invalid communication type')
    .required('Communication type is required'),
  subject: requiredStringSchema.max(200, 'Subject cannot exceed 200 characters'),
  content: requiredStringSchema
    .min(10, 'Content must be at least 10 characters')
    .max(2000, 'Content cannot exceed 2000 characters'),
  clientId: yup.number()
    .integer('Invalid client')
    .positive('Invalid client')
    .nullable(),
  caseId: yup.number()
    .integer('Invalid case')
    .positive('Invalid case')
    .nullable(),
  date: yup.date()
    .max(new Date(), 'Date cannot be in the future')
    .required('Date is required'),
  duration: yup.number()
    .min(0, 'Duration must be non-negative')
    .max(480, 'Duration cannot exceed 8 hours')
    .nullable(),
  billable: yup.boolean().default(false)
});

// Validation helper functions
export function validateSync<T>(schema: yup.Schema<T>, data: any): { isValid: boolean; errors: Record<string, string>; data?: T } {
  try {
    const validData = schema.validateSync(data, { abortEarly: false });
    return { isValid: true, errors: {}, data: validData };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
}

export async function validateAsync<T>(schema: yup.Schema<T>, data: any): Promise<{ isValid: boolean; errors: Record<string, string>; data?: T }> {
  try {
    const validData = await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {}, data: validData };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
}