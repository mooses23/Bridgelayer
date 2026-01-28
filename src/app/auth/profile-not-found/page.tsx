
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function ProfileNotFoundPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };

    checkProfile();
  }, [supabase]);

  const handleRetry = async () => {
    setIsChecking(true);
    setRetryCount(prev => prev + 1);
    
    try {
      // Use the API endpoint to check/create profile
      const response = await fetch('/api/auth/provision-profile', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Profile exists or was just created, redirect to home
        setTimeout(() => router.push('/'), 500);
        return;
      } else if (response.status === 401) {
        // Not authenticated
        console.log('User not authenticated, redirecting to login');
        router.push('/login');
      } else {
        console.error('Error provisioning profile:', data.error);
      }
    } catch (error) {
      console.error('Error in profile retry:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getButtonText = (): string => {
    if (isChecking) {
      return 'Checking...';
    }
    if (retryCount > 0) {
      return 'Retry Again';
    }
    return 'Check Profile Now';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            Profile Setup Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your account is being set up
          </p>
        </div>

        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-7-4a1 1 0 11-2 0 1 1 0 012 0z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Email:</strong> {userEmail || 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p>
              Your profile is being automatically created. This usually takes just a moment.
            </p>
            {retryCount > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Retry attempt: {retryCount}
              </p>
            )}
          </div>

          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {getButtonText()}
          </button>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign Out
          </button>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 text-center">
            If you continue to see this page, please contact support at{' '}
            <a href="mailto:support@bridgelayer.com" className="text-blue-600 hover:text-blue-700">
              support@bridgelayer.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
