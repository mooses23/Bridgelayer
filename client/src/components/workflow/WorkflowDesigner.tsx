import React, { useState } from 'react';
import AgentPromptEditor from './AgentPromptEditor';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Users, FileText, MessageSquare, Shield, Settings } from 'lucide-react';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: 'firm-manager',
    type: 'special',
    data: { 
      label: 'Firm Manager Agent',
      icon: Brain,
      status: 'active',
      description: 'Regional Coordinator',
    },
    position: { x: 400, y: 200 },
    className: 'bg-blue-500 text-white rounded-lg shadow-lg p-4',
  },
  {
    id: 'client-agent',
    data: { 
      label: 'Client Service Agent',
      icon: Users,
      status: 'active',
      description: 'Client Management',
    },
    position: { x: 200, y: 100 },
    className: 'bg-green-500 text-white rounded-lg shadow-lg p-4',
  },
  {
    id: 'doc-agent',
    data: { 
      label: 'Document Agent',
      icon: FileText,
      status: 'active',
      description: 'Document Processing',
    },
    position: { x: 600, y: 100 },
    className: 'bg-purple-500 text-white rounded-lg shadow-lg p-4',
  },
  {
    id: 'case-agent',
    data: { 
      label: 'Case Management Agent',
      icon: Shield,
      status: 'active',
      description: 'Case Handling',
    },
    position: { x: 200, y: 300 },
    className: 'bg-orange-500 text-white rounded-lg shadow-lg p-4',
  },
  {
    id: 'communication-agent',
    data: { 
      label: 'Communication Agent',
      icon: MessageSquare,
      status: 'active',
      description: 'Client Communication',
    },
    position: { x: 600, y: 300 },
    className: 'bg-red-500 text-white rounded-lg shadow-lg p-4',
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'firm-manager', target: 'client-agent', animated: true },
  { id: 'e1-3', source: 'firm-manager', target: 'doc-agent', animated: true },
  { id: 'e1-4', source: 'firm-manager', target: 'case-agent', animated: true },
  { id: 'e1-5', source: 'firm-manager', target: 'communication-agent', animated: true },
];

const CustomNode = ({ data }: any) => {
  const Icon = data.icon;
  return (
    <div className="flex flex-col items-center p-4 text-center min-w-[150px]">
      <Icon className="w-8 h-8 mb-2" />
      <div className="font-medium">{data.label}</div>
      <div className="text-xs opacity-80">{data.description}</div>
      {data.status === 'active' && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Active
          </span>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  special: CustomNode,
  default: CustomNode,
};

interface LLMWorkflowDesignerProps {
  onNodesChange?: (nodes: any[]) => void;
  onEdgesChange?: (edges: any[]) => void;
}

export default function LLMWorkflowDesigner({ onNodesChange, onEdgesChange }: LLMWorkflowDesignerProps) {
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);

  // Notify parent component of changes
  React.useEffect(() => {
    onNodesChange?.(nodes);
  }, [nodes, onNodesChange]);

  React.useEffect(() => {
    onEdgesChange?.(edges);
  }, [edges, onEdgesChange]);

  const [selectedAgent, setSelectedAgent] = useState<Node | null>(null);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedAgent(node);
    setIsPromptEditorOpen(true);
  };

  const handlePromptSave = (promptData: any) => {
    console.log('Saving prompt data:', promptData);
    // TODO: Implement prompt saving logic
  };

  return (
    <Card className="h-[800px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          LLM Agent Workflow Designer
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full pt-6">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </CardContent>
      {selectedAgent && (
        <AgentPromptEditor
          isOpen={isPromptEditorOpen}
          onClose={() => {
            setIsPromptEditorOpen(false);
            setSelectedAgent(null);
          }}
          agent={selectedAgent}
          onSave={handlePromptSave}
        />
      )}
    </Card>
  );
}
