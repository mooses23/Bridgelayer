import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    // Clear any authentication tokens/sessions
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login after a brief delay
    const timer = setTimeout(() => {
      window.location.href = "/login";
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Signing you out...
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              You have been successfully logged out
            </p>
            <div className="mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}