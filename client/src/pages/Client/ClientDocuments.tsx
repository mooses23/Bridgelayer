import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Eye, Search, FileText, Calendar, User } from "lucide-react";
import { useState } from "react";

export default function ClientDocuments() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock document data for client view
  const documents = [
    {
      id: 1,
      name: "Employment Contract - John Doe.pdf",
      type: "Contract",
      uploadDate: "2025-01-15",
      status: "final",
      size: "245 KB",
      uploadedBy: "Sarah Johnson, Esq."
    },
    {
      id: 2,
      name: "Non-Disclosure Agreement.pdf",
      type: "NDA",
      uploadDate: "2025-01-20",
      status: "draft",
      size: "180 KB",
      uploadedBy: "Michael Chen, Paralegal"
    },
    {
      id: 3,
      name: "Settlement Agreement - Case #2024-567.pdf",
      type: "Settlement",
      uploadDate: "2025-01-25",
      status: "review",
      size: "420 KB",
      uploadedBy: "Sarah Johnson, Esq."
    },
    {
      id: 4,
      name: "Property Lease Agreement.pdf",
      type: "Lease",
      uploadDate: "2025-01-28",
      status: "final",
      size: "312 KB",
      uploadedBy: "David Wilson, Attorney"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'final': return 'Final';
      case 'draft': return 'Draft';
      case 'review': return 'Under Review';
      default: return status;
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Available for download</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Documents</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Ready to download</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by document name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No documents match your search." : "No documents available."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">{document.name}</h3>
                      <Badge className={getStatusColor(document.status)}>
                        {getStatusLabel(document.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 ml-8">
                      <span>Type: {document.type}</span>
                      <span>Size: {document.size}</span>
                      <span>Uploaded: {document.uploadDate}</span>
                    </div>
                    <div className="text-sm text-gray-400 ml-8 mt-1">
                      Uploaded by: {document.uploadedBy}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}