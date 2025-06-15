
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [firmData, setFirmData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    practiceAreas: [],
    teamSize: "",
    setupComplete: false
  });

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Firm Details
              </h2>
              <p className="text-gray-600">
                Let's start with your basic firm information.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="firmName">Firm Name</Label>
                <Input
                  id="firmName"
                  placeholder="Enter your firm name"
                  value={firmData.name}
                  onChange={(e) => setFirmData({...firmData, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your firm address"
                  value={firmData.address}
                  onChange={(e) => setFirmData({...firmData, address: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={firmData.phone}
                    onChange={(e) => setFirmData({...firmData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@firm.com"
                    value={firmData.email}
                    onChange={(e) => setFirmData({...firmData, email: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Document Types
              </h2>
              <p className="text-gray-600">
                Configure your workflows and document processing.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Practice Areas</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {["Corporate Law", "Employment Law", "Real Estate", "Litigation", "Contract Law", "Family Law"].map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox id={area} />
                      <Label htmlFor={area} className="text-sm">{area}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Team Setup
              </h2>
              <p className="text-gray-600">
                Add team members and configure permissions.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamSize">Team Size</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 people</SelectItem>
                    <SelectItem value="6-15">6-15 people</SelectItem>
                    <SelectItem value="16-50">16-50 people</SelectItem>
                    <SelectItem value="50+">50+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Review & Confirm
              </h2>
              <p className="text-gray-600">
                Review your settings and complete setup.
              </p>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p><strong>Firm:</strong> {firmData.name || "Not specified"}</p>
                  <p><strong>Address:</strong> {firmData.address || "Not specified"}</p>
                  <p><strong>Phone:</strong> {firmData.phone || "Not specified"}</p>
                  <p><strong>Email:</strong> {firmData.email || "Not specified"}</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={firmData.setupComplete}
                onCheckedChange={(checked) => setFirmData({...firmData, setupComplete: !!checked})}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {renderStep()}
      
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        <Button
          onClick={nextStep}
          disabled={currentStep === 4 && !firmData.setupComplete}
        >
          {currentStep === 4 ? "Complete Setup" : "Next"}
        </Button>
      </div>
    </div>
  );
}
