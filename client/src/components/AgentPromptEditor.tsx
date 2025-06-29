import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  X,
  RotateCcw,
  PlayCircle,
  Library,
  Variable,
  Copy,
} from 'lucide-react';

interface Variable {
  name: string;
  description: string;
  example: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
}

interface AgentPromptEditorProps {
  isOpen: boolean;
  onClose: () => void;
  agent: {
    id: string;
    data: {
      label: string;
      description: string;
    };
  };
  onSave: (promptData: any) => void;
}

const availableVariables: Variable[] = [
  { name: 'firm_name', description: 'Name of the law firm', example: 'Smith & Associates' },
  { name: 'practice_area', description: 'Primary practice area', example: 'Corporate Law' },
  { name: 'client_name', description: 'Name of the client', example: 'John Doe' },
  { name: 'matter_type', description: 'Type of legal matter', example: 'Contract Review' },
  { name: 'document_type', description: 'Type of document', example: 'NDA' },
];

const promptTemplates: PromptTemplate[] = [
  {
    id: 'client-intake',
    name: 'Client Intake Agent',
    description: 'Handles new client onboarding and initial consultations',
    category: 'Client Service',
    content: 'You are the Client Intake Agent for {{firm_name}}. Your role is to gather essential information from new clients...',
  },
  {
    id: 'doc-analysis',
    name: 'Document Analysis Agent',
    description: 'Analyzes legal documents and extracts key information',
    category: 'Document Processing',
    content: 'As a Document Analysis Agent, you will review {{document_type}} documents for {{firm_name}}...',
  },
];

export default function AgentPromptEditor({
  isOpen,
  onClose,
  agent,
  onSave,
}: AgentPromptEditorProps) {
  const [activeTab, setActiveTab] = useState('edit');
  const [promptContent, setPromptContent] = useState('');
  const [testInput, setTestInput] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Enter your prompt here...',
      }),
    ],
    content: promptContent,
    onUpdate: ({ editor }) => {
      const content = editor.getText();
      setPromptContent(content);
      // Approximate token count (rough estimation)
      setTokenCount(Math.ceil(content.split(/\\s+/).length * 1.3));
    },
  });

  const insertVariable = useCallback((variable: Variable) => {
    if (editor) {
      editor.commands.insertContent(`{{${variable.name}}}`);
    }
  }, [editor]);

  const loadTemplate = useCallback((templateId: string) => {
    const template = promptTemplates.find(t => t.id === templateId);
    if (template && editor) {
      editor.commands.setContent(template.content);
    }
  }, [editor]);

  const handleTest = async () => {
    setIsTesting(true);
    // TODO: Implement actual testing logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTesting(false);
  };

  const handleSave = () => {
    onSave({
      agentId: agent.id,
      prompt: promptContent,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Edit Agent Prompt: {agent.data.label}
          </DialogTitle>
          <DialogDescription>{agent.data.description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="edit">Edit Prompt</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <div className="grid grid-cols-[3fr,1fr] gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Prompt Editor</span>
                    <Badge variant="secondary">
                      ~{tokenCount} tokens
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EditorContent editor={editor} className="min-h-[300px] prose max-w-none" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button variant="ghost" onClick={() => editor?.commands.clearContent()}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Variable className="w-5 h-5" />
                    Variables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {availableVariables.map((variable) => (
                      <div
                        key={variable.name}
                        className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => insertVariable(variable)}
                      >
                        <div className="font-medium text-sm">{`{{${variable.name}}}`}</div>
                        <div className="text-xs text-gray-500">{variable.example}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Test Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Test Input</Label>
                  <Input
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Enter test input values..."
                  />
                </div>
                <Button onClick={handleTest} disabled={isTesting}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {isTesting ? 'Running...' : 'Run Test'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Library className="w-5 h-5" />
                  Prompt Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {promptTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => loadTemplate(template.id)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge>{template.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <Button variant="ghost" className="mt-2" onClick={() => loadTemplate(template.id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
