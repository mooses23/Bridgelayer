
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import type { Profile } from '@/types/database';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const hasRole = (requiredRoles: string | string[]) => {
    if (!profile) return false;
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(profile.role);
  };

  const canAccessTenant = (tenantId: number) => {
    if (!profile) return false;
    if (['super_admin', 'admin'].includes(profile.role)) return true;
    return profile.tenant_id === tenantId;
  };

  return {
    user,
    profile,
    loading,
    signOut,
    hasRole,
    canAccessTenant,
    isAuthenticated: !!user,
    isAdmin: hasRole(['super_admin', 'admin']),
    isSuperAdmin: hasRole('super_admin'),
    isTenantAdmin: hasRole('tenant_admin'),
    refreshProfile: () => (user ? fetchProfile(user.id) : Promise.resolve())
  };
}
