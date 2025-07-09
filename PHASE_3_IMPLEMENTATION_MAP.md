# 🎯 **PHASE 3: BACKEND AGENT SERVICE LAYER - IMPLEMENTATION MAP**

## **🎯 PHASE 3 OVERVIEW**

**Goal**: Replace mock agent responses with real integration routing that connects onboarding selections to actual API calls, completing the agent-first architecture.

**Core Principle**: Same frontend forms → Agent decides → Integration API OR Local Database

---

## **📋 PHASE 3A: ONBOARDING → AGENT CONFIGURATION BRIDGE**

### **Current State Analysis**
- Onboarding Step 2 collects integration selections (QuickBooks, Salesforce, etc.)
- Selections stored in `firms.step2_selectedIntegrations` 
- Agent endpoints currently return mock data
- No connection between onboarding choices and agent routing

### **3A.1: Firm Integration Configuration System**

#### **Database Schema Updates**
```sql
-- Already exists in schema.ts:
platform_integrations     # Available integrations catalog
firm_integrations         # Firm-specific integration configs  
integration_audit_logs    # Track integration usage
```

#### **Implementation Tasks**:
1. **Firm Configuration Service**
   ```typescript
   // server/services/firm-config.service.ts
   class FirmConfigService {
     async getFirmIntegrations(firmId: number): Promise<FirmIntegration[]>
     async isIntegrationEnabled(firmId: number, integration: string): Promise<boolean>
     async getIntegrationConfig(firmId: number, integration: string): Promise<IntegrationConfig>
   }
   ```

2. **Onboarding Integration Bridge**
   ```typescript
   // Connect onboarding Step 2 selections to firm_integrations table
   async finalizeOnboardingIntegrations(firmId: number, selections: string[]) {
     // Convert selections to firm_integrations records
     // Store OAuth tokens and API keys
     // Enable agent routing for selected integrations
   }
   ```

### **3A.2: Agent Configuration Resolution**

#### **Integration-Aware Agent Routing**:
```typescript
// server/services/agent-routing.service.ts
class AgentRoutingService {
  async resolveAgentBackend(firmId: number, agentType: string): Promise<AgentBackend> {
    const integrations = await this.firmConfigService.getFirmIntegrations(firmId);
    
    switch (agentType) {
      case 'BILLING_AGENT':
        if (integrations.includes('quickbooks')) {
          return new QuickBooksAgentBackend(firmId);
        }
        return new LocalBillingBackend(firmId);
        
      case 'CLIENT_AGENT':
        if (integrations.includes('salesforce')) {
          return new SalesforceAgentBackend(firmId);
        }
        return new LocalClientBackend(firmId);
    }
  }
}
```

---

## **📋 PHASE 3B: REAL INTEGRATION IMPLEMENTATION**

### **3B.1: QuickBooks Integration**

#### **OAuth Flow Implementation**:
```typescript
// server/services/integrations/quickbooks.service.ts
class QuickBooksService {
  async initiateOAuth(firmId: number): Promise<{ authUrl: string, state: string }>
  async handleOAuthCallback(code: string, state: string): Promise<TokenSet>
  async refreshTokens(firmId: number): Promise<TokenSet>
}
```

#### **QuickBooks Agent Backend**:
```typescript
class QuickBooksAgentBackend implements AgentBackend {
  async createTimeEntry(data: TimeEntryData): Promise<AgentResponse> {
    const tokens = await this.getValidTokens();
    const qbClient = new QuickBooksClient(tokens);
    
    try {
      const result = await qbClient.createTimeActivity(data);
      return { success: true, data: result, integration: 'quickbooks' };
    } catch (error) {
      // Graceful fallback to local database
      return await this.localFallback.createTimeEntry(data);
    }
  }
}
```

#### **QuickBooks API Integration Points**:
- **Time Tracking**: Map AgentForm time entries to QuickBooks TimeActivity
- **Invoicing**: Map AgentForm invoices to QuickBooks Invoice objects
- **Customers**: Sync clients between AgentForm and QuickBooks Customer records

### **3B.2: Salesforce/CRM Integration**

#### **Salesforce Agent Backend**:
```typescript
class SalesforceAgentBackend implements AgentBackend {
  async createClient(data: ClientData): Promise<AgentResponse> {
    const connection = await this.getSalesforceConnection();
    
    try {
      const account = await connection.sobject('Account').create({
        Name: data.clientName,
        Email__c: data.email,
        Phone: data.phone,
        // Map other fields
      });
      return { success: true, data: account, integration: 'salesforce' };
    } catch (error) {
      return await this.localFallback.createClient(data);
    }
  }
}
```

### **3B.3: Calendar Integration (Google/Outlook)**

#### **Calendar Agent Backend**:
```typescript
class GoogleCalendarAgentBackend implements AgentBackend {
  async createAppointment(data: AppointmentData): Promise<AgentResponse> {
    const calendar = await this.getCalendarClient();
    
    const event = await calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary: data.title,
        start: { dateTime: data.startTime },
        end: { dateTime: data.endTime },
        attendees: [{ email: data.clientEmail }]
      }
    });
    
    return { success: true, data: event, integration: 'google-calendar' };
  }
}
```

---

## **📋 PHASE 3C: AGENT SERVICE ROUTING LOGIC**

### **3C.1: Universal Agent Service Implementation**

#### **Replace Mock Agent Service**:
```typescript
// server/services/universal-agent.service.ts
class UniversalAgentService {
  constructor(
    private routingService: AgentRoutingService,
    private auditService: IntegrationAuditService
  ) {}

  async processAgentRequest(request: AgentRequest): Promise<AgentResponse> {
    // Get appropriate backend for this firm and agent type
    const backend = await this.routingService.resolveAgentBackend(
      request.tenantId, 
      request.agentType
    );
    
    // Route to integration or local database
    const response = await backend.processAction(request.action, request.data);
    
    // Audit the interaction
    await this.auditService.logAgentInteraction(request, response);
    
    return response;
  }
}
```

### **3C.2: Agent Backend Interface**

#### **Standardized Backend Interface**:
```typescript
interface AgentBackend {
  processAction(action: string, data: any): Promise<AgentResponse>;
  
  // Backend-specific implementations
  createTimeEntry?(data: TimeEntryData): Promise<AgentResponse>;
  createClient?(data: ClientData): Promise<AgentResponse>;
  createInvoice?(data: InvoiceData): Promise<AgentResponse>;
  createCase?(data: CaseData): Promise<AgentResponse>;
  scheduleAppointment?(data: AppointmentData): Promise<AgentResponse>;
}
```

### **3C.3: Graceful Fallback System**

#### **Local Database Fallback**:
```typescript
class LocalAgentBackend implements AgentBackend {
  // Always available fallback using existing schema
  async createTimeEntry(data: TimeEntryData): Promise<AgentResponse> {
    const entry = await db.insert(timeLogs).values({
      firmId: data.firmId,
      description: data.description,
      hours: data.hours,
      billableRate: data.rate,
      // ... other fields
    }).returning();
    
    return { 
      success: true, 
      data: entry[0], 
      integration: 'local',
      fallbackUsed: true 
    };
  }
}
```

---

## **🔧 PHASE 3 IMPLEMENTATION ORDER**

### **Week 1: Foundation**
1. **Firm Configuration Service** - Connect onboarding to integration settings
2. **Agent Routing Service** - Determine which backend to use per firm
3. **Update Agent Routes** - Replace mock responses with routing logic

### **Week 2: QuickBooks Integration**
1. **OAuth Flow** - Authentication and token management
2. **QuickBooks Client** - API wrapper for common operations
3. **QuickBooks Agent Backend** - Time tracking and invoicing

### **Week 3: CRM Integration** 
1. **Salesforce OAuth** - Authentication flow
2. **Salesforce Client** - Account and contact management
3. **CRM Agent Backend** - Client creation and updates

### **Week 4: Testing & Polish**
1. **Integration Testing** - End-to-end flows with real APIs
2. **Fallback Testing** - Ensure graceful degradation
3. **Admin Interface** - View integration status and health

---

## **📊 SUCCESS METRICS**

### **Phase 3 Complete When**:
1. ✅ Onboarding Step 2 selections determine actual agent routing
2. ✅ QuickBooks-enabled firms have time entries sync to QuickBooks
3. ✅ Non-QuickBooks firms use local database (same forms)
4. ✅ Integration failures gracefully fall back to local storage
5. ✅ Admin can see integration health and usage stats

### **User Experience**:
- **Firm A** (with QuickBooks): Billing forms → QuickBooks API
- **Firm B** (no integrations): Billing forms → Local database  
- **Same forms, same UX, different backends**

---

## **🎯 PHASE 3 DELIVERABLES**

### **Backend Services**:
```bash
✅ /server/services/firm-config.service.ts        # Integration configuration
✅ /server/services/agent-routing.service.ts      # Backend selection logic
✅ /server/services/universal-agent.service.ts    # Replaces mock responses
✅ /server/services/integrations/quickbooks.service.ts
✅ /server/services/integrations/salesforce.service.ts
✅ /server/services/integrations/calendar.service.ts
```

### **Integration Backends**:
```bash
✅ /server/backends/quickbooks-agent.backend.ts
✅ /server/backends/salesforce-agent.backend.ts
✅ /server/backends/local-agent.backend.ts
```

### **OAuth & Authentication**:
```bash
✅ /server/routes/oauth/quickbooks.routes.ts
✅ /server/routes/oauth/salesforce.routes.ts
✅ /server/middleware/integration-auth.middleware.ts
```

### **Admin Interface Enhancements**:
```bash
✅ Integration health dashboard in admin portal
✅ OAuth connection status indicators
✅ Integration usage analytics
```

---

## **🚀 POST-PHASE 3 VISION**

After Phase 3 completion:

```typescript
// Frontend stays exactly the same
<AgentForm config={agentFormConfigs.timeEntry} />

// Backend magic happens automatically
Firm 1: Form → BILLING_AGENT → QuickBooks API → Success
Firm 2: Form → BILLING_AGENT → Local Database → Success
Firm 3: Form → BILLING_AGENT → QuickBooks API → Error → Local Database → Success
```

**The dream realized**: Same forms work whether firm uses QuickBooks, Xero, local database, or any combination. Users never know the difference. Integrations become purely an admin/backend concern.

This completes the agent-first, integration-optional architecture that makes FirmSync truly scalable and integration-agnostic.
