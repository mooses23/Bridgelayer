import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Download } from "lucide-react";
import { Link } from "react-router-dom";

interface FormTemplate {
  id: number;
  name: string;
  category: string;
  description: string;
  usage: number;
  lastUsed: string;
}

interface FormsAccessWidgetProps {
  topForms: FormTemplate[];
}

export default function FormsAccessWidget({ topForms }: FormsAccessWidgetProps) {
  const defaultForms = [
    { id: 1, name: "Client Intake Form", category: "Intake", description: "Standard client information collection", usage: 45, lastUsed: "Today" },
    { id: 2, name: "Retainer Agreement", category: "Contracts", description: "Legal services agreement template", usage: 32, lastUsed: "Yesterday" },
    { id: 3, name: "Discovery Request", category: "Litigation", description: "Document production request", usage: 18, lastUsed: "3 days ago" },
    { id: 4, name: "Motion to Dismiss", category: "Litigation", description: "Standard motion template", usage: 12, lastUsed: "1 week ago" },
    { id: 5, name: "Settlement Agreement", category: "Contracts", description: "Dispute resolution template", usage: 8, lastUsed: "2 weeks ago" }
  ];

  const forms = topForms.length > 0 ? topForms : defaultForms;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Quick Forms</span>
          </CardTitle>
          <Link to="/forms">
            <Button variant="ghost" size="sm">
              All Forms
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {forms.slice(0, 5).map((form) => (
            <div key={form.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {form.name}
                  </p>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {form.category}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{form.description}</p>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>Used {form.usage} times</span>
                  <span>•</span>
                  <span>Last used {form.lastUsed}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="h-3 w-3" />
                </Button>
                <Link to={`/forms/${form.id}`}>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t">
          <Link to="/forms/new">
            <Button variant="outline" size="sm" className="w-full">
              Create Custom Form
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}