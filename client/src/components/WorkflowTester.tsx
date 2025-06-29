import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PlayCircle,
  Save,
  History,
  AlertCircle,
  Clock,
  FileText,
  Users,
  BarChart2,
  Bug,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TestCase {
  id: string;
  name: string;
  description: string;
  inputs: {
    type: string;
    content: string;
  }[];
  expectedOutputs: {
    agentId: string;
    content: string;
  }[];
}

interface AgentResponse {
  agentId: string;
  content: string;
  startTime: number;
  endTime: number;
  tokenUsage: number;
  status: 'success' | 'error' | 'pending';
  error?: string;
}

interface WorkflowTesterProps {
  nodes: any[];
  edges: any[];
  onExecute: (inputs: any) => Promise<any>;
}

const sampleTestCases: TestCase[] = [
  {
    id: 'tc1',
    name: 'Client Intake - Personal Injury',
    description: 'Test client intake workflow for a personal injury case',
    inputs: [
      {
        type: 'client_request',
        content: 'I was injured in a car accident last week and need legal representation.',
      },
    ],
    expectedOutputs: [
      {
        agentId: 'client-agent',
        content: 'Initial consultation scheduled, basic information collected',
      },
    ],
  },
  {
    id: 'tc2',
    name: 'Document Review - NDA',
    description: 'Test document review workflow for NDA processing',
    inputs: [
      {
        type: 'document',
        content: 'Standard NDA template for review and processing',
      },
    ],
    expectedOutputs: [
      {
        agentId: 'doc-agent',
        content: 'NDA analyzed and validated',
      },
    ],
  },
];

export default function WorkflowTester({ nodes, edges, onExecute }: WorkflowTesterProps) {
  const [activeTab, setActiveTab] = useState('input');
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [customInput, setCustomInput] = useState('');
  const [inputType, setInputType] = useState('client_request');
  const [isExecuting, setIsExecuting] = useState(false);
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [executionStats, setExecutionStats] = useState<{
    totalTime: number;
    totalTokens: number;
    agentCount: number;
  } | null>(null);

  const handleExecute = async () => {
    setIsExecuting(true);
    setResponses([]);
    setActiveAgentId(null);
    setExecutionStats(null);

    const startTime = Date.now();
    
    try {
      // Simulate workflow execution with multiple agent responses
      for (const node of nodes) {
        setActiveAgentId(node.id);
        const agentStartTime = Date.now();
        
        // Simulate agent processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response: AgentResponse = {
          agentId: node.id,
          content: `Response from ${node.data.label}...`,
          startTime: agentStartTime,
          endTime: Date.now(),
          tokenUsage: Math.floor(Math.random() * 500) + 100,
          status: 'success',
        };

        setResponses(prev => [...prev, response]);
      }

      setExecutionStats({
        totalTime: Date.now() - startTime,
        totalTokens: responses.reduce((sum, r) => sum + r.tokenUsage, 0),
        agentCount: nodes.length,
      });
    } catch (error) {
      console.error('Workflow execution error:', error);
    } finally {
      setIsExecuting(false);
      setActiveAgentId(null);
    }
  };

  const loadTestCase = (testId: string) => {
    const test = sampleTestCases.find(t => t.id === testId);
    if (test) {
      setCustomInput(test.inputs[0].content);
      setInputType(test.inputs[0].type);
    }
  };

  const renderAgentStatus = (agentId: string) => {
    const response = responses.find(r => r.agentId === agentId);
    const isActive = activeAgentId === agentId;

    return (
      <div className={`p-4 border rounded-lg ${isActive ? 'border-blue-500 bg-blue-50' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">{nodes.find(n => n.id === agentId)?.data.label}</div>
          <Badge variant={response ? 'default' : 'secondary'}>
            {response ? 'Complete' : isActive ? 'Processing' : 'Pending'}
          </Badge>
        </div>
        {response && (
          <div className="space-y-2">
            <div className="text-sm">{response.content}</div>
            <div className="text-xs text-gray-500">
              Time: {response.endTime - response.startTime}ms • Tokens: {response.tokenUsage}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-[2fr,1fr] gap-4">
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="input">
            <Card>
              <CardHeader>
                <CardTitle>Test Input</CardTitle>
                <CardDescription>Configure the test input for the workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Input Type</Label>
                  <Select value={inputType} onValueChange={setInputType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client_request">Client Request</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="case">Case Information</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Input Content</Label>
                  <Textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter test input..."
                    rows={6}
                  />
                </div>
                <Button onClick={handleExecute} disabled={isExecuting}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {isExecuting ? 'Executing...' : 'Execute Workflow'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="execution">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Execution</CardTitle>
                <CardDescription>Live execution status and agent responses</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {nodes.map((node) => renderAgentStatus(node.id))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Execution statistics and performance data</CardDescription>
              </CardHeader>
              <CardContent>
                {executionStats ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-gray-500">Total Time</div>
                      <div className="text-2xl font-semibold">{executionStats.totalTime}ms</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-gray-500">Total Tokens</div>
                      <div className="text-2xl font-semibold">{executionStats.totalTokens}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-gray-500">Agents Used</div>
                      <div className="text-2xl font-semibold">{executionStats.agentCount}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Run a test to see performance metrics
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
            <CardDescription>Load and manage test scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {sampleTestCases.map((test) => (
                  <div
                    key={test.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => loadTestCase(test.id)}
                  >
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-gray-500">{test.description}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
