import React from 'react';
import { TabsTrigger } from '@/components/ui/tabs';

export interface TabItemProps {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

export const TabItem: React.FC<TabItemProps> = ({ value, icon: Icon, children }) => (
  <TabsTrigger value={value} className="flex items-center gap-2">
    <Icon className="h-4 w-4" />
    {children}
  </TabsTrigger>
);
