// src/app/firmsync/[tenantId]/paralegal-plus/components/DocumentCard.tsx
// Reusable document card component

'use client';

interface DocumentCardProps {
  title: string;
  description: string;
  tags: { label: string; value: string }[];
  actionLabel: string;
  onAction: () => void;
  statusBadge?: {
    label: string;
    className: string;
  };
}

export function DocumentCard({
  title,
  description,
  tags,
  actionLabel,
  onAction,
  statusBadge
}: DocumentCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            {statusBadge && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <div className="flex gap-2 mt-2">
            {tags.map((tag, index) => (
              <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                {tag.label}
              </span>
            ))}
          </div>
        </div>
        <button 
          onClick={onAction}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
