import { useEffect, useCallback } from 'react';
import { useSession } from '@/contexts/SessionContext';

// Hook to handle automatic JWT token refresh
export const useTokenRefresh = () => {
  const { token, setToken } = useSession();

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          localStorage.setItem('auth_token', data.accessToken);
          setToken(data.accessToken);
          console.log('✅ Token refreshed successfully');
          return true;
        }
      } else if (response.status === 401) {
        // Refresh token is invalid, logout user
        localStorage.removeItem('auth_token');
        setToken(null);
        window.location.href = '/login';
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
    return false;
  }, [setToken]);

  const checkTokenExpiration = useCallback(() => {
    if (!token) return;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = payload.exp;
      
      // If token expires within 5 minutes, refresh it
      const fiveMinutes = 5 * 60;
      if (expirationTime - currentTime <= fiveMinutes) {
        console.log('🔄 Token expiring soon, refreshing...');
        refreshToken();
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
    }
  }, [token, refreshToken]);

  // Check token expiration every 30 seconds
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(checkTokenExpiration, 30000);
    
    // Check immediately when token changes
    checkTokenExpiration();

    return () => clearInterval(interval);
  }, [token, checkTokenExpiration]);

  // Listen for token refresh headers from API responses
  useEffect(() => {
    const handleTokenRefreshHeader = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.refreshNeeded) {
        refreshToken();
      }
    };

    window.addEventListener('tokenRefreshNeeded', handleTokenRefreshHeader);
    return () => window.removeEventListener('tokenRefreshNeeded', handleTokenRefreshHeader);
  }, [refreshToken]);

  return { refreshToken, checkTokenExpiration };
};