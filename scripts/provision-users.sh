#!/bin/bash
# Helper script to manually create missing profiles for existing auth users
# Usage: ./scripts/provision-users.sh <email>

set -e

EMAIL="${1:-firmsyncdev@gmail.com}"

echo "🔧 Profile Provisioning Helper"
echo "================================"
echo "This script creates a missing profile for an existing auth user."
echo ""

# Check if Supabase is running
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "   npm install -g supabase"
    exit 1
fi

# Try to connect and execute the SQL
echo "📝 Creating profile for: $EMAIL"
echo ""

# Use supabase to execute SQL
supabase db execute << EOF
INSERT INTO public.profiles (
  id,
  tenant_id,
  vertical_id,
  role,
  display_name,
  email,
  created_at,
  updated_at
)
SELECT
  u.id,
  NULL as tenant_id,
  (SELECT id FROM public.verticals WHERE name = 'FirmSync' AND is_active = true LIMIT 1) as vertical_id,
  'tenant_user' as role,
  u.email as display_name,
  u.email,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users u
WHERE u.email = '$EMAIL'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )
ON CONFLICT (id) DO NOTHING;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Profile provisioning completed!"
    echo ""
    echo "The user can now:"
    echo "  1. Log in normally"
    echo "  2. Access their dashboard"
    echo "  3. Be assigned to a tenant/firm"
else
    echo "⚠️  Could not provision profile. This might be normal if:"
    echo "  - The user already has a profile"
    echo "  - The user doesn't exist in auth.users"
    echo ""
    echo "Check manually with:"
    echo "  SELECT * FROM public.profiles WHERE email = '$EMAIL';"
fi
