import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Shield, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FirmInfoData {
  name: string;
  address: string;
  phone: string;
  email: string;
  adminName: string;
  adminEmail: string;
  timezone: string;
  acceptedTerms: boolean;
  acceptedNDA: boolean;
}

interface FirmInfoStepProps {
  data: FirmInfoData;
  onChange: (data: Partial<FirmInfoData>) => void;
}

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
];

export default function FirmInfoStep({ data, onChange }: FirmInfoStepProps) {
  const handleInputChange = (field: keyof FirmInfoData, value: string | boolean) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Firm Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Firm Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firmName">Firm Name *</Label>
            <Input
              id="firmName"
              placeholder="e.g., Smith & Associates Law Firm"
              value={data.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={!data.name ? 'border-red-300' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firmEmail">Firm Email *</Label>
            <Input
              id="firmEmail"
              type="email"
              placeholder="contact@smithlaw.com"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={!data.email ? 'border-red-300' : ''}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="firmAddress">Business Address *</Label>
            <Textarea
              id="firmAddress"
              placeholder="123 Main Street, Suite 100&#10;City, State 12345"
              value={data.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={!data.address ? 'border-red-300' : ''}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firmPhone">Phone Number</Label>
            <Input
              id="firmPhone"
              type="tel"
              placeholder="(555) 123-4567"
              value={data.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone *</Label>
            <Select
              value={data.timezone}
              onValueChange={(value) => handleInputChange('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Primary Admin Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Primary Administrator
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="adminName">Full Name *</Label>
            <Input
              id="adminName"
              placeholder="John Smith"
              value={data.adminName}
              onChange={(e) => handleInputChange('adminName', e.target.value)}
              className={!data.adminName ? 'border-red-300' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email Address *</Label>
            <Input
              id="adminEmail"
              type="email"
              placeholder="john@smithlaw.com"
              value={data.adminEmail}
              onChange={(e) => handleInputChange('adminEmail', e.target.value)}
              className={!data.adminEmail ? 'border-red-300' : ''}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legal Agreements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Legal Agreements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please review and accept the following agreements to proceed with the setup.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="acceptTerms"
                checked={data.acceptedTerms}
                onCheckedChange={(checked) => handleInputChange('acceptedTerms', !!checked)}
                className={!data.acceptedTerms ? 'border-red-300' : ''}
              />
              <div className="space-y-1">
                <Label htmlFor="acceptTerms" className="text-sm font-medium">
                  I accept the FirmSync Terms of Service *
                </Label>
                <p className="text-xs text-gray-500">
                  By checking this box, you agree to our terms of service and acceptable use policy.
                  <a href="#" className="text-blue-600 hover:underline ml-1">
                    View Terms
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="acceptNDA"
                checked={data.acceptedNDA}
                onCheckedChange={(checked) => handleInputChange('acceptedNDA', !!checked)}
                className={!data.acceptedNDA ? 'border-red-300' : ''}
              />
              <div className="space-y-1">
                <Label htmlFor="acceptNDA" className="text-sm font-medium">
                  I accept the Non-Disclosure Agreement *
                </Label>
                <p className="text-xs text-gray-500">
                  This agreement ensures confidentiality of client data and firm information.
                  <a href="#" className="text-blue-600 hover:underline ml-1">
                    View NDA
                  </a>
                </p>
              </div>
            </div>
          </div>

          {(!data.acceptedTerms || !data.acceptedNDA) && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Both agreements must be accepted to continue with the setup.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}