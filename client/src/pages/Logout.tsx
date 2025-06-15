import { useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';

function Logout() {
  const { logout } = useSession();

  useEffect(() => {
    console.log('Logout page loaded');
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Signing out...</h1>
        <p className="text-gray-600">Please wait while we log you out securely.</p>
      </div>
    </div>
  );
}

export default Logout;