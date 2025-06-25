### **PHASE 2: AGENT FOUNDATION (Weeks 2-3)**
*Building the AI integration layer*

#### **PROMPT 2A: OpenAI Assistant Integration Service**
```
Create a service class for managing OpenAI Assistants with the following requirements:

1. Create firm-specific assistants with custom instructions
2. Manage conversation threads for task persistence
3. Handle file uploads for firm knowledge bases
4. Provide methods for agent communication and coordination

Key Implementation Patterns:

interface AssistantFactory {
  createForFirm(config: FirmConfig): Promise<Assistant>;
  loadKnowledgeBase(files: File[]): Promise<void>;
  configureTools(tools: AITool[]): Promise<void>;
}

class AgentOrchestrator {
  private agents: Map<string, Assistant>;
  private threads: Map<string, Thread>;
  
  async routeTask(task: Task): Promise<Response> {
    const chain = this.buildAgentChain(task);
    return await chain.execute();
  }
}

Include:
- Proper error handling with recovery strategies
- Automatic retry with exponential backoff
- Comprehensive logging for debugging
- Memory management for large files
- Thread cleanup and archiving
```

#### **PROMPT 2B: Agent Configuration Database Schema**
```
// Existing code for database schema
```