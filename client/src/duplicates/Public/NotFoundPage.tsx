import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl font-bold text-muted-foreground mb-4">404</div>
          <CardTitle className="text-xl">Page not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col space-y-2">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
          
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              If you think this is an error, please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}