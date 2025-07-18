'use client';

import { usePortalTemplate } from '@/hooks/usePortalTemplate';
import { TabNav } from '@/components/TabNav';
import { Accordion } from '@/components/Accordion';
import { IframeCard } from '@/components/IframeCard';

export default function PreviewPage() {
  const { nativeTabs, wildcardTabs } = usePortalTemplate();

  const tabs = [
    { id: 'home', label: 'Home', href: '/firmsync/preview/home' },
    ...nativeTabs,
    { id: 'time', label: 'Time', href: '/firmsync/preview/time' },
    { id: 'reports', label: 'Reports', href: '/firmsync/preview/reports' },
    { id: 'settings', label: 'Settings', href: '/firmsync/preview/settings' }
  ];

  const enabledWildcardTabs = wildcardTabs.filter(t => t.enabled);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Portal Preview</h2>
      
      <TabNav tabs={tabs} />
      
      <Accordion title="Custom Tabs" defaultCollapsed>
        {enabledWildcardTabs.length > 0 ? (
          enabledWildcardTabs.map(tab => (
            <IframeCard key={tab.id} title={tab.name} src={tab.url} />
          ))
        ) : (
          <p className="italic text-gray-500">No custom tabs configured.</p>
        )}
      </Accordion>
    </div>
  );
}
