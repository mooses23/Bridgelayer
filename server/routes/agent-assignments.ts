import { storage } from "../storage";
import { Router } from "express";
import { requireAuth, requireAdmin } from "../auth/middleware/auth-middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const workflowStepSchema = z.object({
  action: z.string(),
  timeout: z.number(),
});

const workflowSchema = z.object({
  steps: z.array(workflowStepSchema),
  fallback: z.object({
    action: z.string(),
  }),
});

const agentAssignmentSchema = z.object({
  documentTypeId: z.string(),
  agentId: z.string(),
  workflow: workflowSchema,
});

// Get all agent assignments
router.get('/assignments', requireAuth, requireAdmin, async (req, res) => {
  try {
    const assignments = await storage.getAgentAssignments();
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching agent assignments:', error);
    res.status(500).json({ message: 'Failed to fetch agent assignments' });
  }
});

// Create or update agent assignment
router.post('/assignments', requireAuth, requireAdmin, async (req, res) => {
  try {
    const assignment = agentAssignmentSchema.parse(req.body);
    const result = await storage.upsertAgentAssignment(assignment);
    res.json(result);
  } catch (error) {
    console.error('Error saving agent assignment:', error);
    res.status(500).json({ message: 'Failed to save agent assignment' });
  }
});

// Delete agent assignment
router.delete('/assignments/:documentTypeId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { documentTypeId } = req.params;
    await storage.deleteAgentAssignment(documentTypeId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent assignment:', error);
    res.status(500).json({ message: 'Failed to delete agent assignment' });
  }
});

// Test agent assignment
router.post('/assignments/test', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { documentTypeId, sampleDocumentId } = req.body;
    
    // Get the assignment
    const assignment = await storage.getAgentAssignment(documentTypeId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Get the agent
    const agent = await storage.getAgent(assignment.agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Mock test result for now
    const testResult = {
      success: true,
      processingTime: 2.3,
      confidence: 0.92,
      actions: assignment.workflow.steps.map((step: { action: string; timeout: number }) => ({
        action: step.action,
        status: 'completed',
        duration: Math.random() * step.timeout,
      })),
    };

    res.json(testResult);
  } catch (error) {
    console.error('Error testing agent assignment:', error);
    res.status(500).json({ message: 'Failed to test agent assignment' });
  }
});

export default router;
