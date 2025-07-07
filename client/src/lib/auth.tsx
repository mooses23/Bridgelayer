import { useContext } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useAuth as useAuthHook } from '../hooks/useAuth';

// Re-export the main hook for convenience
export const useAuth = useAuthHook;

// Optional: Export session hook if needed directly
export { useSession };

// Export types
export type { UseAuthResult } from '../hooks/useAuth';
