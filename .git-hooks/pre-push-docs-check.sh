#!/bin/bash
# Git hook to ensure documentation consistency across branches
# Place this in .git/hooks/pre-push and make executable

echo "🔍 Checking documentation consistency..."

# Check if we're pushing documentation changes
if git diff --name-only HEAD~1 HEAD | grep -q "\.md$"; then
    echo "📝 Documentation changes detected"
    
    # Check if we're on documentation-master branch
    current_branch=$(git branch --show-current)
    
    if [ "$current_branch" != "documentation-master" ]; then
        echo "⚠️  WARNING: Documentation changes detected on branch '$current_branch'"
        echo "📚 Documentation should be updated on 'documentation-master' branch first"
        echo ""
        echo "Recommended workflow:"
        echo "1. git checkout documentation-master"
        echo "2. Make documentation changes"
        echo "3. git commit and push documentation-master"
        echo "4. git checkout $current_branch"
        echo "5. git merge documentation-master"
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Push cancelled. Please update documentation on documentation-master first."
            exit 1
        fi
    fi
fi

echo "✅ Documentation check passed"
