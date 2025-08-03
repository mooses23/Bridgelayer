# Bridgelayer Environment Setup Guide

## 🚀 Quick Setup Checklist

### 1. Create `.env.local` file with:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database URLs (for migrations)
DATABASE_URL="postgresql://postgres.project:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.project:password@aws-0-region.pooler.supabase.com:5432/postgres"
```

### 2. Setup Test Users
1. Go to Supabase Auth Dashboard
2. Create test users:
   - admin@bridgelayer.com (super_admin)
   - firmsync-admin@bridgelayer.com (admin)  
   - john@demo-firm.com (tenant_admin)
   - jane@demo-firm.com (tenant_user)
3. Copy their UUIDs into seed-users.sql
4. Run: `supabase db reset` to apply seeds

### 3. Test Your Setup
```bash
# Start Supabase
supabase start

# Start development server  
npm run dev

# Test different role logins at http://localhost:3000/login
```

### 4. Common Issues & Solutions

**Issue:** "No user profile found"
**Solution:** Make sure you've seeded the profiles table with the correct auth.users UUIDs

**Issue:** "Access denied" for routes
**Solution:** Check that middleware role-based routing is working

**Issue:** "Cannot connect to Supabase"
**Solution:** Verify environment variables in .env.local

### 5. Development Workflow
1. Make database changes → Create migration
2. Test locally → supabase db reset
3. Deploy changes → supabase db push
4. Generate types → npm run generate-types
