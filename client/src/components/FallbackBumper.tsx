import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, Users, AlertTriangle, ArrowRight } from 'lucide-react';

interface FallbackBumperProps {
  title?: string;
  message?: string;
  showRegister?: boolean;
  showContact?: boolean;
}

export default function FallbackBumper({ 
  title = "No Firm Configuration Found",
  message = "This subdomain doesn't have a registered firm yet.",
  showRegister = true,
  showContact = true
}: FallbackBumperProps) {
  
  const handleRegister = () => {
    window.location.href = '/register';
  };

  const handleLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            FirmSync Legal Document Management
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Setup Required
            </CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                To access FirmSync, you need either an existing firm account or you can register a new firm.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {showRegister && (
                <Button 
                  onClick={handleRegister}
                  className="w-full"
                  size="lg"
                >
                  <Building className="mr-2 h-4 w-4" />
                  Register New Firm
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              <Button 
                onClick={handleLogin}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Users className="mr-2 h-4 w-4" />
                Sign In to Existing Firm
              </Button>
            </div>

            {showContact && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Need help? Contact{' '}
                  <a 
                    href="mailto:support@firmsync.com" 
                    className="text-blue-600 hover:text-blue-500"
                  >
                    support@firmsync.com
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            Powered by FirmSync - Legal Document Workflow Platform
          </p>
        </div>
      </div>
    </div>
  );
}