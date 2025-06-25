// Wrapper for toast that supports both children and description
import React from 'react';
import { toast as originalToast } from '@/components/ui/use-toast';

export function toast({ title, description, children, ...rest }: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive';
}) {
  return originalToast({
    title: title,
    children: children || description,
    ...rest
  });
}
