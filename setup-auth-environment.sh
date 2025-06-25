#!/bin/bash

# 🛠️ Authentication System Environment Setup
# ==========================================
# This script sets up the environment variables and verifies 
# the authentication system prerequisites

echo "🛠️ Setting up FirmSync Authentication Environment"
echo "================================================"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
    else
        echo "❌ .env.example not found. Creating minimal .env file..."
        cat > .env << EOF
# FirmSync Authentication Environment Variables
NODE_ENV=development
JWT_SECRET=QW5vdGhlclZlcnlMb25nU2VjdXJlSldUU2VjcmV0MTIzNDU2Nzg5MA==
OWNER_MASTER_KEY=xjBbdHuKuesxxQDggh50pchRDyqP+mzM/jJMnxhUosI=
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
SESSION_SECRET=firmsync-session-secret-change-in-production
EOF
        echo "✅ Created minimal .env file"
    fi
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '#' | grep '=' | xargs)
    echo "✅ Loaded environment variables from .env"
fi

# Verify required environment variables
echo ""
echo "🔍 Verifying Environment Variables"
echo "---------------------------------"

check_env_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -n "$var_value" ]; then
        echo "✅ $var_name is set (${#var_value} characters)"
        return 0
    else
        echo "❌ $var_name is NOT set"
        return 1
    fi
}

# Check required variables
check_env_var "JWT_SECRET"
check_env_var "OWNER_MASTER_KEY"
check_env_var "SESSION_SECRET"

# Verify JWT_SECRET strength
if [ -n "$JWT_SECRET" ] && [ ${#JWT_SECRET} -lt 32 ]; then
    echo "⚠️  JWT_SECRET should be at least 32 characters long"
fi

echo ""
echo "🔧 Quick Authentication Route Test"
echo "---------------------------------"

# Check if server is running
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Server is running on port 5001"
    
    # Quick test of route connectivity
    echo "Testing route connectivity..."
    
    OWNER_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/owner-login \
        -H "Content-Type: application/json" \
        -d '{"email":"test","password":"test","masterKey":"test"}')
    
    if echo "$OWNER_RESPONSE" | grep -q "<!DOCTYPE html>"; then
        echo "❌ Owner login route returns HTML (not connected to authController.js)"
    else
        echo "✅ Owner login route returns JSON (properly connected)"
    fi
    
    SESSION_RESPONSE=$(curl -s http://localhost:5001/api/auth/session)
    if echo "$SESSION_RESPONSE" | grep -q "session\|message"; then
        echo "✅ Session route returns JSON (properly connected)"
    else
        echo "❌ Session route returns HTML (not connected)"
    fi
    
else
    echo "❌ Server is not running on port 5001"
    echo "   Start the server with: npm start"
fi

echo ""
echo "📋 Next Steps"
echo "============"
echo "1. If environment variables are missing, they've been added to .env"
echo "2. If routes return HTML, fix authController.js import in routes-hybrid.ts"
echo "3. Restart the server: npm start"
echo "4. Re-run integration test: ./final-integration-test.sh"
echo ""
echo "🔗 Key Files to Check:"
echo "   • .env (environment variables)"
echo "   • server/routes-hybrid.ts (authController import)"
echo "   • server/authController.mjs (exports)"
echo ""
echo "🧪 Environment setup complete!"
