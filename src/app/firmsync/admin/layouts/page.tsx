// filepath: src/app/firmsync/admin/layouts/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  UniqueIdentifier,
  Active,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { PortalPageConfiguration, PortalRow, PortalColumn } from '@/types';
import PortalRenderer from '@/components/PortalRenderer';
import { SortableColumn } from '@/components/layout-builder/SortableColumn';
import { WidgetCard } from '@/components/layout-builder/WidgetCard';
import { PaletteWidget } from '@/components/layout-builder/PaletteWidget';
import { PlusIcon } from '@heroicons/react/24/outline';

// Define available widgets for the palette
const WIDGET_PALETTE = [
  { id: 'BillingSummary', name: 'Billing Summary' },
  { id: 'RecentCasesTable', name: 'Recent Cases Table' },
];

const CONFIGURABLE_PAGES = ['dashboard', 'clients', 'cases', 'billing', 'calendar'];

// Helper to generate unique IDs
const generateId = () => `item-${Math.random().toString(36).substr(2, 9)}`;

export default function LayoutBuilderPage() {
  const supabase = createClientComponentClient();
  const [tenants, setTenants] = useState<{ id: number; name: string }[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>(CONFIGURABLE_PAGES[0]);
  const [layoutConfig, setLayoutConfig] = useState<PortalPageConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Active | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  // Fetch tenants on mount
  useEffect(() => {
    const fetchTenants = async () => {
      const { data } = await supabase.from('tenants').select('id, name');
      if (data) setTenants(data);
    };
    fetchTenants();
  }, [supabase]);

  // Fetch layout on tenant/page change
  useEffect(() => {
    if (!selectedTenantId) {
      setLayoutConfig(null);
      return;
    }
    const fetchLayout = async () => {
      setIsLoading(true);
      setError(null);
      const { data } = await supabase
        .from('portal_layouts')
        .select('configuration')
        .eq('tenant_id', selectedTenantId)
        .eq('page_slug', selectedPageSlug)
        .single();
      setLayoutConfig(data ? (data.configuration as PortalPageConfiguration) : { version: 1, grid: { rows: [] } });
      setIsLoading(false);
    };
    fetchLayout();
  }, [selectedTenantId, selectedPageSlug, supabase]);

  const handleSaveLayout = async () => {
    if (!selectedTenantId || !layoutConfig) return;
    setIsSaving(true);
    setError(null);
    const { error } = await supabase
      .from('portal_layouts')
      .upsert(
        {
          tenant_id: selectedTenantId,
          page_slug: selectedPageSlug,
          configuration: layoutConfig,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id, page_slug' }
      );
    if (error) setError(`Failed to save layout: ${error.message}`);
    else alert('Layout saved successfully!');
    setIsSaving(false);
  };

  const findContainer = (id: UniqueIdentifier) => {
    if (id.toString().startsWith('col-')) {
      return id;
    }
    for (const row of layoutConfig?.grid.rows || []) {
      for (const col of row.columns) {
        if (col.componentIds.includes(id.toString())) {
          return `col-${row.id}-${col.id}`;
        }
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActive(event.active);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
  
    const activeId = active.id;
    const overId = over.id;
  
    // Don't do anything if dragging over the same item
    if (activeId === overId) return;
  
    const isActiveAWidget = active.data.current?.type === 'widget';
    const isOverAWidget = over.data.current?.type === 'widget';
  
    if (!isActiveAWidget) return;
  
    // Dropping a widget over another widget
    if (isActiveAWidget && isOverAWidget) {
      setLayoutConfig((prev) => {
        if (!prev) return null;
        const activeContainerId = findContainer(activeId);
        const overContainerId = findContainer(overId);
  
        if (!activeContainerId || !overContainerId || activeContainerId === overContainerId) {
          return prev;
        }
  
        const newConfig = JSON.parse(JSON.stringify(prev));
        const [activeRowIndex, activeColIndex] = findColumnIndices(newConfig, activeContainerId.toString());
        const [overRowIndex, overColIndex] = findColumnIndices(newConfig, overContainerId.toString());
  
        const activeItems = newConfig.grid.rows[activeRowIndex].columns[activeColIndex].componentIds;
        const overItems = newConfig.grid.rows[overRowIndex].columns[overColIndex].componentIds;
  
        const activeItemIndex = activeItems.indexOf(activeId);
        const overItemIndex = overItems.indexOf(overId);
  
        const [movedItem] = activeItems.splice(activeItemIndex, 1);
        overItems.splice(overItemIndex, 0, movedItem);
  
        return newConfig;
      });
    }
  
    // Dropping a widget over a column
    const isOverAColumn = over.data.current?.type === 'column';
    if (isActiveAWidget && isOverAColumn) {
        setLayoutConfig((prev) => {
            if (!prev) return null;
            const activeContainerId = findContainer(activeId);
            const overContainerId = overId;
    
            if (!activeContainerId || activeContainerId === overContainerId) {
                return prev;
            }
    
            const newConfig = JSON.parse(JSON.stringify(prev));
            const [activeRowIndex, activeColIndex] = findColumnIndices(newConfig, activeContainerId.toString());
            const [overRowIndex, overColIndex] = findColumnIndices(newConfig, overContainerId.toString());
    
            const activeItems = newConfig.grid.rows[activeRowIndex].columns[activeColIndex].componentIds;
            const overItems = newConfig.grid.rows[overRowIndex].columns[overColIndex].componentIds;
    
            const activeItemIndex = activeItems.indexOf(activeId);
    
            // Move to end of new column
            const [movedItem] = activeItems.splice(activeItemIndex, 1);
            overItems.push(movedItem);
    
            return newConfig;
        });
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActive(null);
  
    if (!over) {
      return;
    }
  
    const activeId = active.id.toString();
    const overId = over.id.toString();
  
    // Scenario 1: Dropping a new widget from the palette
    if (active.data.current?.type === 'paletteWidget') {
      const widgetType = active.data.current.id.replace('PALETTE-', '');
      let targetColumnId = overId;

      // If dropped on a widget, find its container column
      if (over.data.current?.type === 'widget') {
        const container = findContainer(overId);
        if (container) {
            targetColumnId = container.toString();
        }
      }

      if (targetColumnId && targetColumnId.startsWith('col-')) {
        setLayoutConfig(prev => {
          if (!prev) return null;
          const newConfig = JSON.parse(JSON.stringify(prev));
          const [rowIndex, colIndex] = findColumnIndices(newConfig, targetColumnId);
          if (rowIndex !== -1) {
            // Add new widget with a unique ID
            newConfig.grid.rows[rowIndex].columns[colIndex].componentIds.push(`${widgetType}-${generateId()}`);
          }
          return newConfig;
        });
      }
      return;
    }
  
    // Scenario 2: Reordering a widget
    if (active.data.current?.type === 'widget' && over) {
      const activeContainerId = findContainer(activeId);
      const overContainerId = over.data.current?.type === 'column' ? overId : findContainer(overId);

      if (!activeContainerId || !overContainerId) return;

      // Reordering within the same column
      if (activeContainerId === overContainerId) {
        setLayoutConfig(prev => {
          if (!prev) return null;
          const newConfig = JSON.parse(JSON.stringify(prev));
          const [rowIndex, colIndex] = findColumnIndices(newConfig, activeContainerId.toString());
          if (rowIndex !== -1) {
            const items = newConfig.grid.rows[rowIndex].columns[colIndex].componentIds;
            const oldIndex = items.indexOf(activeId);
            // If dropping on a widget, find its index, otherwise drop at the end
            const newIndex = over.data.current?.type === 'widget' ? items.indexOf(overId) : items.length -1;
            if (oldIndex !== newIndex) {
                newConfig.grid.rows[rowIndex].columns[colIndex].componentIds = arrayMove(items, oldIndex, newIndex);
            }
          }
          return newConfig;
        });
      } 
      // Moving to a different column is handled by onDragOver
    }
  };

  const findColumnIndices = (config: PortalPageConfiguration, containerId: string): [number, number] => {
    const parts = containerId.split('-');
    const rowId = parts[1];
    const colId = parts[2];
    for (let i = 0; i < config.grid.rows.length; i++) {
      for (let j = 0; j < config.grid.rows[i].columns.length; j++) {
        if (config.grid.rows[i].id === rowId && config.grid.rows[i].columns[j].id === colId) {
          return [i, j];
        }
      }
    }
    return [-1, -1];
  };

  const addRow = () => {
    setLayoutConfig(prev => {
      if (!prev) return null;
      const newRow: PortalRow = {
        id: generateId(),
        columns: [{ id: generateId(), width: 'col-span-12', componentIds: [] }],
      };
      return { ...prev, grid: { rows: [...prev.grid.rows, newRow] } };
    });
  };

  const addColumn = (rowIndex: number) => {
    setLayoutConfig(prev => {
        if (!prev) return null;
        const newConfig = JSON.parse(JSON.stringify(prev));
        const newColumn: PortalColumn = { id: generateId(), width: 'col-span-4', componentIds: [] };
        newConfig.grid.rows[rowIndex].columns.push(newColumn);
        // Adjust widths - this is a simple example
        const numCols = newConfig.grid.rows[rowIndex].columns.length;
        const newWidthValue = Math.max(1, Math.floor(12 / numCols));
        const newWidth = `col-span-${newWidthValue}`;
        newConfig.grid.rows[rowIndex].columns.forEach((c: PortalColumn) => c.width = newWidth);
        return newConfig;
    });
  };

  const removeWidget = (widgetId: UniqueIdentifier) => {
    setLayoutConfig(prev => {
        if (!prev) return null;
        const newConfig = JSON.parse(JSON.stringify(prev));
        const containerId = findContainer(widgetId);
        if(containerId) {
            const [rowIndex, colIndex] = findColumnIndices(newConfig, containerId.toString());
            if (rowIndex !== -1) {
                const items = newConfig.grid.rows[rowIndex].columns[colIndex].componentIds;
                newConfig.grid.rows[rowIndex].columns[colIndex].componentIds = items.filter((id:string) => id !== widgetId);
            }
        }
        return newConfig;
    });
  };

  const activeWidget = useMemo(() => {
    if (!active) return null;
    const idStr = active.id.toString();
    if (active.data.current?.type === 'paletteWidget') {
        return { id: idStr, name: active.data.current.name };
    }
    // For existing widgets, we might need to find their type from the ID
    const widgetType = idStr.split('-')[0];
    const paletteItem = WIDGET_PALETTE.find(w => w.id === widgetType);
    return { id: idStr, name: paletteItem?.name || 'Widget' };
  }, [active]);


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4">
          <h1 className="text-2xl font-bold text-gray-800">Portal Layout Builder</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <select
              onChange={(e) => setSelectedTenantId(Number(e.target.value))}
              value={selectedTenantId || ''}
              className="w-full p-2 border rounded"
              aria-label="Select Tenant"
            >
              <option value="" disabled>-- Select Tenant --</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select
              onChange={(e) => setSelectedPageSlug(e.target.value)}
              value={selectedPageSlug}
              className="w-full p-2 border rounded"
              aria-label="Select Page"
            >
              {CONFIGURABLE_PAGES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <button onClick={handleSaveLayout} disabled={isSaving || !selectedTenantId} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
              {isSaving ? 'Saving...' : 'Save Layout'}
            </button>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-12 gap-6">
              {/* Layout Area */}
              <div className="col-span-9">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Layout Canvas</h2>
                    <button onClick={addRow} className="flex items-center bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                      <PlusIcon className="h-5 w-5 mr-1" /> Add Row
                    </button>
                  </div>
                  <div className="space-y-4 min-h-[400px] bg-gray-100 p-4 rounded">
                    {isLoading && <p>Loading layout...</p>}
                    {layoutConfig && layoutConfig.grid.rows.map((row, rowIndex) => (
                      <div key={row.id} className="p-2 rounded-lg bg-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Row</span>
                            <button onClick={() => addColumn(rowIndex)} className="flex items-center bg-blue-200 text-blue-800 px-2 py-1 text-xs rounded hover:bg-blue-300">
                                <PlusIcon className="h-4 w-4 mr-1" /> Add Column
                            </button>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                          {row.columns.map((col) => (
                            <SortableColumn key={col.id} id={`col-${row.id}-${col.id}`} width={col.width} items={col.componentIds}>
                                {col.componentIds.map(id => (
                                  <WidgetCard key={id} id={id} onRemove={removeWidget} />
                                ))}
                            </SortableColumn>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Live Preview */}
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Live Preview</h2>
                    <div className="border-4 border-dashed border-gray-300 rounded-lg p-4">
                        {layoutConfig ? <PortalRenderer config={layoutConfig} /> : <p className="text-center text-gray-500">Select a tenant and page to see a preview.</p>}
                    </div>
                </div>
              </div>

              {/* Widget Palette */}
              <div className="col-span-3">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Widgets</h2>
                  <div className="space-y-2">
                    {WIDGET_PALETTE.map(widget => (
                      <PaletteWidget key={widget.id} id={`PALETTE-${widget.id}`} name={widget.name} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DragOverlay>
              {active && activeWidget ? (
                <WidgetCard id={activeWidget.id} name={activeWidget.name} isOverlay />
              ) : null}
            </DragOverlay>
          </DndContext>
        </main>
      </div>
    </div>
  );
}
