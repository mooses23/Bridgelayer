import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Globe, FolderTree, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreferencesData {
  defaultLanguage: string;
  practiceAreas: string[];
  caseTypes: string[];
  fileRetentionDays: number;
  auditTrailEnabled: boolean;
  folderStructure: 'by_matter' | 'by_date';
}

interface PreferencesStepProps {
  data: PreferencesData;
  onChange: (data: Partial<PreferencesData>) => void;
}

const PRACTICE_AREAS = [
  "Corporate Law", "Real Estate", "Employment Law", "Personal Injury",
  "Criminal Defense", "Family Law", "Estate Planning", "Intellectual Property",
  "Tax Law", "Immigration", "Bankruptcy", "Contract Law", "Litigation",
  "Environmental Law", "Healthcare Law", "Securities Law"
];

const CASE_TYPES = [
  "Consultation", "Document Review", "Contract Negotiation", "Litigation",
  "Transaction", "Compliance", "Due Diligence", "Mediation", "Arbitration",
  "Appeal", "Regulatory", "Investigation"
];

const RETENTION_PRESETS = [
  { label: "3 Years", days: 1095 },
  { label: "5 Years", days: 1826 },
  { label: "7 Years (Standard)", days: 2555 },
  { label: "10 Years", days: 3652 },
  { label: "15 Years", days: 5479 },
];

export default function PreferencesStep({ data, onChange }: PreferencesStepProps) {
  const handleInputChange = (field: keyof PreferencesData, value: any) => {
    onChange({ [field]: value });
  };

  const togglePracticeArea = (area: string) => {
    const newAreas = data.practiceAreas.includes(area)
      ? data.practiceAreas.filter(a => a !== area)
      : [...data.practiceAreas, area];
    handleInputChange('practiceAreas', newAreas);
  };

  const toggleCaseType = (type: string) => {
    const newTypes = data.caseTypes.includes(type)
      ? data.caseTypes.filter(t => t !== type)
      : [...data.caseTypes, type];
    handleInputChange('caseTypes', newTypes);
  };

  return (
    <div className="space-y-6">
      {/* Language & Locale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language & Locale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultLanguage">Default Language</Label>
            <Select
              value={data.defaultLanguage}
              onValueChange={(value) => handleInputChange('defaultLanguage', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Practice Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Practice Areas *
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Select the areas of law your firm practices (choose at least one):
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PRACTICE_AREAS.map((area) => (
              <div
                key={area}
                className={`p-2 border rounded cursor-pointer transition-colors ${
                  data.practiceAreas.includes(area)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => togglePracticeArea(area)}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={data.practiceAreas.includes(area)}
                    readOnly
                  />
                  <span className="text-sm">{area}</span>
                </div>
              </div>
            ))}
          </div>
          {data.practiceAreas.length === 0 && (
            <p className="text-red-600 text-sm">Please select at least one practice area.</p>
          )}
          <div className="flex flex-wrap gap-1">
            {data.practiceAreas.map((area) => (
              <Badge key={area} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Case Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="w-5 h-5" />
            Case Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Select the types of cases your firm typically handles:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CASE_TYPES.map((type) => (
              <div
                key={type}
                className={`p-2 border rounded cursor-pointer transition-colors ${
                  data.caseTypes.includes(type)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleCaseType(type)}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={data.caseTypes.includes(type)}
                    readOnly
                  />
                  <span className="text-sm">{type}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {data.caseTypes.map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            File Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileRetention">File Retention Period *</Label>
            <div className="flex gap-2 mb-2">
              {RETENTION_PRESETS.map((preset) => (
                <Button
                  key={preset.days}
                  variant={data.fileRetentionDays === preset.days ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('fileRetentionDays', preset.days)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="fileRetention"
                type="number"
                min="365"
                max="10950"
                value={data.fileRetentionDays}
                onChange={(e) => handleInputChange('fileRetentionDays', parseInt(e.target.value) || 2555)}
                className="w-32"
              />
              <span className="text-sm text-gray-600">days</span>
            </div>
            <p className="text-xs text-gray-500">
              Legal industry standard is 7 years (2,555 days). Minimum 1 year required.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Folder Organization</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="byMatter"
                  name="folderStructure"
                  checked={data.folderStructure === 'by_matter'}
                  onChange={() => handleInputChange('folderStructure', 'by_matter')}
                />
                <Label htmlFor="byMatter" className="text-sm">
                  By Matter/Case (Recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="byDate"
                  name="folderStructure"
                  checked={data.folderStructure === 'by_date'}
                  onChange={() => handleInputChange('folderStructure', 'by_date')}
                />
                <Label htmlFor="byDate" className="text-sm">
                  By Date
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auditTrail"
              checked={data.auditTrailEnabled}
              onCheckedChange={(checked) => handleInputChange('auditTrailEnabled', !!checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="auditTrail" className="text-sm font-medium">
                Enable Audit Trail (Recommended)
              </Label>
              <p className="text-xs text-gray-500">
                Track all user actions for compliance and security purposes.
                Required for many legal industry standards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}