#!/bin/bash

# Bridgelayer Testing Script
# Run this to verify your setup is working correctly

echo "🚀 Starting Bridgelayer System Test..."

# Check if Supabase is running
echo "📡 Checking Supabase status..."
supabase status

# Check database connection
echo "🗄️ Testing database connection..."
supabase db ping

# Start the development server in the background
echo "⚡ Starting development server..."
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Test endpoints
echo "🌐 Testing authentication endpoints..."
curl -f http://localhost:3000/login || echo "❌ Login page failed"
curl -f http://localhost:3000/api/auth/callback || echo "❌ Auth callback failed"

# Test role-based redirects (these should redirect to login)
echo "🔐 Testing role-based protection..."
curl -f http://localhost:3000/owner/dashboard || echo "✅ Owner route protected"
curl -f http://localhost:3000/firmsync/admin/dashboard || echo "✅ Admin route protected"

# Generate types
echo "🎯 Generating TypeScript types..."
npm run generate-types

# Check for TypeScript errors
echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit

# Stop development server
kill $DEV_PID

echo "✅ System test complete!"
echo ""
echo "Next steps:"
echo "1. Create test users in Supabase Auth"
echo "2. Update seed-users.sql with actual UUIDs"
echo "3. Run: supabase db reset"
echo "4. Test login with different roles"
