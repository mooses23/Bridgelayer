
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientInvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">
          View and manage your invoices
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Invoice management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
