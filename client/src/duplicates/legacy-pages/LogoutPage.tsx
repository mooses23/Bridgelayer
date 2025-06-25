import { useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';

export default function LogoutPage() {
  const { logout } = useSession();

  useEffect(() => {
    // Perform logout and redirect
    const performLogout = async () => {
      await logout();
      // Redirect to login page
      window.location.href = '/login';
    };
    
    performLogout();
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Signing out...</h2>
        <p className="text-gray-600">Please wait while we securely log you out.</p>
      </div>
    </div>
  );
}