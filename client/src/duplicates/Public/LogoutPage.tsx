import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function LogoutPage() {
  const { logout } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Always redirect to login after logout attempt
        navigate('/login', { replace: true });
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Logging out...</p>
      </div>
    </div>
  );
}