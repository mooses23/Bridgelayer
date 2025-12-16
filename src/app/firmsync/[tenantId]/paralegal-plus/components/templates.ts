// src/app/firmsync/[tenantId]/paralegal-plus/components/templates.ts
// Document templates and sample data for Paralegal+ features

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  jurisdiction: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'settlement-agreement',
    title: 'Settlement Agreement Template',
    description: 'Standard settlement agreement with customizable terms',
    category: 'Contracts',
    jurisdiction: 'California'
  },
  {
    id: 'motion-to-dismiss',
    title: 'Motion to Dismiss',
    description: 'Pre-formatted motion with legal citations and arguments',
    category: 'Litigation',
    jurisdiction: 'Federal'
  },
  {
    id: 'demand-letter',
    title: 'Demand Letter',
    description: 'Professional demand letter for payment or action',
    category: 'Letter',
    jurisdiction: 'All Jurisdictions'
  }
];

export interface ReviewDocument {
  id: string;
  filename: string;
  status: 'reviewed' | 'in-progress' | 'issues-found';
  description: string;
  category: string;
  jurisdiction: string;
  timestamp: string;
}

export const SAMPLE_REVIEWS: ReviewDocument[] = [
  {
    id: 'review-1',
    filename: 'Settlement_Agreement_2024.pdf',
    status: 'reviewed',
    description: 'Contract review completed with 3 recommendations',
    category: 'Contracts',
    jurisdiction: 'California',
    timestamp: '2 hours ago'
  },
  {
    id: 'review-2',
    filename: 'Employment_Contract_Draft.docx',
    status: 'in-progress',
    description: 'AI analysis in progress...',
    category: 'Employment',
    jurisdiction: 'New York',
    timestamp: '5 minutes ago'
  },
  {
    id: 'review-3',
    filename: 'NDA_Template_v3.pdf',
    status: 'issues-found',
    description: '5 critical compliance issues identified',
    category: 'Contracts',
    jurisdiction: 'Federal',
    timestamp: 'Yesterday'
  }
];

export const STATUS_STYLES = {
  'reviewed': 'bg-green-100 text-green-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'issues-found': 'bg-red-100 text-red-800'
} as const;

export const STATUS_LABELS = {
  'reviewed': 'Reviewed',
  'in-progress': 'In Progress',
  'issues-found': 'Issues Found'
} as const;
