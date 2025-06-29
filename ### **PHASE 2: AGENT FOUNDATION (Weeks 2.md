### **PHASE 2: BRIDGELAYER MULTI-VERTICAL FOUNDATION (Weeks 2-3)**
*Building the multi-vertical AI integration layer across all industry verticals*

**Multi-Vertical Support**: System must handle legal (FIRMSYNC), medical (MEDSYNC), education (EDUSYNC), and HR (HRSYNC) industry configurations.

#### **PROMPT 2A: Multi-Vertical Assistant Integration Service**
```
Create a service class for managing industry-specific AI Assistants with the following requirements:

1. Create firm-specific assistants with vertical-aware custom instructions
2. Manage conversation threads for task persistence across all verticals
3. Handle industry-specific file uploads for firm knowledge bases
4. Provide methods for cross-vertical agent communication and coordination

Key Implementation Patterns:

interface VerticalAssistantFactory {
  createForFirm(config: FirmConfig, vertical: Vertical): Promise<Assistant>;
  loadVerticalKnowledgeBase(files: File[], vertical: Vertical): Promise<void>;
  configureVerticalTools(tools: AITool[], vertical: Vertical): Promise<void>;
}

class MultiVerticalAgentOrchestrator {
  private verticalAgents: Map<Vertical, Map<string, Assistant>>;
  private threads: Map<string, Thread>;
  
  async routeVerticalTask(task: Task, vertical: Vertical): Promise<Response> {
    const chain = this.buildVerticalAgentChain(task, vertical);
    return await chain.execute();
  }
}

Platform Admin Integration:
- Admin onboarding system configures vertical-specific agents
- Left side nav integrates agent configuration into onboarding workflow
- Integrated verification step tests agent functionality

Include:
- Multi-vertical error handling with recovery strategies
- Automatic retry with exponential backoff
- Comprehensive logging for debugging across verticals
- Memory management for large files per vertical
- Thread cleanup and archiving per industry vertical
```

#### **PROMPT 2B: Agent Configuration Database Schema**
```
// Existing code for database schema
```