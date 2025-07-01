import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { File, FolderTree, AlertCircle } from 'lucide-react';
import { UnifiedOnboardingData } from '../OnboardingWizard';

interface DocumentTemplatesStepProps {
  data: UnifiedOnboardingData;
  updateData: (updates: Partial<UnifiedOnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const CASE_TYPES = [
  'Litigation',
  'Corporate',
  'Real Estate',
  'Estate Planning',
  'Family Law',
  'Criminal Defense',
  'Immigration',
  'Intellectual Property',
];

export function DocumentTemplatesStep({ data, updateData, onNext, onPrevious }: DocumentTemplatesStepProps) {
  const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    updateData({ documentTemplates: [...data.documentTemplates, ...files] });
  };

  const removeTemplate = (index: number) => {
    updateData({
      documentTemplates: data.documentTemplates.filter((_, i) => i !== index)
    });
  };

  const toggleFolderStructure = (type: 'byMatter' | 'byDate') => {
    updateData({
      folderStructure: {
        ...data.folderStructure,
        [type]: !data.folderStructure[type]
      }
    });
  };

  const toggleCaseType = (caseType: string) => {
    const updatedCaseTypes = data.caseTypes.includes(caseType)
      ? data.caseTypes.filter(type => type !== caseType)
      : [...data.caseTypes, caseType];
    updateData({ caseTypes: updatedCaseTypes });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Document Templates &amp; Preferences
        </h2>
        <p className="text-gray-600">
          Upload your document templates and configure file management settings
        </p>
      </div>

      {/* Template Upload */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Document Templates</h3>
          <Input
            type="file"
            multiple
            accept=".doc,.docx,.pdf,.txt"
            onChange={handleTemplateUpload}
            className="mb-4"
          />
          
          {/* Template List */}
          <div className="space-y-2">
            {data.documentTemplates.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex items-center space-x-2">
                  <File className="w-4 h-4" />
                  <span>{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTemplate(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Management Settings */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">File Management</h3>
          
          <div className="space-y-6">
            {/* Language Selection */}
            <div>
              <Label>Default Language</Label>
              <Select
                value={data.defaultLanguage}
                onValueChange={(value) => updateData({ defaultLanguage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Retention */}
            <div>
              <Label>File Retention Period (Days)</Label>
              <Input
                type="number"
                min="30"
                value={data.fileRetentionDays}
                onChange={(e) => updateData({ fileRetentionDays: parseInt(e.target.value) })}
              />
              <p className="text-sm text-gray-500 mt-1">
                Minimum 30 days required for compliance
              </p>
            </div>

            {/* Audit Trail */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Audit Trail</Label>
                <p className="text-sm text-gray-500">
                  Track all document access and changes
                </p>
              </div>
              <Switch
                checked={data.auditTrailEnabled}
                onCheckedChange={(checked) => updateData({ auditTrailEnabled: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Folder Structure */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <FolderTree className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Folder Structure</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Organize by Matter</Label>
                <p className="text-sm text-gray-500">Create folders per legal matter</p>
              </div>
              <Switch
                checked={data.folderStructure.byMatter}
                onCheckedChange={() => toggleFolderStructure('byMatter')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Organize by Date</Label>
                <p className="text-sm text-gray-500">Create folders by year/month</p>
              </div>
              <Switch
                checked={data.folderStructure.byDate}
                onCheckedChange={() => toggleFolderStructure('byDate')}
              />
            </div>

            {!data.folderStructure.byMatter && !data.folderStructure.byDate && (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Please select at least one folder organization method
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Case Types */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Case Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CASE_TYPES.map((caseType) => (
              <Button
                key={caseType}
                variant={data.caseTypes.includes(caseType) ? 'default' : 'outline'}
                onClick={() => toggleCaseType(caseType)}
                className="h-auto py-2"
              >
                {caseType}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!data.folderStructure.byMatter && !data.folderStructure.byDate}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
