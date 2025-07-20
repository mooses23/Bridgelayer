'use client';

import { usePortalTemplate } from '@/hooks/usePortalTemplate';
import { TabNav }            from '@/components/TabNav';
import { Accordion }         from '@/components/Accordion';
import { IframeCard }        from '@/components/IframeCard';

export default function PreviewPage() {
  const { tenantTabs, wildcardTabs } = usePortalTemplate();
  const enabled = wildcardTabs.filter(t => t.enabled);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Tenant Portal Preview</h2>

      <TabNav tabs={tenantTabs} />

      <Accordion title="Custom Tabs" defaultCollapsed>
        {enabled.length > 0
          ? enabled.map(tab => (
              <IframeCard key={tab.id} title={tab.name} src={tab.url} />
            ))
          : <p className="italic text-gray-500">No custom tabs configured.</p>
        }
      </Accordion>
    </div>
  );
}
