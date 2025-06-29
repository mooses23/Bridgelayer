# 🔄 BRANCH SYNCHRONIZATION STRATEGY

**Documentation as Single Source of Truth Across All Branches**

---

## 🎯 STRATEGY OVERVIEW

This document establishes the definitive workflow for maintaining documentation consistency across all branches in the BridgeLayer platform repository.

### **Core Principle**
> **`documentation-master` is the ONLY branch where documentation updates occur**  
> **All other branches receive documentation through controlled merges**

---

## 🏗️ BRANCH ARCHITECTURE

```
BridgeLayer Platform Repository
│
├── documentation-master (SOURCE OF TRUTH)
│   ├── All .md files (authoritative)
│   ├── Documentation updates ONLY
│   ├── No code changes
│   └── Merge TARGET for docs
│
├── main/master (PRODUCTION)
│   ├── Code + merged documentation
│   ├── Documentation READ-ONLY
│   └── Periodic sync from documentation-master
│
├── staging/development (STAGING)
│   ├── Code + merged documentation
│   ├── Documentation READ-ONLY
│   └── Periodic sync from documentation-master
│
└── feature/* (FEATURE BRANCHES)
    ├── Code development only
    ├── Documentation READ-ONLY
    └── Optional sync from documentation-master
```

---

## 📋 IMPLEMENTATION STEPS

### **Phase 1: Create Documentation Branch (COMPLETED)**
```bash
# Create dedicated documentation branch
git checkout -b documentation-master
git push -u origin documentation-master
```

### **Phase 2: Establish Branch Protection**
```bash
# Set up branch protection rules (GitHub/GitLab)
# - Require PR reviews for documentation-master
# - Prevent direct pushes to documentation-master
# - Require status checks to pass
```

### **Phase 3: Install Git Hooks (COMPLETED)**
```bash
# Pre-push hook prevents accidental doc updates outside documentation-master
.git-hooks/pre-push-docs-check.sh
```

### **Phase 4: Create Sync Automation (OPTIONAL)**
```yaml
# .github/workflows/sync-docs.yml
name: Sync Documentation
on:
  push:
    branches: [documentation-master]
    paths: ['**.md', 'docs/**', '.github/**/*.md']
jobs:
  sync-to-main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Sync docs to main
        run: |
          git config user.name "GitHub Action"
          git config user.email "action@github.com"
          git checkout main
          git merge origin/documentation-master --no-ff -m "docs: auto-sync from documentation-master"
          git push origin main
```

---

## 🔄 SYNCHRONIZATION WORKFLOWS

### **Workflow 1: Documentation Update**
```bash
# Developer wants to update documentation

# 1. Switch to documentation branch
git checkout documentation-master
git pull origin documentation-master

# 2. Make documentation changes
# Edit .md files as needed
git add *.md
git commit -m "docs: update platform architecture documentation"

# 3. Push to documentation branch
git push origin documentation-master

# 4. Sync to other branches (manual or automated)
git checkout main
git merge documentation-master --no-ff -m "docs: sync from documentation-master"
git push origin main
```

### **Workflow 2: Feature Development**
```bash
# Developer working on new feature

# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/new-awesome-feature

# 2. Get latest documentation (optional)
git merge documentation-master --no-ff -m "docs: sync latest docs for feature development"

# 3. Develop feature (NO documentation changes)
# ... code development ...
git add src/
git commit -m "feat: implement awesome feature"

# 4. If documentation needs updating:
git checkout documentation-master
git pull origin documentation-master
# Edit documentation
git add *.md
git commit -m "docs: document new awesome feature"
git push origin documentation-master

# 5. Merge updated docs back to feature branch
git checkout feature/new-awesome-feature
git merge documentation-master --no-ff -m "docs: sync updated documentation"
```

### **Workflow 3: Release Preparation**
```bash
# Preparing for release

# 1. Ensure documentation is current
git checkout documentation-master
git pull origin documentation-master
# Review and update documentation
git add *.md
git commit -m "docs: prepare documentation for release"
git push origin documentation-master

# 2. Sync to staging branch
git checkout staging
git pull origin staging
git merge documentation-master --no-ff -m "docs: sync for release"
git push origin staging

# 3. After testing, sync to main
git checkout main
git pull origin main
git merge documentation-master --no-ff -m "docs: sync for production release"
git push origin main
```

---

## 🛡️ ENFORCEMENT MECHANISMS

### **Git Hooks (ACTIVE)**
```bash
#!/bin/bash
# .git-hooks/pre-push-docs-check.sh

# Check if pushing documentation changes outside documentation-master
current_branch=$(git rev-parse --abbrev-ref HEAD)
files_changed=$(git diff --name-only HEAD~1 HEAD | grep -E '\.(md|rst|txt)$' | wc -l)

if [ "$files_changed" -gt 0 ] && [ "$current_branch" != "documentation-master" ]; then
    echo "❌ ERROR: Documentation changes detected outside documentation-master branch"
    echo "📋 Current branch: $current_branch"
    echo "📄 Documentation files changed: $files_changed"
    echo ""
    echo "🔧 To fix this:"
    echo "1. git stash"
    echo "2. git checkout documentation-master"
    echo "3. git stash pop"
    echo "4. Make your documentation changes"
    echo "5. git add *.md && git commit -m 'docs: your changes'"
    echo "6. git push origin documentation-master"
    echo "7. Merge documentation-master to your feature branch"
    echo ""
    exit 1
fi
```

### **Branch Protection Rules (RECOMMENDED)**
```yaml
# GitHub branch protection for documentation-master
branches:
  documentation-master:
    protection:
      required_status_checks:
        strict: true
        contexts: ["docs-validation"]
      enforce_admins: true
      required_pull_request_reviews:
        required_approving_review_count: 1
        dismiss_stale_reviews: true
      restrictions: null
```

### **Pull Request Templates**
```markdown
<!-- .github/pull_request_template.md -->
## Documentation Update Checklist

- [ ] This PR targets the `documentation-master` branch
- [ ] All documentation changes are included
- [ ] No code changes are in this PR
- [ ] Documentation has been tested/reviewed
- [ ] Will sync to other branches after merge

## Changes Made
<!-- Describe documentation changes -->

## Branches to Sync After Merge
- [ ] main
- [ ] staging  
- [ ] feature branches (list if applicable)
```

---

## 📊 MONITORING & MAINTENANCE

### **Regular Audits**
```bash
# Weekly documentation consistency check
#!/bin/bash
# check-doc-consistency.sh

echo "🔍 Checking documentation consistency across branches..."

branches=("main" "staging" "documentation-master")
doc_files=("README.md" "CONTRIBUTING.md" "*.md")

for branch in "${branches[@]}"; do
    echo "📋 Checking branch: $branch"
    git checkout $branch
    git pull origin $branch
    
    # Check for documentation drift
    doc_count=$(find . -name "*.md" | wc -l)
    echo "   📄 Documentation files: $doc_count"
    
    # Check for outdated references
    legacy_refs=$(grep -r "firmsync" --include="*.md" . | wc -l)
    echo "   ⚠️  Legacy references: $legacy_refs"
done

git checkout documentation-master
echo "✅ Documentation audit complete"
```

### **Automated Sync Status**
```bash
# sync-status.sh - Check if branches are in sync with documentation-master

#!/bin/bash
echo "📊 Documentation Sync Status"
echo "================================"

# Check main branch
git checkout main
main_behind=$(git rev-list --count HEAD..origin/documentation-master)
echo "main branch: $main_behind commits behind documentation-master"

# Check staging branch  
git checkout staging
staging_behind=$(git rev-list --count HEAD..origin/documentation-master)
echo "staging branch: $staging_behind commits behind documentation-master"

if [ "$main_behind" -gt 0 ] || [ "$staging_behind" -gt 0 ]; then
    echo "⚠️  Some branches need documentation sync"
else
    echo "✅ All branches are in sync"
fi

git checkout documentation-master
```

---

## 📈 SUCCESS METRICS

### **Consistency Indicators**
- ✅ **Zero documentation drift** between branches
- ✅ **Single source of truth** maintained
- ✅ **Clear ownership** of documentation updates
- ✅ **Automated enforcement** of documentation rules

### **Process Health**
- ✅ **Developer compliance** with documentation workflow
- ✅ **Timely synchronization** between branches
- ✅ **Documentation quality** maintained
- ✅ **Merge conflicts** minimized

### **Quality Metrics**
- ✅ **Documentation accuracy** matches implementation
- ✅ **Consistency** across all platform documentation
- ✅ **Completeness** of platform coverage
- ✅ **Freshness** of documentation updates

---

## 🚀 ROLLOUT PLAN

### **Phase 1: Foundation (COMPLETED)**
- [x] Create `documentation-master` branch
- [x] Update all documentation
- [x] Install git hooks
- [x] Document workflow

### **Phase 2: Team Adoption (IN PROGRESS)**
- [ ] Train team on new workflow
- [ ] Set up branch protection rules
- [ ] Create PR templates
- [ ] Establish review process

### **Phase 3: Automation (FUTURE)**
- [ ] Implement GitHub Actions for auto-sync
- [ ] Set up documentation validation
- [ ] Create sync monitoring
- [ ] Establish metrics dashboard

### **Phase 4: Optimization (FUTURE)**
- [ ] Optimize sync frequency
- [ ] Enhance enforcement mechanisms
- [ ] Improve developer experience
- [ ] Scale to multiple repositories

---

## 📞 SUPPORT & TROUBLESHOOTING

### **Common Issues**

#### **Problem**: Documentation changes rejected by git hook
**Solution**: 
```bash
git stash
git checkout documentation-master
git stash pop
# Make changes
git add *.md && git commit -m "docs: update"
git push origin documentation-master
```

#### **Problem**: Merge conflicts during documentation sync
**Solution**:
```bash
git checkout documentation-master
git pull origin documentation-master
git checkout target-branch
git merge documentation-master
# Resolve conflicts, preferring documentation-master version
git add . && git commit -m "docs: resolve sync conflicts"
```

#### **Problem**: Outdated documentation in feature branch
**Solution**:
```bash
git checkout feature-branch
git merge documentation-master --no-ff -m "docs: sync latest documentation"
```

---

**Status**: 🟢 **ACTIVE IMPLEMENTATION**  
**Last Updated**: June 29, 2025  
**Next Review**: July 6, 2025  
**Owner**: Platform Team
