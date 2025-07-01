import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HexColorPicker } from 'react-colorful';
import { UnifiedOnboardingData } from '../OnboardingWizard';

interface BrandingStepProps {
  data: UnifiedOnboardingData;
  updateData: (updates: Partial<UnifiedOnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function BrandingStep({ data, updateData, onNext, onPrevious }: BrandingStepProps) {
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateData({ logo: file });
    }
  };

  const handleColorChange = (color: string, type: 'primary' | 'secondary') => {
    updateData({
      [type === 'primary' ? 'primaryColor' : 'secondaryColor']: color,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand Your Portal</h2>
        <p className="text-gray-600">
          Customize your firm's portal appearance with your logo and brand colors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="logo" className="block text-sm font-medium mb-2">
              Firm Logo
            </Label>
            <div className="flex items-center space-x-4">
              {data.logo && (
                <img
                  src={URL.createObjectURL(data.logo)}
                  alt="Logo preview"
                  className="w-16 h-16 object-contain border rounded"
                />
              )}
              <div>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: PNG or SVG, 400x400px
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Name */}
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="displayName" className="block text-sm font-medium mb-2">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={data.firmDisplayName || data.firmName}
              onChange={(e) => updateData({ firmDisplayName: e.target.value })}
              placeholder="How your firm name will be displayed"
            />
            <p className="text-xs text-gray-500 mt-1">
              This name will appear in your portal header and communications
            </p>
          </CardContent>
        </Card>

        {/* Color Selection */}
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Primary Color
                </Label>
                <HexColorPicker
                  color={data.primaryColor}
                  onChange={(color) => handleColorChange(color, 'primary')}
                />
                <Input
                  value={data.primaryColor}
                  onChange={(e) => handleColorChange(e.target.value, 'primary')}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Secondary Color
                </Label>
                <HexColorPicker
                  color={data.secondaryColor}
                  onChange={(color) => handleColorChange(color, 'secondary')}
                />
                <Input
                  value={data.secondaryColor}
                  onChange={(e) => handleColorChange(e.target.value, 'secondary')}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Brand Preview */}
            <div className="mt-6 p-4 border rounded-lg" style={{ backgroundColor: data.secondaryColor }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: data.primaryColor }}>
                Brand Preview
              </h3>
              <div className="flex items-center space-x-4">
                {data.logo && (
                  <img
                    src={URL.createObjectURL(data.logo)}
                    alt="Logo preview"
                    className="w-12 h-12 object-contain"
                  />
                )}
                <span className="text-xl font-semibold" style={{ color: data.primaryColor }}>
                  {data.firmDisplayName || data.firmName}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
