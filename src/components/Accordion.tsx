// src/components/Accordion.tsx
import { useState, ReactNode } from 'react';

export function Accordion({
  title,
  defaultCollapsed = true,
  children
}: {
  title: string;
  defaultCollapsed?: boolean;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full text-left font-medium py-2"
      >
        {title}
      </button>
      {!collapsed && <div className="pl-4 border-l">{children}</div>}
    </div>
  );
}
