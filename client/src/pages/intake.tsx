import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Send, AlertCircle } from "lucide-react";
import AiTriageWidget from "@/components/AiTriageWidget";

export default function Intake() {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    region: "",
    matterType: "",
    caseDescription: "",
    urgencyLevel: "",
    preferredContactMethod: "email"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Intake</h1>
          <p className="text-gray-600">Capture new client information and case details</p>
        </div>
        <UserCheck className="w-8 h-8 text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>New Client Intake Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange("clientName", e.target.value)}
                      placeholder="Enter client's full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email Address *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                      placeholder="client@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientPhone">Phone Number</Label>
                    <Input
                      id="clientPhone"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Region/County *</Label>
                    <Select onValueChange={(value) => handleInputChange("region", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="los-angeles">Los Angeles County</SelectItem>
                        <SelectItem value="orange">Orange County</SelectItem>
                        <SelectItem value="san-diego">San Diego County</SelectItem>
                        <SelectItem value="riverside">Riverside County</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="matterType">Matter Type *</Label>
                    <Select onValueChange={(value) => handleInputChange("matterType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select matter type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employment">Employment Law</SelectItem>
                        <SelectItem value="personal-injury">Personal Injury</SelectItem>
                        <SelectItem value="contract">Contract Dispute</SelectItem>
                        <SelectItem value="real-estate">Real Estate</SelectItem>
                        <SelectItem value="family">Family Law</SelectItem>
                        <SelectItem value="criminal">Criminal Defense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="urgencyLevel">Urgency Level *</Label>
                    <Select onValueChange={(value) => handleInputChange("urgencyLevel", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - No immediate deadline</SelectItem>
                        <SelectItem value="medium">Medium - Within 30 days</SelectItem>
                        <SelectItem value="high">High - Within 7 days</SelectItem>
                        <SelectItem value="urgent">Urgent - Immediate attention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="caseDescription">Case Description *</Label>
                  <Textarea
                    id="caseDescription"
                    value={formData.caseDescription}
                    onChange={(e) => handleInputChange("caseDescription", e.target.value)}
                    placeholder="Please provide a detailed description of the legal matter..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                  <Select onValueChange={(value) => handleInputChange("preferredContactMethod", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Intake Form
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <AiTriageWidget />

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Intakes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Jane Doe</p>
                  <p className="text-gray-600">Employment Law - 2 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Robert Johnson</p>
                  <p className="text-gray-600">Personal Injury - 5 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Maria Garcia</p>
                  <p className="text-gray-600">Contract Dispute - 1 day ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}