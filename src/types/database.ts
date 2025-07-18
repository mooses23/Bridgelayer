export interface Profile {
  id: string;
  tenant_id: number | null;
  vertical_id: number;
  role: 'super_admin' | 'admin' | 'tenant_admin' | 'tenant_user';
  display_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Vertical {
  id: number;
  name: string;
  type: 'standalone' | 'regenerative';
  category: string;
  schema_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: number;
  vertical_id: number;
  name: string;
  subdomain: string;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      verticals: {
        Row: Vertical;
        Insert: Omit<Vertical, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Vertical, 'id' | 'created_at' | 'updated_at'>>;
      };
      tenants: {
        Row: Tenant;
        Insert: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tenant, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
