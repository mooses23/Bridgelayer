import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import * as yup from 'yup';

interface AgentFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: any;
}

interface AgentFormConfig {
  title: string;
  description?: string;
  fields: AgentFormField[];
  submitLabel?: string;
  agentType: string;
  action: string;
}

interface AgentFormProps {
  config: AgentFormConfig;
  initialData?: Record<string, any>;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export default function AgentForm({ 
  config, 
  initialData = {}, 
  onSuccess, 
  onCancel 
}: AgentFormProps) {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Build dynamic validation schema
  const validationSchema = yup.object().shape(
    config.fields.reduce((schema, field) => {
      let fieldSchema = yup.string();
      
      if (field.required) {
        fieldSchema = fieldSchema.required(`${field.label} is required`);
      }
      
      if (field.type === 'email') {
        fieldSchema = fieldSchema.email('Please enter a valid email address');
      }
      
      if (field.type === 'number') {
        fieldSchema = yup.number();
        if (field.required) {
          fieldSchema = fieldSchema.required(`${field.label} is required`);
        }
      }
      
      if (field.validation) {
        fieldSchema = field.validation;
      }
      
      schema[field.name] = fieldSchema;
      return schema;
    }, {} as Record<string, any>)
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: initialData
  });

  // Universal agent submission
  const agentMutation = useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      const response = await fetch('/api/agent/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          tenantId: tenant?.id,
          agentType: config.agentType,
          action: config.action,
          data: formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `${config.title} submitted successfully`,
      });
      reset();
      onSuccess?.(data);
      queryClient.invalidateQueries({ queryKey: [config.agentType, tenant?.id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const onSubmit = (data: Record<string, any>) => {
    agentMutation.mutate(data);
  };

  const renderField = (field: AgentFormField) => {
    const error = errors[field.name];
    
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              {...register(field.name)}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500">{error.message as string}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select onValueChange={(value) => setValue(field.name, value)}>
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-red-500">{error.message as string}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.name)}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500">{error.message as string}</p>
            )}
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        {config.description && (
          <p className="text-sm text-muted-foreground">{config.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {config.fields.map(renderField)}
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : (config.submitLabel || 'Submit')}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
