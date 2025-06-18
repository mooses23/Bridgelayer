import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Plus, Trash2, FileText } from 'lucide-react';
import { OnboardingFormData } from '../OnboardingWizard';

interface ForumIntakeStepProps {
  data: OnboardingFormData;
  updateData: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email Address' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'textarea', label: 'Large Text Area' },
  { value: 'select', label: 'Dropdown Menu' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' }
];

export function ForumIntakeStep({ data, updateData, onNext, onPrevious }: ForumIntakeStepProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text' as const,
      required: false,
      options: []
    };
    
    updateData({
      intakeFormFields: [...data.intakeFormFields, newField]
    });
    setEditingField(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<typeof data.intakeFormFields[0]>) => {
    const updatedFields = data.intakeFormFields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    updateData({ intakeFormFields: updatedFields });
  };

  const removeField = (fieldId: string) => {
    const updatedFields = data.intakeFormFields.filter(field => field.id !== fieldId);
    updateData({ intakeFormFields: updatedFields });
    if (editingField === fieldId) {
      setEditingField(null);
    }
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = data.intakeFormFields.findIndex(field => field.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= data.intakeFormFields.length) return;

    const updatedFields = [...data.intakeFormFields];
    [updatedFields[currentIndex], updatedFields[newIndex]] = [updatedFields[newIndex], updatedFields[currentIndex]];
    updateData({ intakeFormFields: updatedFields });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configure Client Intake Form
        </h2>
        <p className="text-gray-600">
          Set up your client intake form to collect the information you need from potential clients
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Configuration */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Form Settings
              </CardTitle>
              <CardDescription>
                Configure the basic settings for your intake form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="form-title">Form Title</Label>
                <Input
                  id="form-title"
                  value={data.intakeFormTitle}
                  onChange={(e) => updateData({ intakeFormTitle: e.target.value })}
                  placeholder="Client Intake Form"
                />
              </div>
              <div>
                <Label htmlFor="form-description">Form Description</Label>
                <Textarea
                  id="form-description"
                  value={data.intakeFormDescription}
                  onChange={(e) => updateData({ intakeFormDescription: e.target.value })}
                  placeholder="Please provide your information so we can assist you with your legal matter."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Form Fields</CardTitle>
                  <CardDescription>
                    Add and configure the fields for your intake form
                  </CardDescription>
                </div>
                <Button onClick={addField} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.intakeFormFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`border rounded-lg p-3 ${
                      editingField === field.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{field.label}</span>
                        {field.required && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {editingField === field.id && (
                      <div className="space-y-3 border-t pt-3">
                        <div>
                          <Label>Field Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Field Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => updateField(field.id, { type: value as any })}
                          >
                            <SelectTrigger>
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
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`required-${field.id}`}
                            checked={field.required}
                            onCheckedChange={(checked) => updateField(field.id, { required: checked as boolean })}
                          />
                          <Label htmlFor={`required-${field.id}`}>Required field</Label>
                        </div>
                        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                          <div>
                            <Label>Options (one per line)</Label>
                            <Textarea
                              value={field.options?.join('\n') || ''}
                              onChange={(e) => updateField(field.id, { 
                                options: e.target.value.split('\n').filter(opt => opt.trim()) 
                              })}
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                              rows={3}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Preview</CardTitle>
              <CardDescription>
                This is how your intake form will appear to clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white">
                <h3 className="text-xl font-semibold mb-2">{data.intakeFormTitle}</h3>
                <p className="text-gray-600 mb-6">{data.intakeFormDescription}</p>
                
                <div className="space-y-4">
                  {data.intakeFormFields.map((field) => (
                    <div key={field.id}>
                      <Label className="flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      {field.type === 'text' && (
                        <Input placeholder={`Enter ${field.label.toLowerCase()}`} disabled />
                      )}
                      {field.type === 'email' && (
                        <Input type="email" placeholder="email@example.com" disabled />
                      )}
                      {field.type === 'phone' && (
                        <Input type="tel" placeholder="(555) 123-4567" disabled />
                      )}
                      {field.type === 'textarea' && (
                        <Textarea placeholder={`Enter ${field.label.toLowerCase()}`} disabled rows={3} />
                      )}
                      {field.type === 'select' && (
                        <Select disabled>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                        </Select>
                      )}
                      {field.type === 'radio' && field.options && (
                        <div className="space-y-2">
                          {field.options.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <input type="radio" name={field.id} disabled />
                              <Label>{option}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                      {field.type === 'checkbox' && field.options && (
                        <div className="space-y-2">
                          {field.options.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <Checkbox disabled />
                              <Label>{option}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext}>
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}