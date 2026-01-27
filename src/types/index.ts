export interface PortalColumn {
  id: string;
  width: 'col-span-1' | 'col-span-2' | 'col-span-3' | 'col-span-4' | 'col-span-5' | 'col-span-6' | 'col-span-7' | 'col-span-8' | 'col-span-9' | 'col-span-10' | 'col-span-11' | 'col-span-12';
  componentIds: string[];
}

export interface PortalRow {
  id: string;
  columns: PortalColumn[];
}

export interface PortalPageConfiguration {
  version: number;
  grid: {
    rows: PortalRow[];
  };
}
