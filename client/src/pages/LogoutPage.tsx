import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, LogOut } from "lucide-react";

export default function LogoutPage() {
  console.log("[LogoutPage] loaded");
  const { clearSession } = useAuth();

  useEffect(() => {
    // Clear session and localStorage
    clearSession();
    localStorage.removeItem('auth_session');
    
    // Redirect to login after clearing session
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }, [clearSession]);

  return (
    <div id="logout-page" className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Logged Out Successfully</CardTitle>
          <CardDescription>
            You have been securely logged out of FirmSync
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <LogOut className="w-4 h-4" />
            Redirecting to login...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}