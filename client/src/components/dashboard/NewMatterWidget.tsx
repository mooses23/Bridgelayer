import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Clock, DollarSign } from "lucide-react";

export default function NewMatterWidget() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5 text-blue-600" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="flex flex-col items-center space-y-2 h-auto py-4">
            <FileText className="h-6 w-6" />
            <span className="text-sm">New Matter</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
            <Clock className="h-6 w-6" />
            <span className="text-sm">Log Time</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
            <DollarSign className="h-6 w-6" />
            <span className="text-sm">Create Invoice</span>
          </Button>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600 mb-2">Recent Templates</div>
          <div className="space-y-1">
            <div className="text-xs text-blue-600 hover:underline cursor-pointer">Employment Agreement Template</div>
            <div className="text-xs text-blue-600 hover:underline cursor-pointer">NDA Standard Form</div>
            <div className="text-xs text-blue-600 hover:underline cursor-pointer">Contract Amendment Template</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}