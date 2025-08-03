import React from 'react';
import { PortalPageConfiguration } from '@/types';

// Import the widgets from our foundry
import BillingSummary from './portal-widgets/BillingSummary';
import RecentCasesTable from './portal-widgets/RecentCasesTable';

// The Component Map translates string IDs from the database/config
// into actual, importable React components.
const componentMap: { [key: string]: React.ComponentType } = {
  BillingSummary,
  RecentCasesTable,
  // As we create more widgets, we will add them here.
};

interface PortalRendererProps {
  configuration: PortalPageConfiguration;
}

const PortalRenderer: React.FC<PortalRendererProps> = ({ configuration }) => {
  if (!configuration || !configuration.grid) {
    return <div>Page configuration is missing or invalid.</div>;
  }

  return (
    <div className="space-y-6">
      {configuration.grid.rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-12 gap-6">
          {row.columns.map((column, colIndex) => {
            // The `width` property from our config is a Tailwind class name
            const columnClass = column.width; 
            return (
              <div key={colIndex} className={`${columnClass} space-y-6`}>
                {column.componentIds.map((componentId) => {
                  const Component = componentMap[componentId];
                  return Component ? <Component key={componentId} /> : <div key={componentId}>Unknown component: {componentId}</div>;
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default PortalRenderer;
