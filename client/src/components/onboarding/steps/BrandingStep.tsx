import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image, Palette, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BrandingData {
  logoFile: File | null;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  displayName: string;
}

interface BrandingStepProps {
  data: BrandingData;
  onChange: (data: Partial<BrandingData>) => void;
}

const PRESET_COLORS = [
  { name: "Blue", primary: "#2563eb", secondary: "#64748b" },
  { name: "Green", primary: "#059669", secondary: "#6b7280" },
  { name: "Purple", primary: "#7c3aed", secondary: "#64748b" },
  { name: "Red", primary: "#dc2626", secondary: "#6b7280" },
  { name: "Amber", primary: "#d97706", secondary: "#6b7280" },
  { name: "Slate", primary: "#475569", secondary: "#94a3b8" },
];

export default function BrandingStep({ data, onChange }: BrandingStepProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>(data.logoUrl || "");

  const handleInputChange = (field: keyof BrandingData, value: string | File | null) => {
    onChange({ [field]: value });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, or SVG).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      handleInputChange('logoUrl', result);
    };
    reader.readAsDataURL(file);

    handleInputChange('logoFile', file);
    
    toast({
      title: "Logo Uploaded",
      description: "Your logo has been uploaded successfully.",
    });
  };

  const handleColorPreset = (preset: typeof PRESET_COLORS[0]) => {
    handleInputChange('primaryColor', preset.primary);
    handleInputChange('secondaryColor', preset.secondary);
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Firm Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Upload Logo (Optional)</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <div className="space-y-2">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-20 mx-auto object-contain"
                    />
                    <p className="text-sm text-gray-600">Click to change logo</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Click to upload logo or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, or SVG (max 5MB)
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                placeholder="How your firm name should appear"
                value={data.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className={!data.displayName ? 'border-red-300' : ''}
              />
              <p className="text-sm text-gray-500">
                This will be shown in the header of your firm's dashboard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleColorPreset(preset)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  data.primaryColor === preset.primary 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-sm font-medium">{preset.name}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={data.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="w-16 h-10 p-1 border"
                />
                <Input
                  type="text"
                  value={data.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  placeholder="#2563eb"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={data.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  className="w-16 h-10 p-1 border"
                />
                <Input
                  type="text"
                  value={data.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  placeholder="#64748b"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-white">
            <div 
              className="flex items-center justify-between p-4 rounded-t-lg text-white"
              style={{ backgroundColor: data.primaryColor }}
            >
              <div className="flex items-center gap-3">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-8 w-auto bg-white p-1 rounded"
                  />
                ) : (
                  <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                    <Image className="w-4 h-4" />
                  </div>
                )}
                <span className="font-semibold">
                  {data.displayName || "Your Firm Name"}
                </span>
              </div>
              <div className="text-sm opacity-90">FirmSync</div>
            </div>
            <div className="p-4 border-l-4" style={{ borderColor: data.secondaryColor }}>
              <h3 className="font-medium mb-2">Dashboard Preview</h3>
              <p className="text-sm text-gray-600">
                This is how your firm's branding will appear in the dashboard header.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}