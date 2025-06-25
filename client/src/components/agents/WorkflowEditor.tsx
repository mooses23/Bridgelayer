import { useState, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: Record<string, any>;
}

interface DocumentType {
  id: string;
  name: string;
  type: string;
}

interface WorkflowStep {
  action: string;
  timeout: number;
}

interface Workflow {
  steps: WorkflowStep[];
  fallback: {
    action: string;
  };
}

interface WorkflowEditorProps {
  documentType: DocumentType;
  agent: Agent;
  workflow: Workflow;
  onChange: (workflow: Workflow) => void;
}

const AVAILABLE_ACTIONS = [
  'initialize',
  'validate',
  'extract_text',
  'analyze',
  'classify',
  'summarize',
  'review',
  'notify_admin',
  'notify_paralegal',
  'complete',
];

export function WorkflowEditor({
  documentType,
  agent,
  workflow,
  onChange,
}: WorkflowEditorProps) {
  const [editingStep, setEditingStep] = useState<number | null>(null);

  const handleAddStep = useCallback(() => {
    const newWorkflow: Workflow = {
      ...workflow,
      steps: [
        ...workflow.steps,
        { action: 'initialize', timeout: 300 },
      ],
    };
    onChange(newWorkflow);
  }, [workflow, onChange]);

  const handleUpdateStep = useCallback((index: number, updates: Partial<WorkflowStep>) => {
    const newWorkflow: Workflow = {
      ...workflow,
      steps: workflow.steps.map((step, i) => 
        i === index ? { ...step, ...updates } : step
      ),
    };
    onChange(newWorkflow);
  }, [workflow, onChange]);

  const handleRemoveStep = useCallback((index: number) => {
    const newWorkflow: Workflow = {
      ...workflow,
      steps: workflow.steps.filter((_, i) => i !== index),
    };
    onChange(newWorkflow);
  }, [workflow, onChange]);

  const handleUpdateFallback = useCallback((action: string) => {
    const newWorkflow: Workflow = {
      ...workflow,
      fallback: { action },
    };
    onChange(newWorkflow);
  }, [workflow, onChange]);

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{documentType.name}</h3>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">{agent.type}</Badge>
              <Badge variant="secondary">{documentType.type}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Workflow Steps */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Workflow Steps</h4>
              <Button variant="outline" size="sm" onClick={handleAddStep}>
                Add Step
              </Button>
            </div>

            <div className="space-y-2">
              {workflow.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  {editingStep === index ? (
                    <>
                      <Select
                        value={step.action}
                        onValueChange={(value) => {
                          handleUpdateStep(index, { action: value });
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ACTIONS.map((action) => (
                            <SelectItem key={action} value={action}>
                              {action.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        value={step.timeout}
                        onChange={(e) => {
                          handleUpdateStep(index, {
                            timeout: parseInt(e.target.value),
                          });
                        }}
                        className="w-24"
                        placeholder="Timeout (s)"
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingStep(null)}
                      >
                        Done
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium">
                          {step.action.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-gray-500">
                          Timeout: {step.timeout}s
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingStep(index)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStep(index)}
                      >
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fallback Action */}
          <div>
            <h4 className="font-medium mb-2">Fallback Action</h4>
            <Select
              value={workflow.fallback.action}
              onValueChange={handleUpdateFallback}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notify_admin">Notify Admin</SelectItem>
                <SelectItem value="notify_paralegal">Notify Paralegal</SelectItem>
                <SelectItem value="retry">Retry Process</SelectItem>
                <SelectItem value="skip">Skip Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
