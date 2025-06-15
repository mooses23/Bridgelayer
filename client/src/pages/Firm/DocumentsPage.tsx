
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
        <p className="text-muted-foreground">
          Manage and analyze legal documents
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Document management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
