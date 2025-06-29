import { useCallback, useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAgentAssignments } from '@/hooks/useAgentAssignments';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AgentCard } from '@/components/agents/AgentCard';
import { DocumentTypeCard } from '@/components/agents/DocumentTypeCard';
import { WorkflowEditor } from '@/components/agents/WorkflowEditor';

// Types
interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: Record<string, any>;
  description?: string;
}

interface DocumentType {
  id: string;
  name: string;
  type: string;
  assignedAgentId?: string;
  workflow?: Record<string, any>;
}

interface AgentAssignment {
  documentTypeId: string;
  agentId: string;
  workflow: {
    steps: Array<{
      action: string;
      timeout: number;
    }>;
    fallback: {
      action: string;
    };
  };
}

export default function AgentAssignmentPage() {
  // State
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'doc-review',
      name: 'Document Reviewer',
      type: 'DocReview',
      capabilities: {
        canAnalyzeContracts: true,
        canExtractClauses: true,
        supportedDocTypes: ['pdf', 'docx', 'txt'],
      },
      description: 'Reviews and analyzes legal documents',
    },
    {
      id: 'research',
      name: 'Legal Researcher',
      type: 'Research',
      capabilities: {
        canAccessLaw: true,
        canSearchPrecedents: true,
        maxDocuments: 50,
      },
      description: 'Conducts legal research and finds precedents',
    },
    {
      id: 'client-mgr',
      name: 'Client Manager',
      type: 'ClientManager',
      capabilities: {
        canManageIntake: true,
        canSendUpdates: true,
        canSchedule: true,
      },
      description: 'Manages client communication and intake',
    },
  ]);

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([
    { id: 'contract', name: 'Contract Review', type: 'contract' },
    { id: 'discovery', name: 'Discovery Document', type: 'discovery' },
    { id: 'pleading', name: 'Legal Pleading', type: 'pleading' },
    { id: 'correspondence', name: 'Client Correspondence', type: 'correspondence' },
  ]);

  const [assignments, setAssignments] = useState<AgentAssignment[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Handlers
  const handleAssignment = useCallback((docTypeId: string, agentId: string) => {
    setAssignments(prev => {
      const newAssignments = prev.filter(a => a.documentTypeId !== docTypeId);
      return [...newAssignments, {
        documentTypeId: docTypeId,
        agentId,
        workflow: {
          steps: [
            { action: 'initialize', timeout: 300 },
            { action: 'process', timeout: 1800 },
            { action: 'review', timeout: 600 },
          ],
          fallback: { action: 'notify_admin' },
        },
      }];
    });
  }, []);

  const handleWorkflowUpdate = useCallback((docTypeId: string, workflow: AgentAssignment['workflow']) => {
    setAssignments(prev => prev.map(a => 
      a.documentTypeId === docTypeId ? { ...a, workflow } : a
    ));
  }, []);

  const handleTestAssignment = useCallback(async (docTypeId: string) => {
    setSelectedDocType(docTypeId);
    setTestResult(null);
    setShowTestDialog(true);
  }, []);

  const { assignments: savedAssignments, isLoading: isLoadingAssignments, assignAgent } = useAgentAssignments();

  const handleSaveConfigurations = useCallback(async () => {
    try {
      // Save each assignment
      await Promise.all(
        assignments.map(assignment => assignAgent(assignment))
      );
    } catch (error) {
      console.error('Error saving configurations:', error);
    }
  }, [assignments, assignAgent]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Document Agent Assignment</h1>
          <Button onClick={handleSaveConfigurations}>Save Configurations</Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Available Agents */}
          <div className="col-span-3">
            <h2 className="text-lg font-semibold mb-4">Available Agents</h2>
            <div className="space-y-4">
              {agents.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  className="cursor-move"
                />
              ))}
            </div>
          </div>

          {/* Document Types */}
          <div className="col-span-5">
            <h2 className="text-lg font-semibold mb-4">Document Types</h2>
            <div className="space-y-4">
              {documentTypes.map(docType => {
                const assignment = assignments.find(a => a.documentTypeId === docType.id);
                const assignedAgent = agents.find(a => a.id === assignment?.agentId);

                return (
                  <DocumentTypeCard
                    key={docType.id}
                    documentType={docType}
                    assignedAgent={assignedAgent}
                    onAssign={handleAssignment}
                    onTest={() => handleTestAssignment(docType.id)}
                  />
                );
              })}
            </div>
          </div>

          {/* Workflow Configuration */}
          <div className="col-span-4">
            <h2 className="text-lg font-semibold mb-4">Workflow Configuration</h2>
            {assignments.map(assignment => {
              const docType = documentTypes.find(d => d.id === assignment.documentTypeId);
              const agent = agents.find(a => a.id === assignment.agentId);

              if (!docType || !agent) return null;

              return (
                <WorkflowEditor
                  key={assignment.documentTypeId}
                  documentType={docType}
                  agent={agent}
                  workflow={assignment.workflow}
                  onChange={(workflow) => handleWorkflowUpdate(docType.id, workflow)}
                />
              );
            })}
          </div>
        </div>

        {/* Test Assignment Dialog */}
        <AlertDialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Test Agent Assignment</AlertDialogTitle>
              <AlertDialogDescription>
                Select a sample document to test the agent assignment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="py-4">
              <Select
                onValueChange={(value) => {
                  // Mock test result
                  setTestResult(
                    'Agent successfully processed the document.\n' +
                    'Analysis completed in 2.3s\n' +
                    'Confidence score: 0.92'
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sample document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nda">Sample NDA.pdf</SelectItem>
                  <SelectItem value="contract">Service Agreement.docx</SelectItem>
                  <SelectItem value="letter">Engagement Letter.pdf</SelectItem>
                </SelectContent>
              </Select>

              {testResult && (
                <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                  <pre>{testResult}</pre>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Done</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DndProvider>
  );
}
