import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LLMWorkflowDesigner from '@/components/workflow/WorkflowDesigner';
import WorkflowTester from '@/components/WorkflowTester';
import { 
  Brain, 
  Save, 
  RefreshCw, 
  Settings, 
  FileText, 
  Users, 
  Calendar,
  DollarSign,
  Scale,
  MessageSquare,
  Search,
  Plus,
  Edit3,
  Trash2,
  Copy
} from 'lucide-react';

interface LLMPrompt {
  id: string;
  name: string;
  category: string;
  prompt: string;
  lastModified: string;
  status: 'active' | 'draft' | 'archived';
}

// Accept onboarding code for firm-specific context
interface LLMPromptsPageProps {
  code?: string;
}

const LLMPromptsPage: React.FC<LLMPromptsPageProps> = ({ code }) => {
  const [activeTab, setActiveTab] = useState('workflow');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<LLMPrompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [workflowEdges, setWorkflowEdges] = useState<any[]>([]);
  // TODO: use 'code' to load or filter prompts per firm

  const categories = [
    { id: 'dashboard', name: 'Dashboard', icon: FileText, color: 'blue' },
    { id: 'clients', name: 'Clients', icon: Users, color: 'green' },
    { id: 'cases', name: 'Cases', icon: Scale, color: 'purple' },
    { id: 'documents', name: 'Documents', icon: FileText, color: 'orange' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'red' },
    { id: 'tasks', name: 'Tasks', icon: MessageSquare, color: 'yellow' },
    { id: 'billing', name: 'Billing', icon: DollarSign, color: 'emerald' },
    { id: 'paralegal', name: 'Paralegal+', icon: Brain, color: 'indigo' }
  ];

  // Mock data - in real app this would come from API
  const [prompts, setPrompts] = useState<LLMPrompt[]>([
    {
      id: '1',
      name: 'Client Management Assistant',
      category: 'clients',
      prompt: 'You are a legal client management assistant. Help law firms manage client relationships, track communications, and maintain detailed client profiles. Always prioritize confidentiality and provide practical legal practice management advice.',
      lastModified: '2024-06-20',
      status: 'active'
    },
    {
      id: '2',
      name: 'Case Strategy Advisor',
      category: 'cases',
      prompt: 'You are a case strategy advisor for law firms. Assist with case planning, deadline tracking, legal research coordination, and case outcome analysis. Provide strategic insights while maintaining ethical guidelines.',
      lastModified: '2024-06-19',
      status: 'active'
    },
    {
      id: '3',
      name: 'Document Analysis Expert',
      category: 'documents',
      prompt: 'You are a legal document analysis expert. Help with document review, contract analysis, legal writing assistance, and document organization. Identify key terms, potential issues, and provide summaries.',
      lastModified: '2024-06-18',
      status: 'draft'
    }
  ]);

  const filteredPrompts = prompts.filter(prompt => {
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesSearch = prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'gray';
  };

  const handleSavePrompt = () => {
    if (selectedPrompt) {
      setPrompts(prev => prev.map(p => 
        p.id === selectedPrompt.id ? { ...selectedPrompt, lastModified: new Date().toISOString().split('T')[0] } : p
      ));
      setIsEditing(false);
    }
  };

  const createNewPrompt = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const newPrompt: LLMPrompt = {
      id: Date.now().toString(),
      name: `New ${category?.name} Prompt`,
      category: categoryId,
      prompt: `You are a ${category?.name.toLowerCase()} assistant for law firms. [Edit this prompt to customize the AI behavior]`,
      lastModified: new Date().toISOString().split('T')[0],
      status: 'draft'
    };
    setPrompts(prev => [...prev, newPrompt]);
    setSelectedPrompt(newPrompt);
    setIsEditing(true);
  };

  const handleWorkflowExecute = async (inputs: any) => {
    try {
      // TODO: Implement actual workflow execution
      const results = await Promise.resolve({ success: true });
      return results;
    } catch (error) {
      console.error('Workflow execution error:', error);
      throw error;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LLM Agent Configuration</h1>
          <p className="text-gray-600">Manage and configure your LLM agents and their interactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflow">Agent Workflow</TabsTrigger>
          <TabsTrigger value="prompts">Agent Prompts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-4">
          <LLMWorkflowDesigner
            onNodesChange={setWorkflowNodes}
            onEdgesChange={setWorkflowEdges}
          />
        </TabsContent>

        <TabsContent value="prompts">
          {/* Existing prompts content */}
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Agent Prompts</CardTitle>
                <Button onClick={() => setIsEditing(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Prompt
                </Button>
              </CardHeader>
              <CardContent>
                {/* Rest of the existing prompt management UI */}
                <div className="space-y-4">
                  {filteredPrompts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No prompts found matching your criteria</p>
                    </div>
                  ) : (
                    filteredPrompts.map(prompt => (
                      <div
                        key={prompt.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPrompt?.id === prompt.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedPrompt(prompt)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-gray-900">{prompt.name}</h3>
                              <Badge className={getStatusColor(prompt.status)}>
                                {prompt.status}
                              </Badge>
                              <Badge variant="outline" className={`border-${getCategoryColor(prompt.category)}-200 text-${getCategoryColor(prompt.category)}-700`}>
                                {categories.find(c => c.id === prompt.category)?.name}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{prompt.prompt}</p>
                            <p className="text-xs text-gray-400 mt-2">Modified: {prompt.lastModified}</p>
                          </div>
                          <div className="flex space-x-1 ml-4">
                            <Button size="sm" variant="ghost">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prompt Editor */}
          {selectedPrompt && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Edit Prompt: {selectedPrompt.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                    {isEditing && (
                      <Button onClick={handleSavePrompt}>
                        Save Changes
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prompt-name">Prompt Name</Label>
                    <Input
                      id="prompt-name"
                      value={selectedPrompt.name}
                      onChange={(e) => setSelectedPrompt({...selectedPrompt, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prompt-status">Status</Label>
                    <Select
                      value={selectedPrompt.status}
                      onValueChange={(value) => setSelectedPrompt({...selectedPrompt, status: value as any})}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="prompt-content">Prompt Content</Label>
                  <Textarea
                    id="prompt-content"
                    value={selectedPrompt.prompt}
                    onChange={(e) => setSelectedPrompt({...selectedPrompt, prompt: e.target.value})}
                    disabled={!isEditing}
                    rows={12}
                    className="font-mono text-sm"
                    placeholder="Enter the system prompt that will guide the AI assistant's behavior..."
                  />
                </div>

                {/* Preview */}
                <div className="border-t pt-4">
                  <Label>Preview</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedPrompt.prompt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings">
          {/* Settings content */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">No settings available for this agent yet.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          {/* Testing content */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowTester
                nodes={workflowNodes}
                edges={workflowEdges}
                onExecute={handleWorkflowExecute}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LLMPromptsPage;
