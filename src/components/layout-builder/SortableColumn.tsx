// filepath: src/components/layout-builder/SortableColumn.tsx
'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { UniqueIdentifier } from '@dnd-kit/core';

interface SortableColumnProps {
  id: string;
  width: string;
  items: UniqueIdentifier[];
  children: React.ReactNode;
}

export function SortableColumn({ id, width, items, children }: SortableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ 
    id,
    data: {
      type: 'column',
    }
  });

  return (
    <div className={`${width}`}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div 
              ref={setNodeRef} 
              className={`p-4 bg-gray-100 rounded-lg min-h-[100px] flex flex-col gap-2 transition-colors duration-200 ease-in-out ${isOver ? 'bg-green-500/10' : ''}`}
            >
                {children}
            </div>
        </SortableContext>
    </div>
  );
}
