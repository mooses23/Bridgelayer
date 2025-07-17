# Bridgelayer Meta‑SaaS README

## Overview

Bridgelayer is a multi‑tenant, multi‑vertical platform. Each vertical can be one of two types:

* **Standalone Verticals** (single‑tenant, one‑off sites)
* **Regenerative Verticals** (multi‑tenant, scalable products like FirmSync)

This README covers two core phases:

1. **Standalone Verticals** (owner‑level projects)
2. **Regenerative Verticals** (FirmSync example)

---

## Folder Structure

```bash
/                # Project root
├── README.md    # This guide
├── db           # Database migration & seed scripts
│   ├── migrations
│   └── seeds
├── src
│   ├── owner    # Non‑regenerative, owner‑level code
│   ├── verticals
│   │   └── firmsync  # Regenerative vertical
│   └── utils
├── public
└── .env.example
```

### 1. Owner (Bridgelayer) Vertical - Non‑Regenerative

* **Location:** `/src/owner`
* **Purpose:** Global management UI and API for:

  * Platform configuration
  * Integrations catalog
  * Billing & analytics across all verticals
  * User/role management at `super_admin` level

#### Tabs (Owner Dashboard)

* **Verticals**: List/add new verticals
* **Tenants**: View all tenants across verticals
* **Users**: Manage global user roles
* **Analytics**: Platform usage & revenue
* **Settings**: Global configuration & API keys

---

### 2. Regenerative Vertical: FirmSync

**Location:** `/src/verticals/firmsync`
**Schema:** `firmsync` (nested in Postgres)
**Category:** `legal‑tech`

#### a) Admin Workshop (vertical‑wide admin)

**URL:** `/firmsync/admin`
**Role:** `admin` with `tenant_id = NULL`

**Tabs & Modes:**

* **Firms**: Tenant/firm creation & list
* **Integrations**: Select per‑tenant tab integration (Embed vs API‑Mirror vs AI‑Native)
* **LLM**: Configure AI agent workflows per tab
* **Doc+**: Document intelligence & pipeline settings
* **Preview**: Ghost mode to preview portal template
* **Settings**: Portal & onboarding code generation

**Onboarding File Workflow:**

1. **Step 1: Firms**

   * Upload/collect mass intake forms & meta info
   * Assign tenant’s OpenAI API key → stored in template
2. **Step 2: Integrations**

   * Categorize tabs per tenant: Native vs Embed vs Mirror
3. **Step 3: LLM**

   * Set up GPT‑4o/agent workflows per tab
4. **Step 4: Doc+ → Paralegal+**

   * Finalize AI pipelines for legal workflows

Once admin finishes, they **generate onboarding code** which:

* Provisions tenant in `public.tenants`
* Creates portal template in `public.vertical_templates`
* Invites initial users (writes to `public.profiles`)

#### b) Tenant (Firm) Portal

**URL:** `/firmsync/:tenantId`
**Role:** `tenant_admin` & `tenant_user` with `tenant_id` set

**Tabs:**

* **Clients**
* **Cases**
* **Calendar**
* **DocSign**
* **Paralegal+**
* **Billing**
* **(Additional custom tabs via Integrations)**

Tenant users see only their firm’s data; tenant\_admins can manage users & data within their own tenant.

#### c) Admin Onboarding Code

Stored in `public.vertical_templates.template` as JSONB.
Onboarding code consumes template to:

1. Create tenant record
2. Assign OpenAI API key per tenant
3. Provision nested tables defaults (`firmsync.firm_settings`)
4. Create initial profiles (admin & users)

---

## Phases at a Glance

### Phase 1: Core Setup

* Initialize global schema (`public.verticals`, `public.tenants`, `public.profiles`)
* Scaffold nested verticals folder & schema
* Write RLS policies for roles & isolation

### Phase 2: Admin Workshop & Onboarding

* Build UI for dual preview/onboarding
* Store templates in JSONB
* Generate onboarding code to provision tenants & users

### Phase 3: AI Intelligence

* Paralegal+ & Doc+ integration
* LLM agent orchestration per tab

### Phase 4: Scale & Additional Verticals

* Clone FirmSync pattern for MedSync, EduSync, HRSync…
* Share Integrations/LLM/Doc+ across verticals via Admin Workshop

---

*Maintained by Bridgelayer Core Team – last updated: \$(date)*
# Bridgelayer
