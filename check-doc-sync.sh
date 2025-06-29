#!/bin/bash
# 📊 Documentation Sync Status Checker
# Run this script to check if your branch is in sync with documentation-master

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 BridgeLayer Platform - Documentation Sync Status${NC}"
echo "=================================================================="

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "📋 Current branch: ${YELLOW}$CURRENT_BRANCH${NC}"

# Fetch latest changes
echo "🔄 Fetching latest changes..."
git fetch origin --quiet

# Check if documentation-master exists
if ! git show-ref --verify --quiet refs/remotes/origin/documentation-master; then
    echo -e "${RED}❌ ERROR: documentation-master branch not found on remote${NC}"
    echo "   Make sure the documentation-master branch exists on origin"
    exit 1
fi

echo -e "✅ Found ${YELLOW}documentation-master${NC} branch"

# Check how many commits behind documentation-master
if [ "$CURRENT_BRANCH" = "documentation-master" ]; then
    echo -e "${GREEN}✅ You are on the documentation-master branch${NC}"
    
    # Check for uncommitted changes to documentation files
    DOC_CHANGES=$(git status --porcelain | grep -E '\.(md|txt|rst)$' || true)
    if [ -n "$DOC_CHANGES" ]; then
        echo -e "${YELLOW}⚠️  Uncommitted documentation changes:${NC}"
        echo "$DOC_CHANGES"
    else
        echo -e "${GREEN}✅ No uncommitted documentation changes${NC}"
    fi
    
    # Check if ahead of remote
    AHEAD=$(git rev-list --count origin/documentation-master..HEAD)
    if [ "$AHEAD" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  You have $AHEAD local commits not pushed to remote${NC}"
        echo "   Run: git push origin documentation-master"
    else
        echo -e "${GREEN}✅ Local documentation-master is in sync with remote${NC}"
    fi
    
else
    # Check how far behind documentation-master
    BEHIND=$(git rev-list --count HEAD..origin/documentation-master)
    if [ "$BEHIND" -gt 0 ]; then
        echo -e "${RED}⚠️  Your branch is $BEHIND commits behind documentation-master${NC}"
        echo ""
        echo -e "${BLUE}🔧 To sync documentation to your branch:${NC}"
        echo "   git merge origin/documentation-master --no-ff -m \"docs: sync from documentation-master\""
        echo ""
        
        # Show what files have changed
        echo -e "${BLUE}📄 Documentation files that would be updated:${NC}"
        git diff --name-only HEAD..origin/documentation-master | grep -E '\.(md|txt|rst)$' || echo "   (No documentation files changed)"
        
    else
        echo -e "${GREEN}✅ Your branch is up to date with documentation-master${NC}"
    fi
    
    # Check for local documentation changes
    DOC_CHANGES=$(git status --porcelain | grep -E '\.(md|txt|rst)$' || true)
    if [ -n "$DOC_CHANGES" ]; then
        echo -e "${RED}❌ WARNING: You have uncommitted documentation changes${NC}"
        echo "   Documentation should only be updated on documentation-master branch"
        echo ""
        echo -e "${BLUE}🔧 To fix this:${NC}"
        echo "   1. git stash"
        echo "   2. git checkout documentation-master"
        echo "   3. git pull origin documentation-master"
        echo "   4. git stash pop"
        echo "   5. Make your documentation changes"
        echo "   6. git add *.md && git commit -m 'docs: your changes'"
        echo "   7. git push origin documentation-master"
        echo "   8. git checkout $CURRENT_BRANCH"
        echo "   9. git merge documentation-master --no-ff -m 'docs: sync'"
    fi
fi

echo ""
echo "=================================================================="

# Summary of key documentation files
echo -e "${BLUE}📚 Key Documentation Files Status:${NC}"

KEY_FILES=(
    "README.md"
    "DOCUMENTATION_HUB.md"
    "README-DOCS.md"
    "PROJECT_MANAGER_AUDIT_REPORT.md"
    "CONTRIBUTING.md"
    "HYBRID_AUTH_ARCHITECTURE.md"
    "BRANCH_SYNC_STRATEGY.md"
)

for file in "${KEY_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(wc -c < "$file" | numfmt --to=iec 2>/dev/null || wc -c < "$file")
        MODIFIED=$(git log -1 --format="%cr" -- "$file" 2>/dev/null || echo "unknown")
        echo -e "   ✅ ${file} (${SIZE}, modified ${MODIFIED})"
    else
        echo -e "   ${RED}❌ ${file} (missing)${NC}"
    fi
done

echo ""

# Show quick links
echo -e "${BLUE}🔗 Quick Actions:${NC}"
echo "   📖 Read documentation: git checkout documentation-master && open DOCUMENTATION_HUB.md"
echo "   📝 Update documentation: git checkout documentation-master"
echo "   🔄 Sync docs to branch: git merge documentation-master --no-ff -m 'docs: sync'"
echo "   🏠 Return to main docs: git checkout documentation-master"

echo ""
echo -e "${GREEN}✅ Documentation sync check complete${NC}"
