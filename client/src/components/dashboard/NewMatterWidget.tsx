import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function NewMatterWidget() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5 text-blue-600" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/matters/new">
            <Button className="w-full h-12 flex items-center justify-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create New Matter</span>
            </Button>
          </Link>
          <Link to="/intake/new">
            <Button variant="outline" className="w-full h-12 flex items-center justify-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>New Client Intake</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}