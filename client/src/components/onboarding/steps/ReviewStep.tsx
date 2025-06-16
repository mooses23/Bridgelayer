import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit, AlertCircle, Building, Palette, Settings, Link2, FileText } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

interface ReviewStepProps {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
}

export default function ReviewStep({ data }: ReviewStepProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompletionStatus = () => {
    const required = [
      data.firmInfo.name,
      data.firmInfo.address,
      data.firmInfo.email,
      data.firmInfo.adminName,
      data.firmInfo.adminEmail,
      data.firmInfo.acceptedTerms,
      data.firmInfo.acceptedNDA,
      data.branding.displayName,
      data.preferences.practiceAreas.length > 0
    ];

    const completed = required.filter(Boolean).length;
    const total = required.length;
    
    return { completed, total, isComplete: completed === total };
  };

  const status = getCompletionStatus();

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card className={status.isComplete ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {status.isComplete ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            )}
            <div>
              <h3 className="font-semibold">
                {status.isComplete ? "Ready to Create Firm" : "Setup Incomplete"}
              </h3>
              <p className="text-sm text-gray-600">
                {status.isComplete 
                  ? "All required information has been provided. You're ready to create your firm."
                  : `${status.completed} of ${status.total} required items completed.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Firm Information Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Firm Information
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Firm Name</label>
              <p className="font-medium">{data.firmInfo.name || "Not specified"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="font-medium">{data.firmInfo.email || "Not specified"}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="font-medium">{data.firmInfo.address || "Not specified"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Primary Admin</label>
              <p className="font-medium">{data.firmInfo.adminName || "Not specified"}</p>
              <p className="text-sm text-gray-600">{data.firmInfo.adminEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Timezone</label>
              <p className="font-medium">{data.firmInfo.timezone}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <label className="text-sm font-medium text-gray-500">Legal Agreements</label>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-2">
                {data.firmInfo.acceptedTerms ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">Terms of Service</span>
              </div>
              <div className="flex items-center gap-2">
                {data.firmInfo.acceptedNDA ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">NDA</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Branding & Identity
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Display Name</label>
              <p className="font-medium">{data.branding.displayName || "Not specified"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Logo</label>
              <div className="flex items-center gap-2">
                {data.branding.logoUrl ? (
                  <>
                    <img
                      src={data.branding.logoUrl}
                      alt="Logo"
                      className="w-8 h-8 object-contain border rounded"
                    />
                    <span className="text-sm text-green-600">Uploaded</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">No logo uploaded</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Primary Color</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: data.branding.primaryColor }}
                />
                <span className="font-mono text-sm">{data.branding.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Secondary Color</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: data.branding.secondaryColor }}
                />
                <span className="font-mono text-sm">{data.branding.secondaryColor}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Preferences & Settings
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Practice Areas</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.preferences.practiceAreas.length > 0 ? (
                  data.preferences.practiceAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-red-600">None selected</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Case Types</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.preferences.caseTypes.length > 0 ? (
                  data.preferences.caseTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">None selected</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">File Retention</label>
              <p className="font-medium">
                {data.preferences.fileRetentionDays} days
                {data.preferences.fileRetentionDays === 2555 && (
                  <span className="text-sm text-gray-500 ml-1">(7 years - standard)</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Folder Structure</label>
              <p className="font-medium">
                {data.preferences.folderStructure === 'by_matter' ? 'By Matter/Case' : 'By Date'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Audit Trail</label>
              <div className="flex items-center gap-2">
                {data.preferences.auditTrailEnabled ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Enabled</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm">Disabled</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Integrations
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.integrations.selectedIntegrations.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {data.integrations.selectedIntegrations.length} integration(s) selected:
              </p>
              <div className="flex flex-wrap gap-2">
                {data.integrations.selectedIntegrations.map((integration) => {
                  const hasCredentials = data.integrations.integrationCredentials[integration];
                  return (
                    <Badge key={integration} variant="secondary" className="flex items-center gap-1">
                      {integration.replace('_', ' ')}
                      {hasCredentials ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No integrations selected</p>
          )}
        </CardContent>
      </Card>

      {/* Templates Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Templates
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.templates.uploadedTemplates.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {data.templates.uploadedTemplates.length} template(s) uploaded:
              </p>
              <div className="space-y-1">
                {data.templates.uploadedTemplates.map((template, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{template.file.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {template.templateType.replace('_', ' ')}
                      </Badge>
                      <span className="text-gray-500 text-xs">
                        {formatFileSize(template.file.size)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No templates uploaded</p>
          )}
        </CardContent>
      </Card>

      {/* Final Confirmation */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Ready to Create Your Firm</h3>
            <p className="text-sm text-gray-600">
              Once you click "Complete Setup", your firm will be created and configured with all the information above.
              You'll be able to modify these settings later from your admin dashboard.
            </p>
            {!status.isComplete && (
              <p className="text-sm text-amber-700 font-medium">
                Please complete all required fields before proceeding.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}