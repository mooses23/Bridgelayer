import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, GripHorizontal, Trash2 } from 'lucide-react';
import { UnifiedOnboardingData } from '../OnboardingWizard';

interface ClientIntakeStepProps {
  data: UnifiedOnboardingData;
  updateData: (updates: Partial<UnifiedOnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Single Line Text' },
  { value: 'textarea', label: 'Multi-line Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' }
];

export function ClientIntakeStep({ data, updateData, onNext, onPrevious }: ClientIntakeStepProps) {
  const addField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      options: []
    };
    updateData({
      intakeFormFields: [...data.intakeFormFields, newField]
    });
  };

  const removeField = (id: string) => {
    updateData({
      intakeFormFields: data.intakeFormFields.filter(field => field.id !== id)
    });
  };

  const updateField = (id: string, updates: Partial<typeof data.intakeFormFields[0]>) => {
    updateData({
      intakeFormFields: data.intakeFormFields.map(field =>
        field.id === id ? { ...field, ...updates } : field
      )
    });
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const fields = [...data.intakeFormFields];
    const [removed] = fields.splice(fromIndex, 1);
    fields.splice(toIndex, 0, removed);
    updateData({ intakeFormFields: fields });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Client Intake Form
        </h2>
        <p className="text-gray-600">
          Design your client intake form with custom fields
        </p>
      </div>

      {/* Form Settings */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="formTitle">Form Title</Label>
              <Input
                id="formTitle"
                value={data.intakeFormTitle}
                onChange={(e) => updateData({ intakeFormTitle: e.target.value })}
                placeholder="e.g., New Client Intake Form"
              />
            </div>

            <div>
              <Label htmlFor="formDescription">Form Description</Label>
              <Textarea
                id="formDescription"
                value={data.intakeFormDescription}
                onChange={(e) => updateData({ intakeFormDescription: e.target.value })}
                placeholder="Provide instructions or additional context for clients"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Form Fields</h3>
            <Button onClick={addField}>
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>

          <div className="space-y-4">
            {data.intakeFormFields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg relative group"
              >
                {/* Drag Handle */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move opacity-50 group-hover:opacity-100">
                  <GripHorizontal className="w-4 h-4" />
                </div>

                <div className="ml-8 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-4">
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Field Label"
                        className="mb-2"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <Select
                        value={field.type}
                        onValueChange={(value: any) => updateField(field.id, { type: value })}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`required-${field.id}`}>Required</Label>
                        <Switch
                          id={`required-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Options for select/radio/checkbox types */}
                  {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                    <div>
                      <Label className="mb-2">Options (one per line)</Label>
                      <Textarea
                        value={field.options?.join('\n') || ''}
                        onChange={(e) => updateField(field.id, {
                          options: e.target.value.split('\n').filter(Boolean)
                        })}
                        placeholder="Enter options..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {data.intakeFormFields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Click "Add Field" to start building your form
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Response Settings */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Auto-Response Message</h3>
              <p className="text-sm text-gray-500">
                Send an automatic response when clients submit the form
              </p>
            </div>
            <Switch
              checked={data.autoResponseEnabled}
              onCheckedChange={(checked) => updateData({ autoResponseEnabled: checked })}
            />
          </div>

          {data.autoResponseEnabled && (
            <Textarea
              value={data.autoResponseMessage}
              onChange={(e) => updateData({ autoResponseMessage: e.target.value })}
              placeholder="Thank you for submitting your intake form. We will review your information and contact you within 1-2 business days."
              rows={4}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!data.intakeFormTitle || data.intakeFormFields.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
