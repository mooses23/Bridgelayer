# Frontend-to-Backend Schema Mapping

This document maps frontend components to the newly refactored backend schema, ensuring proper data flow and integration.

## 1. Admin Onboarding Flow

### Step 1: Firm Setup (`FirmSetup.tsx`)
- **Backend Schema**: `firms`, `onboardingProfiles`
- **Key Fields**:
  - `firms.name`, `firms.slug`, `firms.subdomain`, `firms.plan`, `firms.status`
  - `firms.logoUrl`, `firms.settings`
  - `onboardingProfiles.code`, `onboardingProfiles.stepData`, `onboardingProfiles.status`
- **API Endpoint**: `/api/admin/firms` (POST, PUT)

### Step 2: Integrations (`OnboardingPage.tsx`)
- **Backend Schema**: `firms`, `onboardingProfiles`
- **Key Fields**:
  - `onboardingProfiles.stepData` (JSON field containing integration selections)
- **API Endpoint**: `/api/admin/firms/:code/integrations` (GET, POST)

### Step 3: Base Agent Configuration (`OnboardingPage.tsx`)
- **Backend Schema**: `onboardingProfiles`, `users`, `firms`
- **Key Fields**:
  - `onboardingProfiles.stepData` (JSON field containing LLM settings)
  - `firms.settings` (AI configuration)
- **API Endpoint**: `/api/admin/firms/:code/agents` (POST)

### Step 4: Document Agent Assignment (`AgentAssignment.tsx`)
- **Backend Schema**: `documents`, `onboardingProfiles`
- **Key Fields**:
  - `documents.documentType`
  - `onboardingProfiles.stepData` (Document agent mappings)
- **API Endpoint**: `/api/admin/firms/:code/documents` (PUT)

## 2. Admin Dashboard

### Admin Dashboard (`AdminDashboard.tsx`)
- **Backend Schema**: `firms`, `onboardingProfiles`, `users`
- **Key Fields**: Various dashboard metrics and firm status data
- **API Endpoint**: `/api/admin/dashboard` (GET)

## 3. Firm Portal (7-tab layout)

### Dashboard Tab
- **Backend Schema**: `firms`, `notifications`
- **Key Fields**: `firms.settings`, `notifications.message`, `notifications.priority`
- **API Endpoint**: `/api/tenant/:slug/dashboard` (GET)

### Clients Tab
- **Backend Schema**: `clients`
- **Key Fields**: `clients.name`, `clients.email`, `clients.phone`, `clients.status`
- **API Endpoint**: `/api/tenant/:slug/clients` (GET, POST, PUT)

### Cases Tab
- **Backend Schema**: `cases`
- **Key Fields**: `cases.title`, `cases.description`, `cases.status`
- **API Endpoint**: `/api/tenant/:slug/cases` (GET, POST, PUT)

### Calendar Tab
- **Backend Schema**: `calendarEvents`
- **Key Fields**: `calendarEvents.title`, `calendarEvents.startTime`, `calendarEvents.endTime`, `calendarEvents.status`
- **API Endpoint**: `/api/tenant/:slug/calendar` (GET, POST, PUT)

### Paralegal+ Tab
- **Backend Schema**: `documents`
- **Key Fields**: `documents.fileName`, `documents.status`, `documents.documentType`
- **API Endpoint**: `/api/tenant/:slug/documents` (GET, POST, PUT)

### Billing Tab
- **Backend Schema**: `invoices`
- **Key Fields**: `invoices.invoiceNumber`, `invoices.amount`, `invoices.status`
- **API Endpoint**: `/api/tenant/:slug/invoices` (GET, POST, PUT)

### Settings Tab
- **Backend Schema**: `firms`, `users`, `platformSettings`
- **Key Fields**: `firms.settings`, `users.role`, `users.status`
- **API Endpoint**: `/api/tenant/:slug/settings` (GET, PUT)

## 4. Data Isolation & Security

All API calls must include firm context:
- Frontend automatically includes `firmId` (via slug) in all tenant route API calls
- Admin-level calls include explicit onboarding code or firm identifier
- Security enforced at both frontend and backend levels

## 5. Frontend Types-to-Schema Mapping

Frontend type definitions should be updated to match the schema:

```typescript
// Example mapping between frontend types and backend schema
interface FirmModel {
  id: number;
  name: string;
  slug: string;
  // Maps to firms table
}

interface OnboardingModel {
  code: string;
  status: string;
  stepData: Record<string, any>;
  // Maps to onboardingProfiles table
}

interface ClientModel {
  id: number;
  name: string;
  email: string;
  // Maps to clients table
}
```

## Next Steps

1. Update frontend API services to align with the new schema
2. Refactor any components with hardcoded data models
3. Test data flow through the full stack
4. Implement migration scripts for existing data
