// filepath: src/components/layout-builder/WidgetCard.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PaperClipIcon, TrashIcon } from '@heroicons/react/24/outline';
import { UniqueIdentifier } from '@dnd-kit/core';

interface WidgetCardProps {
  id: UniqueIdentifier;
  name?: string;
  onRemove?: (id: UniqueIdentifier) => void;
  isOverlay?: boolean;
}

export function WidgetCard({ id, name, onRemove, isOverlay }: WidgetCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: id,
    data: {
      type: 'widget',
      id: id,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const displayName = name || id.toString().split('-')[0];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-3 rounded-md shadow-sm flex items-center justify-between transition-opacity duration-200 ${isDragging ? 'opacity-50' : 'opacity-100'} ${isOverlay ? 'ring-2 ring-blue-500 cursor-grabbing' : 'cursor-grab'}`}
    >
      <div className="flex items-center">
        <PaperClipIcon className="h-5 w-5 text-gray-400 mr-2" />
        <span className="text-sm font-medium text-gray-800">{displayName}</span>
      </div>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent dnd listeners from firing
            onRemove(id);
          }}
          className="text-gray-400 hover:text-red-500"
          aria-label={`Remove ${displayName} widget`}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
