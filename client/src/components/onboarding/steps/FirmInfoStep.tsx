import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, ArrowRight } from 'lucide-react';
import { OnboardingFormData } from '../OnboardingWizard';
import * as yup from 'yup';
import { toast } from '@/lib/toast';

const firmInfoSchema = yup.object({
  firmName: yup.string().required('Firm name is required'),
  subdomain: yup.string()
    .required('Subdomain is required')
    .matches(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .min(3, 'Subdomain must be at least 3 characters')
    .max(20, 'Subdomain cannot exceed 20 characters'),
  contactEmail: yup.string()
    .email('Please enter a valid email address')
    .required('Contact email is required'),
});

interface FirmInfoStepProps {
  data: OnboardingFormData;
  updateData: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
}

export function FirmInfoStep({ data, updateData, onNext }: FirmInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subdomainChecking, setSubdomainChecking] = useState(false);

  const handleSubdomainChange = async (subdomain: string) => {
    updateData({ subdomain });

    if (subdomain.length >= 3) {
      setSubdomainChecking(true);
      try {
        const response = await fetch(`/api/onboarding/check-subdomain?subdomain=${subdomain}`);
        const result = await response.json();

        if (!result.available) {
          setErrors(prev => ({ ...prev, subdomain: 'This subdomain is already taken' }));
        } else {
          setErrors(prev => ({ ...prev, subdomain: '' }));
        }
      } catch (error) {
        console.error('Subdomain check failed:', error);
      } finally {
        setSubdomainChecking(false);
      }
    }
  };

  const handleBrandingUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      updateData({ branding: file });
    }
  };

  const handleNext = async () => {
    try {
      await firmInfoSchema.validate(data, { abortEarly: false });
      setErrors({});
      onNext();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        error.inner.forEach(err => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firmName">Firm Name *</Label>
          <Input
            id="firmName"
            value={data.firmName}
            onChange={(e) => updateData({ firmName: e.target.value })}
            placeholder="e.g., Smith & Associates Law Firm"
            className={errors.firmName ? 'border-red-500' : ''}
          />
          {errors.firmName && (
            <p className="text-sm text-red-500">{errors.firmName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subdomain">Subdomain *</Label>
          <div className="flex items-center">
            <Input
              id="subdomain"
              value={data.subdomain}
              onChange={(e) => handleSubdomainChange(e.target.value)}
              placeholder="smith-law"
              className={errors.subdomain ? 'border-red-500' : ''}
            />
            <span className="ml-2 text-sm text-gray-500">.firmsync.com</span>
          </div>
          {subdomainChecking && (
            <p className="text-sm text-blue-500">Checking availability...</p>
          )}
          {errors.subdomain && (
            <p className="text-sm text-red-500">{errors.subdomain}</p>
          )}
          <p className="text-xs text-gray-500">
            This will be your firm's unique URL
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">Contact Email *</Label>
        <Input
          id="contactEmail"
          type="email"
          value={data.contactEmail}
          onChange={(e) => updateData({ contactEmail: e.target.value })}
          placeholder="admin@smithlaw.com"
          className={errors.contactEmail ? 'border-red-500' : ''}
        />
        {errors.contactEmail && (
          <p className="text-sm text-red-500">{errors.contactEmail}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Firm Logo (Optional)</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleBrandingUpload}
            className="hidden"
            id="branding-upload"
          />
          <label
            htmlFor="branding-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              {data.branding ? data.branding.name : 'Click to upload logo'}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} className="flex items-center space-x-2">
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}