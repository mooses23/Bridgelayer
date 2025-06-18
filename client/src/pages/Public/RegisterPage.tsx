import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building, User, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  firmName: z.string().min(2, 'Firm name must be at least 2 characters'),
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(30, 'Subdomain must be less than 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.adminPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firmName: '',
      subdomain: '',
      firstName: '',
      lastName: '',
      adminEmail: '',
      adminPassword: '',
      confirmPassword: ''
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful",
        description: `Welcome to FirmSync! Setting up ${data.firm.name}...`,
      });
      
      // Redirect to onboarding
      setTimeout(() => {
        window.location.href = data.redirectTo || '/onboarding';
      }, 1000);
    },
    onError: (error: Error) => {
      setRegistrationError(error.message);
    }
  });

  const onSubmit = (data: RegisterForm) => {
    setRegistrationError(null);
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Building className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Start Your Legal Practice
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join FirmSync and streamline your document workflow
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Firm Account</CardTitle>
            <CardDescription>
              Set up your legal practice in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {registrationError && (
                <Alert variant="destructive">
                  <AlertDescription>{registrationError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="firmName">
                  <Building className="inline w-4 h-4 mr-1" />
                  Firm Name
                </Label>
                <Input
                  id="firmName"
                  placeholder="Acme Legal Partners"
                  {...form.register('firmName')}
                />
                {form.formState.errors.firmName && (
                  <p className="text-sm text-red-600">{form.formState.errors.firmName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex">
                  <Input
                    id="subdomain"
                    placeholder="acme-legal"
                    {...form.register('subdomain')}
                    className="rounded-r-none"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    .firmsync.app
                  </span>
                </div>
                {form.formState.errors.subdomain && (
                  <p className="text-sm text-red-600">{form.formState.errors.subdomain.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    <User className="inline w-4 h-4 mr-1" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...form.register('firstName')}
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Smith"
                    {...form.register('lastName')}
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Admin Email
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="john@acmelegal.com"
                  {...form.register('adminEmail')}
                />
                {form.formState.errors.adminEmail && (
                  <p className="text-sm text-red-600">{form.formState.errors.adminEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">
                  <Lock className="inline w-4 h-4 mr-1" />
                  Password
                </Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Create a secure password"
                  {...form.register('adminPassword')}
                />
                {form.formState.errors.adminPassword && (
                  <p className="text-sm text-red-600">{form.formState.errors.adminPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...form.register('confirmPassword')}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Your Firm...
                  </>
                ) : (
                  'Create Firm Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a
                  href="/"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}