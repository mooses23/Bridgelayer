import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, ArrowRight, MapPin, Phone, Mail, Globe, CheckCircle } from 'lucide-react';
import { UnifiedOnboardingData } from '../OnboardingWizard';
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
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup.string()
    .matches(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code')
    .required('ZIP code is required'),
  phone: yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
});

interface FirmInfoStepProps {
  data: UnifiedOnboardingData;
  updateData: (updates: Partial<UnifiedOnboardingData>) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

const PRACTICE_AREAS = [
  'Personal Injury',
  'Family Law',
  'Criminal Defense',
  'Corporate Law',
  'Real Estate Law',
  'Employment Law',
  'Intellectual Property',
  'Tax Law',
  'Estate Planning',
  'Bankruptcy Law',
  'Immigration Law',
  'Environmental Law'
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function FirmInfoStep({ data, updateData, onNext, onPrevious }: FirmInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [firmCode, setFirmCode] = useState<string>('');

  // Generate unique firm code using OpenAI
  const generateFirmCode = async (firmName: string) => {
    if (!firmName || firmName.length < 3) return;
    
    setGeneratingCode(true);
    try {
      const response = await fetch('/api/onboarding/generate-firm-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firmName, practiceAreas: data.practiceAreas }),
      });

      if (response.ok) {
        const result = await response.json();
        setFirmCode(result.code);
        toast.success(`Generated unique firm code: ${result.code}`);
      } else {
        console.error('Failed to generate firm code');
        toast.error('Failed to generate firm code');
      }
    } catch (error) {
      console.error('Error generating firm code:', error);
      toast.error('Error generating firm code');
    } finally {
      setGeneratingCode(false);
    }
  };

  // Auto-generate code when firm name changes
  React.useEffect(() => {
    if (data.firmName && data.firmName.length >= 3 && !firmCode) {
      const debounceTimer = setTimeout(() => {
        generateFirmCode(data.firmName);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(debounceTimer);
    }
  }, [data.firmName]);

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
        toast.error("File too large. Please select an image under 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Invalid file type. Please select an image file");
        return;
      }

      updateData({ logoFile: file });
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
          
          {/* Generated Firm Code */}
          {firmCode && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Generated Firm Code:</p>
                  <p className="text-lg font-bold text-green-900">{firmCode}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          )}
          
          {generatingCode && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-600">🤖 Generating unique firm code with AI...</p>
            </div>
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
              {data.logoFile ? data.logoFile.name : 'Click to upload logo'}
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