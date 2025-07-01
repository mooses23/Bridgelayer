import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const firmSetupSchema = z.object({
  name: z.string().min(2, 'Firm name is required'),
  email: z.string().email('Invalid email address'),
  openaiApiKey: z.string().min(1, 'OpenAI API key is required')
    .regex(/^sk-[a-zA-Z0-9]{48}$/, 'Invalid OpenAI API key format'),
  practiceAreas: z.array(z.string()).min(1, 'Select at least one practice area'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

type FirmSetupData = z.infer<typeof firmSetupSchema>;

const PRACTICE_AREAS = [
  'Corporate Law',
  'Intellectual Property',
  'Real Estate',
  'Litigation',
  'Employment Law',
  'Tax Law',
  'Family Law',
  'Criminal Law',
  'Immigration Law',
  'Environmental Law',
];

const FirmSetup: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FirmSetupData>({
    resolver: zodResolver(firmSetupSchema),
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = async (data: FirmSetupData) => {
    try {
      const response = await fetch('/api/admin/onboarding/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create firm');
      }

      // Store onboarding code in session/context
      localStorage.setItem('onboardingCode', result.code);

      toast({
        title: 'Firm Created',
        description: 'Successfully created firm and generated onboarding code',
      });

      // Move to next step
      navigate('/admin/onboarding/integrations');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Firm Name</label>
              <Input
                {...register('name')}
                placeholder="Enter firm name"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                {...register('email')}
                type="email"
                placeholder="admin@firmname.com"
                error={errors.email?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
              <Input
                {...register('openaiApiKey')}
                type="password"
                placeholder="sk-..."
                error={errors.openaiApiKey?.message}
              />
              <p className="mt-1 text-xs text-gray-500">
                The firm's OpenAI API key for document processing
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Practice Areas</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {PRACTICE_AREAS.map(area => (
              <label key={area} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={area}
                  {...register('practiceAreas')}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">{area}</span>
              </label>
            ))}
          </div>
          {errors.practiceAreas && (
            <p className="mt-2 text-sm text-red-600">{errors.practiceAreas.message}</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <Input
                {...register('website')}
                type="url"
                placeholder="https://firmname.com"
                error={errors.website?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                {...register('description')}
                placeholder="Brief description of the firm..."
                error={errors.description?.message}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Firm & Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FirmSetup;
