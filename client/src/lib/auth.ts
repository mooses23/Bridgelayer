import { create } from 'zustand';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type SessionStore = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
};

export const useSession = create<SessionStore>((set: any) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: (user: User) => set({ user, isAuthenticated: true }),
  logout: async () => {
    // Handle logout API call here
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null, isAuthenticated: false });
  },
}));
