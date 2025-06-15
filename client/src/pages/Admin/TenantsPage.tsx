
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
        <p className="text-muted-foreground">
          Manage all tenant firms and their configurations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Tenant management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
