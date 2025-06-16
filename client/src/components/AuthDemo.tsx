import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDemo() {
  const { user, isLoading: loading, logout } = useSession();
  const firm = user?.firm;

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading authentication...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Auth Context Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">User Info:</h3>
            {user ? (
              <div className="bg-green-50 p-3 rounded">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Firm ID:</strong> {user.firmId || 'None'}</p>
              </div>
            ) : (
              <div className="bg-red-50 p-3 rounded">
                <p>No user logged in</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold">Firm Info:</h3>
            {firm ? (
              <div className="bg-blue-50 p-3 rounded">
                <p><strong>ID:</strong> {firm.id}</p>
                <p><strong>Onboarded:</strong> {firm.onboarded ? 'Yes' : 'No'}</p>
                <p><strong>Jurisdiction:</strong> {firm.jurisdiction}</p>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded">
                <p>No firm data</p>
              </div>
            )}
          </div>

          {user && (
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}