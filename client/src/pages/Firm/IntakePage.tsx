
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IntakePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Intake Management</h1>
        <p className="text-muted-foreground">
          Manage client intake forms and processes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Intake</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Intake management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
