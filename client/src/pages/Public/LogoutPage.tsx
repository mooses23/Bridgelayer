
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

export default function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    // Clear authentication and redirect
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Signing you out...
              </h2>
              <p className="text-gray-600">
                You are being redirected to the login page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
