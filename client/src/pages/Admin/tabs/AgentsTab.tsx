import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Brain, 
  Zap, 
  Settings,
  Play,
  Pause,
  MoreVertical,
  Plus,
  Activity,
  Clock
} from 'lucide-react';

export default function AgentsTab() {
  // Mock data for AI agents
  const agents = [
    {
      id: 1,
      name: 'Document Analyzer',
      type: 'Document Processing',
      status: 'active',
      description: 'Analyzes legal documents for key clauses and risks',
      lastActive: '2 minutes ago',
      documentsProcessed: 1247,
      accuracy: 94.2,
      firms: 12
    },
    {
      id: 2,
      name: 'Contract Reviewer',
      type: 'Contract Analysis',
      status: 'active',
      description: 'Reviews contracts for compliance and potential issues',
      lastActive: '5 minutes ago',
      documentsProcessed: 856,
      accuracy: 96.8,
      firms: 8
    },
    {
      id: 3,
      name: 'Legal Research Assistant',
      type: 'Research',
      status: 'maintenance',
      description: 'Provides legal research and case law analysis',
      lastActive: '1 hour ago',
      documentsProcessed: 445,
      accuracy: 91.5,
      firms: 15
    },
    {
      id: 4,
      name: 'Compliance Checker',
      type: 'Compliance',
      status: 'inactive',
      description: 'Checks documents for regulatory compliance',
      lastActive: '2 days ago',
      documentsProcessed: 234,
      accuracy: 89.3,
      firms: 3
    }
  ];

  const agentStats = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalProcessed: agents.reduce((sum, agent) => sum + agent.documentsProcessed, 0),
    averageAccuracy: agents.reduce((sum, agent) => sum + agent.accuracy, 0) / agents.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
          <p className="text-gray-600">Manage and monitor AI agents across the platform</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Deploy New Agent
        </Button>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              {agentStats.activeAgents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.totalProcessed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.averageAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Quality score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">
              Average processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Agents</CardTitle>
          <CardDescription>Monitor and manage AI agent performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="text-sm text-gray-600">{agent.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        Type: {agent.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        Used by {agent.firms} firms
                      </span>
                      <span className="text-xs text-gray-500">
                        Last active: {agent.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{agent.documentsProcessed.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">documents</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{agent.accuracy}%</div>
                    <div className="text-xs text-gray-500">accuracy</div>
                  </div>
                  <Badge 
                    variant={
                      agent.status === 'active' ? 'default' :
                      agent.status === 'maintenance' ? 'secondary' :
                      'destructive'
                    }
                  >
                    {agent.status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {agent.status === 'active' ? (
                      <Button size="sm" variant="outline">
                        <Pause className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Agent performance over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Performance chart would be rendered here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
