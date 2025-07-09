// Types based on refactored schema

// Tenant Management
export interface Firm {
  id: number;
  name: string;
  slug: string;
  subdomain?: string;
  domain?: string;
  plan: string;
  status: string;
  onboarded: boolean;
  onboardingComplete: boolean;
  onboardingCode?: string;
  onboardingStep?: number;
  openaiApiKey?: string;
  logoUrl?: string;
  settings?: Record<string, any>;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

// User Management
export interface User {
  id: number;
  firmId?: number;
  email: string;
  passwordHash?: string;
  oauthProvider?: string;
  oauthId?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  lastLoginAt?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

// Firm Users
export interface FirmUser {
  id: number;
  firmId: number;
  userId: number;
  isOwner: boolean;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

// Onboarding
export interface OnboardingProfile {
  id: number;
  code: string;
  firmId?: number;
  status: string;
  stepData?: Record<string, any>;
  totalStepsCompleted: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

// Clients/Cases
export interface Client {
  id: number;
  firmId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  secondaryEmail?: string;
  secondaryPhone?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  id: number;
  firmId: number;
  clientId: number;
  title: string;
  description?: string;
  status: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Billing
export interface Invoice {
  id: number;
  firmId: number;
  clientId: number;
  invoiceNumber: string;
  status: string;
  amount: number;
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
  paymentMethod?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Calendar
export interface CalendarEvent {
  id: number;
  firmId: number;
  userId: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  eventType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Documents/Agents
export interface Document {
  id: number;
  firmId: number;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  documentType?: string;
  uploadedBy: number;
  uploadedAt: string;
  status: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Notifications
export interface Notification {
  id: number;
  firmId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  expiresAt?: string;
  actionUrl?: string;
  createdAt: string;
}

// System Settings
export interface PlatformSetting {
  id: number;
  key: string;
  value?: string;
  encrypted: boolean;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Data Types
export interface FirmFormData {
  name: string;
  slug?: string;
  subdomain?: string;
  domain?: string;
  plan?: string;
  logoUrl?: string;
  settings?: Record<string, any>;
  contactEmail?: string;
  contactPhone?: string;
}

export interface OnboardingStepData {
  step: number;
  data: Record<string, any>;
  complete: boolean;
}

export interface AgentConfig {
  type: string;
  name: string;
  description?: string;
  capabilities: string[];
  promptTemplate?: string;
  parameters?: Record<string, any>;
}

export interface DocumentAgentMapping {
  documentTypeId: string;
  agentId: string;
  workflow?: {
    steps: Array<{
      action: string;
      parameters?: Record<string, any>;
      nextStep?: string;
    }>;
  };
}
