
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GhostModePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ghost Mode</h1>
        <p className="text-muted-foreground">
          Access any tenant's environment for support and debugging
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ghost Mode Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Ghost mode functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
