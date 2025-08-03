// filepath: src/components/layout-builder/PaletteWidget.tsx
'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ViewfinderCircleIcon } from '@heroicons/react/24/outline';

interface PaletteWidgetProps {
  id: string;
  name: string;
}

export function PaletteWidget({ id, name }: PaletteWidgetProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      type: 'paletteWidget',
      id: id,
      name: name,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`bg-gray-50 p-3 rounded-md border border-dashed border-gray-400 flex items-center hover:bg-gray-100 hover:border-blue-500 transition-opacity duration-200 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } cursor-grab`}
    >
      <ViewfinderCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
      <span className="text-sm font-medium text-gray-700">{name}</span>
    </div>
  );
}
