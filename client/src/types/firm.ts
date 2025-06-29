export type FirmStatus = 'active' | 'setup' | 'suspended';

export type PracticeArea = 'corporate' | 'litigation' | 'real-estate' | 'ip' | 'other';

export interface Firm {
  id: string;
  name: string;
  status: FirmStatus;
  practiceArea: PracticeArea;
  userCount: number;
  createdAt: string;
  lastActive: string;
  config: {
    apiKey: string;
    features: string[];
    settings: Record<string, any>;
  };
  metrics: {
    apiUsage: number;
    errorRate: number;
    activeUsers: number;
  };
  onboarding: {
    progress: number;
    currentStep: string;
    completedSteps: string[];
  };
}

export interface FirmFilters {
  status?: FirmStatus[];
  practiceArea?: PracticeArea[];
  search?: string;
  page: number;
  pageSize: number;
}

export interface FirmListResponse {
  firms: Firm[];
  total: number;
  page: number;
  pageSize: number;
}
