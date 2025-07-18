# Replit-Style IDE Toolbox for Bridgelayer

## 🛠️ Installed Extensions (500k+ downloads)

```vscode-extensions
ms-vscode.live-server,adpyke.codesnap,spywhere.guides,shopify.polaris-for-vscode,orta.vscode-react-native-storybooks,deerawan.vscode-faker,quicktype.quicktype,mohsen1.prettify-json,eriklynd.json-tools,natizyskunk.sftp,arjun.swagger-viewer,eamodio.gitlens
```

## 🚀 Quick Start Guide

### 1. Split-Pane Code + Live Preview
- **Shortcut**: `Ctrl+Shift+L` - Start live preview
- **Auto-save enabled**: Files save every 1 second for hot reload
- **Preview opens beside editor** for side-by-side development

### 2. Screenshot & Inspect
- **Shortcut**: `Ctrl+Shift+S` - Take beautiful code screenshots with CodeSnap
- **Guides extension** provides pixel-perfect rulers at 80 and 120 characters
- **Settings**: Transparent background, rounded corners, window controls

### 3. Terminal & Task Management
- **Shortcut**: `Ctrl+Shift+T` - New terminal
- **Pre-configured tasks**:
  - `Dev Server with Hot Reload` - Background Next.js dev server
  - `Supabase Start/Stop` - Database management
  - `Build Project` - Production build
  - `Generate Types` - TypeScript type generation

### 4. Component Library Browser
- **Custom snippets available**:
  - `btn` - Button component with variants
  - `card` - Card component with header/content
  - `input` - Input with label and error states
  - `modal` - Modal component
  - `spinner` - Loading spinner
  - `usemock` - Mock data hook
  - `usepreview` - Preview configuration hook

### 5. State & Data-Mocking Panel
- **vscode-faker** extension for generating fake data
- **JSON Tools** for formatting and manipulating data
- **Paste JSON as Code** for quick TypeScript interface generation
- **Mock hooks** included in snippets for development

### 6. AI-Driven Development
- **GitHub Copilot** enabled for all file types
- **GitLens** for enhanced Git visualization
- **IntelliCode** for API usage examples

### 7. GitSync & Branching UI
- **GitLens** provides inline blame, history, and comparisons
- **Auto-fetch** enabled for seamless sync
- **Smart commit** enabled for efficient workflow

## ⌨️ Key Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| Live Preview | `Ctrl+Shift+L` | Start live preview of current file |
| Screenshot | `Ctrl+Shift+S` | Take code screenshot |
| New Terminal | `Ctrl+Shift+T` | Open new terminal |
| Toggle Panel | `Ctrl+Shift+J` | Show/hide bottom panel |
| Explorer | `Ctrl+Shift+E` | Focus file explorer |
| Source Control | `Ctrl+Shift+G` | Open Git panel |
| Build Task | `Ctrl+Shift+B` | Run build task |
| Reload Window | `Ctrl+Shift+R` | Reload VS Code |

## 📁 Workspace Configuration

The following files have been configured for optimal development:

- `.vscode/settings.json` - IDE preferences and extension settings
- `.vscode/tasks.json` - Build and development tasks
- `.vscode/keybindings.json` - Custom keyboard shortcuts
- `.vscode/bridgelayer-components.code-snippets` - Component library snippets

## 🎯 Development Workflow

1. **Start Development**: Run "Dev Server with Hot Reload" task
2. **Split View**: Open live preview alongside your code
3. **Component Development**: Use snippets for rapid component creation
4. **Mock Data**: Use faker extension and mock hooks for realistic data
5. **Screenshot**: Capture components for documentation/discussion
6. **Git Workflow**: Use GitLens for enhanced version control

## 🔧 Advanced Features

### File Nesting
Configured to group related files (e.g., TypeScript source with compiled output)

### Auto-Import
TypeScript configured for automatic import management and relative paths

### JSON Validation
Full JSON validation and formatting support

### Component Preview
Storybook integration for component development and preview

This setup provides a comprehensive, Replit-style development environment optimized for React/Next.js development with Supabase integration.
