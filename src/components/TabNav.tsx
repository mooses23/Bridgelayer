// src/components/TabNav.tsx
import Link from 'next/link';

export interface Tab {
  id: string;
  label: string;
  href: string;
}

export function TabNav({ tabs }: { tabs: Tab[] }) {
  return (
    <nav className="mb-4 border-b">
      <ul className="flex space-x-4">
        {tabs.map(tab => (
          <li key={tab.id}>
            <Link
              href={tab.href}
              className="px-3 py-1 text-gray-700 hover:text-blue-600"
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
