// src/app/firmsync/[tenantId]/paralegal-plus/hooks/useParalegalFeatures.ts
// Custom hook for managing Paralegal+ document filters and features

'use client';

import { useState } from 'react';

export interface DocumentFilters {
  legalType: string;
  location: string;
  docType: string;
}

export const LEGAL_TYPES = [
  { value: 'contracts', label: 'Contracts' },
  { value: 'litigation', label: 'Litigation' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'family-law', label: 'Family Law' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'intellectual-property', label: 'Intellectual Property' },
  { value: 'employment', label: 'Employment' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'tax', label: 'Tax' },
] as const;

export const LOCATIONS = [
  { value: 'federal', label: 'Federal' },
  { value: 'california', label: 'California' },
  { value: 'new-york', label: 'New York' },
  { value: 'texas', label: 'Texas' },
  { value: 'florida', label: 'Florida' },
  { value: 'illinois', label: 'Illinois' },
  { value: 'pennsylvania', label: 'Pennsylvania' },
  { value: 'ohio', label: 'Ohio' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'north-carolina', label: 'North Carolina' },
] as const;

export const DOC_TYPES = [
  { value: 'agreement', label: 'Agreement' },
  { value: 'motion', label: 'Motion' },
  { value: 'brief', label: 'Brief' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'contract', label: 'Contract' },
  { value: 'letter', label: 'Letter' },
  { value: 'memo', label: 'Memorandum' },
  { value: 'petition', label: 'Petition' },
  { value: 'response', label: 'Response' },
  { value: 'discovery', label: 'Discovery Request' },
  { value: 'settlement', label: 'Settlement' },
  { value: 'notice', label: 'Notice' },
] as const;

export function useParalegalFeatures() {
  const [filters, setFilters] = useState<DocumentFilters>({
    legalType: 'all',
    location: 'all',
    docType: 'all',
  });

  const updateFilter = (key: keyof DocumentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      legalType: 'all',
      location: 'all',
      docType: 'all',
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    legalTypes: LEGAL_TYPES,
    locations: LOCATIONS,
    docTypes: DOC_TYPES,
  };
}
