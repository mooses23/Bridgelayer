# PLAN FINAL DEVELOPMENT
before u read this read our conversation history as that is just as imporatnt 
## 1. Overview
We have one codebase powering both:
- **Bridgelayer Owner/Admin portal** (internal users)
- **FirmSync portal** (law firm users, customers)

The goal is a seamless, end-to-end system where:
1. Admins/Owners log in to `/login` → pick Bridgelayer features (owner metrics, admin-onboarding).  
2. Admins run a 6-step onboarding wizard for each new law firm.  
3. On first firm login (via code + email/password), we bootstrap a persistent firm session.  
4. Firms thereafter log in with email/password alone, see their personalized FirmSync portal with continuous auto-save and AI-driven improvements.

## 2. Roles & Authentication
- **Owner** (`role = owner`): financial/metrics dashboard at `/owner/dashboard`  
- **Admin** (`role = admin`): technical site management under `/admin`  
- **Firm User** (`role = firm_user`): law firm dashboard under `/app`  

### Login Flow
- Single page `/login` with two modes (tabs or toggle):  
  - **Bridgelayer**: email + password  
  - **FirmSync**: onboarding code + email + password (first-time) or email + password (subsequent)  
- Session cookie stores `{ userId, role, firmCode? }`  
- Middleware in Express + client guards in React gate routes by role & `firmCode` match.  

## 3. Routing & Layouts
```
/login                      # unified login page
/owner/dashboard            # Owner metrics UI
/admin                       # Admin home (product picker)
/admin/onboarding            # 6-step onboarding wizard
/app/dashboard               # Firm dashboard (post-onboarding)
/app/documents               # Law firm document library
/app/billing                 # Invoices & payments
/app/settings                # Firm profile & password reset
```  

- **Layouts**:  
  - `ModernAdminLayout.tsx` for `/owner` & `/admin`  
  - `FirmLayout.tsx` for `/app/*`

## 4. Database Schema
```sql
-- Existing
users                (id, email, passwordHash, role)
onboardingCodes      (code, createdAt, used)
onboardingProfiles   (code, stepData JSON, updatedAt)
firms                (id, name, code, branding JSON, integration JSON)

-- New
firm_users           (id, firmId, email, passwordHash, role)
```
- Onboarding profiles feed into `firms` on first firm login or "Finish Onboarding."  
- `firm_users` allows multiple seats per firm if desired.

## 5. API Endpoints
### Authentication
```
POST /api/auth/login       # accept mode=bridgelayer or mode=firm
GET  /api/auth/me          # session info
POST /api/auth/logout      # end session
```

### Onboarding (Admin)
```
POST   /api/onboarding/codes        # generate a new code
GET    /api/onboarding/codes        # list codes
GET    /api/onboarding/profiles/:code  # fetch wizard data
PUT    /api/onboarding/profiles/:code  # save wizard data per step
POST   /api/onboarding/finish/:code    # mark used, upsert firm + user
```

### FirmSync Portal
```
GET  /api/app/profile/:firmCode    # fetch current profile
GET  /api/app/dashboard/:firmCode  # stats, case count, balances
GET  /api/app/documents/:firmCode  # list generated docs
POST /api/app/ai/review            # AI review & suggestions
GET  /api/app/billing/:firmCode    # invoices
POST /api/app/billing/pay          # process payment
```

## 6. Frontend Pages & Components
### `/login`
- Tab toggle for Bridgelayer vs. FirmSync  
- First-time firm login hits `/api/auth/login?mode=firm&code=XYZ`  
- On success, redirect by role to `/owner/dashboard`, `/admin`, or `/app/dashboard`

### Owner UI (`/owner`)
- Single page with financial metrics (total firms, revenue, pending invoices)

### Admin UI (`/admin`)
- Product picker: FirmSync / MedSync  
- Onboarding wizard steps (FirmSetupStep, BrandingStep, IntegrationsStep, TemplatesStep, PreviewStep, LLMReviewStep)  

### FirmSync UI (`/app`)
- Dashboard (Custom greeting, summary cards)  
- Documents page (table of generated PDFs, templating tools)  
- Billing page (list invoices, Pay Now button)  
- Settings page (profile, password reset)  

## 7. Onboarding Workflow
1. Admin creates a code via `/api/onboarding/codes`.  
2. Admin works through 6-step wizard under `/admin/onboarding` → auto-saves each step.  
3. Admin clicks "Finish Onboarding" → calls `POST /api/onboarding/finish/:code` to:  
   - Upsert `firms` record from profile JSON  
   - Create initial `firm_user` account if none exists  
   - Mark code as used  
4. Wizard shows button: **Go to FirmSync** → `/login?mode=firm&code=XYZ`

## 8. AI/LLM Self-Healing
- Client calls `/api/app/ai/review` with current profile JSON.  
- API forwards to OpenAI, returns suggested fixes (e.g. missing placeholders, style improvements).  
- Client shows a side-by-side diff; on "Apply", merges suggestions into profile via `PUT /api/onboarding/profiles/:code`.

## 9. Development Tasks & Timeline
| Priority | Task                                                                                         | Owner | Est.  |
|----------|----------------------------------------------------------------------------------------------|-------|-------|
| 1        | Update `/api/auth/login` to handle `mode=firm` and one-time code bootstrap                   | Dev   | 1 day |
| 1        | Extend Express middleware to guard `/app/*` by `role=firm_user` & valid `firmCode`           | Dev   | 0.5d  |
| 1        | Revamp `/login` React page with mode toggle + prefill `code` from query string               | Dev   | 1 day |
| 1        | Implement `POST /api/onboarding/finish/:code` to upsert `firms` and create `firm_users`      | Dev   | 1 day |
| 1        | Build basic `/app/dashboard` and `/app/documents` pages + FirmLayout.tsx                     | Dev   | 2 days|
| 2        | Wire AI review into `/app` via `/api/app/ai/review` and UI diff modal                        | Dev   | 2 days|
| 2        | Add loading spinners and error boundaries across Admin & FirmSync pages                      | Dev   | 1 day |
| 2        | Clean up legacy files & archive old SQL dumps                                                | Dev   | 0.5d  |
| 3        | Finish Billing pages & Stripe integration under `/app/billing`                                | Dev   | 2 days|
| 3        | Create Owner dashboard with key metrics                                                      | Dev   | 1 day |
| 3        | Add automated E2E tests (login, onboarding, firm portal smoke test)                          | QA    | 1.5d  |

_Total estimate: ~13 days_

## 10. Next Steps
1. Review this plan, adjust priorities or missing details.  
2. Kick off tasks in sprints: tackle high-priority items first.  
3. Monitor and demo after each key deliverable (Login flow, Onboarding finish, Firm portal skeleton).  
4. Iterate on AI self-healing UX and Billing integration.  

## 11. Implementation Steps
Below is a sequential list of achievable tasks based on the current codebase state:

1. **Revamp Login Page**
   - Update `client/src/routes/login.tsx` (or equivalent) to include a toggle for Bridgelayer vs FirmSync modes and prefill `code` from query string.
   - Add client-side redirect logic by role on successful login.

2. **Extend Authentication API**
   - Modify `/api/auth/login` handler in `server/index.ts` or `server/routes/auth.ts` to accept `mode=firm` and one-time code bootstrap.
   - On first firm login, fetch onboarding profile, upsert `firms` record, and create a `firm_user` session.

3. **Database Migration for Firm Users**
   - Add a new Drizzle migration file to create the `firm_users` table.

4. **Implement Onboarding Finish Endpoint**
   - Create `POST /api/onboarding/finish/:code` in `server/routes/onboarding-codes.ts` to mark code used, upsert `firms`, and create `firm_users`.

5. **Guard App Routes**
   - Extend Express middleware to enforce `role = firm_user` and valid `firmCode` on routes under `/app/*`.
   - Add corresponding React route guards in `client/src/App.tsx` or routing setup.

6. **Layout & Routing for Firm Portal**
   - Create `FirmLayout.tsx` under `client/src/layouts` with navigation links.
   - Register `/app/*` routes in the client-side router to use `FirmLayout`.

7. **Build Firm Dashboard**
   - Scaffold `/app/dashboard` page component showing basic summary cards (input from `/api/app/dashboard/:firmCode`).

8. **Documents Page Skeleton**
   - Build `/app/documents` page with a table of generated docs and dropdown showing the firm’s custom templates.

9. **Wire AI Review**
   - Integrate `/api/app/ai/review` into an “AI Review” button on relevant pages (e.g. Documents or Settings) to apply self-healing suggestions.

10. **Error & Loading States**
    - Add loading spinners and user-friendly error alerts to each major API call in both Admin and FirmSync UIs.

11. **Legacy Cleanup**
    - Archive or remove orphaned legacy scripts, tests, and SQL dumps from the project root.

Once these steps are complete, the foundation for the full end-to-end flow will be in place and you can advance to billing, owner metrics, and E2E tests.

---
*Ready to execute as the world-class dev team. Let me know any refinements!*  

Ensure that the onboarding workflow provides a document generator tailored for paralegals (and other firm roles), displaying the firm's custom (stenciled) templates in the dropdown menu rather than a generic document like “Power of Attorney”.
