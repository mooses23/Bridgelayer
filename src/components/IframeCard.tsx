// src/components/IframeCard.tsx
import React from 'react';

export function IframeCard({
  title,
  src
}: {
  title: string;
  src: string;
}) {
  return (
    <div className="mb-4 border rounded shadow-sm overflow-hidden">
      <div className="px-4 py-2 bg-gray-100 font-medium">{title}</div>
      <iframe src={src} className="w-full h-64" />
    </div>
  );
}
