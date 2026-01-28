// src/app/firmsync/tenant/components/WildcardTabs.tsx
// Component for managing and displaying wildcard/custom tabs in the tenant interface

'use client';

import { useState, useEffect } from 'react';
import WildcardOne from '../wildcards/wildcard-one';
import WildcardTwo from '../wildcards/wildcard-two';
import WildcardThree from '../wildcards/wildcard-three';

interface WildcardTab {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  component: 'wildcard-one' | 'wildcard-two' | 'wildcard-three';
}

interface WildcardTabsProps {
  tenantId: string;
  tabs?: WildcardTab[];
}

export default function WildcardTabs({ tenantId, tabs = [] }: WildcardTabsProps) {
  const [wildcardTabs, setWildcardTabs] = useState<WildcardTab[]>([
    {
      id: 'w1',
      name: 'Custom Integration A',
      url: 'https://example.com/integration-a',
      enabled: false,
      component: 'wildcard-one'
    },
    {
      id: 'w2',
      name: 'Custom Integration B',
      url: 'https://example.com/integration-b',
      enabled: true,
      component: 'wildcard-two'
    },
    {
      id: 'w3',
      name: 'Custom Integration C',
      url: 'https://example.com/integration-c',
      enabled: false,
      component: 'wildcard-three'
    }
  ]);

  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    if (tabs.length > 0) {
      setWildcardTabs(tabs);
    }
  }, [tabs]);

  const enabledTabs = wildcardTabs.filter(tab => tab.enabled);

  const renderWildcardComponent = (tab: WildcardTab) => {
    const props = {
      src: tab.url,
      title: tab.name,
      enabled: tab.enabled
    };

    switch (tab.component) {
      case 'wildcard-one':
        return <WildcardOne {...props} />;
      case 'wildcard-two':
        return <WildcardTwo {...props} />;
      case 'wildcard-three':
        return <WildcardThree {...props} />;
      default:
        return <WildcardOne {...props} />;
    }
  };

  if (enabledTabs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-tenant-id={tenantId}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Custom Tabs Enabled</h2>
          <p className="text-gray-600">Contact your administrator to enable custom integrations</p>
        </div>
      </div>
    );
  }

  if (enabledTabs.length === 1) {
    return (
      <div data-tenant-id={tenantId}>
        {renderWildcardComponent(enabledTabs[0])}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-tenant-id={tenantId}>
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex space-x-4">
            {enabledTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id || (!activeTab && enabledTabs[0].id === tab.id)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="h-[calc(100vh-80px)]">
        {enabledTabs.map((tab) => (
          <div
            key={tab.id}
            className={`h-full ${
              activeTab === tab.id || (!activeTab && enabledTabs[0].id === tab.id)
                ? 'block'
                : 'hidden'
            }`}
          >
            {renderWildcardComponent(tab)}
          </div>
        ))}
      </div>
    </div>
  );
}
