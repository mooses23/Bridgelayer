import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

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

export function useAgentAssignments() {
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['agent-assignments'],
    queryFn: async () => {
      const { data } = await axios.get('/api/agent-assignments');
      return data;
    }
  });

  const { mutate: assignAgent } = useMutation({
    mutationFn: async (assignment: AgentAssignment) => {
      const { data } = await axios.post('/api/agent-assignments', assignment);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-assignments'] });
    },
  });

  const { mutate: deleteAssignment } = useMutation({
    mutationFn: async (documentTypeId: string) => {
      await axios.delete(`/api/agent-assignments/${documentTypeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-assignments'] });
    },
  });

  const { mutateAsync: testAssignment } = useMutation({
    mutationFn: async ({
      documentTypeId,
      sampleDocumentId,
    }: {
      documentTypeId: string;
      sampleDocumentId: string;
    }) => {
      const { data } = await axios.post('/api/agent-assignments/test', {
        documentTypeId,
        sampleDocumentId,
      });
      return data;
    }
  });

  return {
    assignments,
    isLoading,
    assignAgent,
    deleteAssignment,
    testAssignment,
  };
}
