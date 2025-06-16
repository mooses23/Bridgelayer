
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { clientIntakeSchema } from "@shared/validation";
import { useTenant } from "@/context/TenantContext";
import { InlineLoader } from "@/components/LoadingStates";

interface IntakeFormData {
  clientName: string;
  email: string;
  phone: string;
  address?: string;
  region: string;
  county: string;
  matterType: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedValue?: number | null;
}

const regions = [
  "Northern California",
  "Southern California", 
  "Central California",
  "Bay Area",
  "Los Angeles County",
  "Orange County"
];

const counties = [
  "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa", "Contra Costa",
  "Del Norte", "El Dorado", "Fresno", "Glenn", "Humboldt", "Imperial", "Inyo",
  "Kern", "Kings", "Lake", "Lassen", "Los Angeles", "Madera", "Marin", "Mariposa",
  "Mendocino", "Merced", "Modoc", "Mono", "Monterey", "Napa", "Nevada", "Orange",
  "Placer", "Plumas", "Riverside", "Sacramento", "San Benito", "San Bernardino",
  "San Diego", "San Francisco", "San Joaquin", "San Luis Obispo", "San Mateo",
  "Santa Barbara", "Santa Clara", "Santa Cruz", "Shasta", "Sierra", "Siskiyou",
  "Solano", "Sonoma", "Stanislaus", "Sutter", "Tehama", "Trinity", "Tulare",
  "Tuolumne", "Ventura", "Yolo", "Yuba"
];

const matterTypes = [
  "Personal Injury",
  "Criminal Defense", 
  "Family Law",
  "Estate Planning",
  "Business Law",
  "Real Estate",
  "Employment Law",
  "Immigration",
  "Bankruptcy",
  "Other"
];

export default function IntakePage() {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(clientIntakeSchema),
    defaultValues: {
      priority: 'medium',
      estimatedValue: null
    }
  });

  const selectedRegion = watch('region');
  const selectedCounty = watch('county');
  const selectedMatterType = watch('matterType');

  // Query existing intakes
  const { data: intakes = [], isLoading } = useQuery({
    queryKey: ['intakes', tenant?.id],
    queryFn: () => fetch(`/api/client-intakes?tenant=${tenant?.id}`, {
      credentials: 'include'
    }).then(res => res.json()),
    enabled: !!tenant?.id
  });

  // Create intake mutation
  const createIntakeMutation = useMutation({
    mutationFn: (data: IntakeFormData) =>
      fetch('/api/client-intakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, firmId: tenant?.id })
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create intake');
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client intake created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['intakes'] });
      reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create intake",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: IntakeFormData) => {
    createIntakeMutation.mutate(data);
  };

  if (isLoading) return <InlineLoader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Intake</h1>
          <p className="text-muted-foreground">
            Manage new client intake requests and consultations
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Intake'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Client Intake Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    {...register('clientName')}
                    className={errors.clientName ? 'border-red-500' : ''}
                  />
                  {errors.clientName && (
                    <p className="text-sm text-red-500 mt-1">{errors.clientName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...register('address')}
                  />
                </div>

                <div>
                  <Label htmlFor="region">Region *</Label>
                  <Select onValueChange={(value) => setValue('region', value)}>
                    <SelectTrigger className={errors.region ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.region && (
                    <p className="text-sm text-red-500 mt-1">{errors.region.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="county">County *</Label>
                  <Select onValueChange={(value) => setValue('county', value)}>
                    <SelectTrigger className={errors.county ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map((county) => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.county && (
                    <p className="text-sm text-red-500 mt-1">{errors.county.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="matterType">Matter Type *</Label>
                  <Select onValueChange={(value) => setValue('matterType', value)}>
                    <SelectTrigger className={errors.matterType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select matter type" />
                    </SelectTrigger>
                    <SelectContent>
                      {matterTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.matterType && (
                    <p className="text-sm text-red-500 mt-1">{errors.matterType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select onValueChange={(value) => setValue('priority', value as 'low' | 'medium' | 'high')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Medium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estimatedValue">Estimated Case Value ($)</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    step="0.01"
                    {...register('estimatedValue', { valueAsNumber: true })}
                    className={errors.estimatedValue ? 'border-red-500' : ''}
                  />
                  {errors.estimatedValue && (
                    <p className="text-sm text-red-500 mt-1">{errors.estimatedValue.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Case Description *</Label>
                <Textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  className={errors.description ? 'border-red-500' : ''}
                  placeholder="Please provide a detailed description of your legal matter..."
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || createIntakeMutation.isPending}
                >
                  {isSubmitting || createIntakeMutation.isPending ? 'Creating...' : 'Create Intake'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Intakes ({intakes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {intakes.length === 0 ? (
            <p className="text-muted-foreground">No client intakes yet.</p>
          ) : (
            <div className="space-y-4">
              {intakes.map((intake: any) => (
                <div key={intake.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{intake.clientName}</h3>
                      <p className="text-sm text-muted-foreground">{intake.email}</p>
                      <p className="text-sm">{intake.matterType} in {intake.county} County</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        intake.priority === 'high' ? 'bg-red-100 text-red-800' :
                        intake.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {intake.priority} priority
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(intake.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">
                    {intake.description.substring(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
