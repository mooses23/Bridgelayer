#### **PROMPT 1B-INTERFACES: 🎯 TypeScript Authentication Fortress**
```typescript
// CONFIDENCE MULTIPLIER: Rock-solid type foundation
"Create a comprehensive, bulletproof TypeScript interface system for authentication.

🎯 ATOMIC TASK: Generate /shared/types/auth.ts with complete type coverage

📋 EXPLICIT REQUIREMENTS:
1. User types with role hierarchy:
   ```typescript
   type UserRole = 'super_admin' | 'firm_admin' | 'attorney' | 'staff' | 'client'
   interface User {
     id: string
     email: string  
     role: UserRole
     permissions: Permission[]
     firmId?: string
     profile: UserProfile
     settings: UserSettings
     lastLoginAt: Date
     createdAt: Date
   }
   ```

2. Session management types:
   ```typescript
   interface AuthSession {
     user: User
     token: string
     expiresAt: Date
     refreshToken: string
     tenantContext: TenantContext
   }
   ```

3. Permission system types with granular controls
4. Authentication request/response types
5. Error types for auth failures
6. Admin onboarding specific types

🔄 VALIDATION GATES:
- All types compile without errors
- Cover every auth scenario identified in Phase 1A
- Include JSDoc comments for complex types
- Export statements for easy importing

🛡️ FALLBACK: If complex permissions are unclear, start with basic RBAC and note extension points

🔗 INTEGRATION: These types will be imported by all auth-related components"
```