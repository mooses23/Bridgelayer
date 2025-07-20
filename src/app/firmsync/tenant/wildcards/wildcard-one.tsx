// src/app/firmsync/tenant/wildcards/wildcard-one.tsx
// Wildcard Tab 1 - Configurable iframe content for custom integrations or third-party tools

'use client';

interface WildcardOneProps {
  src?: string;
  title?: string;
  enabled?: boolean;
}

export default function WildcardOne({ 
  src = 'https://example.com/integration-a', 
  title = 'Custom Integration A',
  enabled = false 
}: WildcardOneProps) {
  if (!enabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wildcard Tab 1</h2>
          <p className="text-gray-600">This custom tab is not currently enabled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">Custom integration content</p>
        </div>
        
        <div className="h-[calc(100vh-80px)]">
          <iframe 
            src={src}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    </div>
  );
}
