# Tailwind CSS Configuration Guide

## Overview
This project uses Tailwind CSS v4 with a comprehensive configuration for the Bridgelayer Meta-SaaS platform.

## Configuration Files

### 1. `tailwind.config.ts`
- Main Tailwind configuration file
- Includes custom color palette, spacing, animations
- Configured for all source directories

### 2. `src/app/globals.css`
- CSS variables for theming (light/dark mode)
- Base styles and utility classes
- Imports Tailwind CSS

### 3. `postcss.config.mjs`
- PostCSS configuration for Tailwind processing
- Uses `@tailwindcss/postcss` plugin

### 4. `.vscode/settings.json`
- VS Code settings for Tailwind IntelliSense
- Class autocompletion and validation
- Custom regex patterns for class detection

## Utility Functions

### `src/utils/tailwind.ts`
Provides utility functions and pre-defined class combinations:

```typescript
import { cn, buttonVariants, cardVariants } from '@/utils/tailwind'

// Merge classes conditionally
const className = cn(
  'base-class',
  condition && 'conditional-class',
  'another-class'
)

// Use predefined button styles
<button className={buttonVariants.primary}>Primary Button</button>
```

## Key Features

### 1. Dark Mode Support
Automatic dark mode detection with CSS variables:
```css
/* Light mode */
:root {
  --background: #ffffff;
  --foreground: #171717;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

### 2. Custom Color Palette
- Primary blues (blue-50 to blue-900)
- Secondary grays (gray-50 to gray-900)
- Status colors (success, warning, error)

### 3. Custom Animations
- `fade-in`: Smooth opacity transition
- `slide-up`: Slide up with fade effect
- `slide-down`: Slide down with fade effect

### 4. Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

## Usage Examples

### Basic Component
```tsx
export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {children}
    </div>
  )
}
```

### Responsive Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

### Interactive Elements
```tsx
<button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
  Click me
</button>
```

### Status Indicators
```tsx
<div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
  <span className="text-green-700 dark:text-green-300">Online</span>
</div>
```

## Best Practices

### 1. Use Semantic Classes
```tsx
// ✅ Good
<div className="container mx-auto px-4">

// ❌ Avoid
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### 2. Group Related Classes
```tsx
// ✅ Good - grouped by purpose
<div className="
  flex items-center justify-between
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  rounded-lg shadow-md
  p-4 mb-4
">
```

### 3. Use Utility Functions
```tsx
// ✅ Good
import { cn, buttonVariants } from '@/utils/tailwind'

<button className={cn(
  buttonVariants.primary,
  isLoading && 'opacity-50 cursor-not-allowed'
)}>
```

## Development Workflow

### 1. IntelliSense
- Tailwind CSS IntelliSense extension provides autocompletion
- Hover documentation for class meanings
- Color previews for color classes

### 2. Class Validation
- ESLint integration for class validation
- Unknown class warnings
- Duplicate class detection

### 3. Hot Reload
- Changes to Tailwind classes trigger hot reload
- No need to restart development server

## Customization

### Adding Custom Colors
Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      brand: {
        50: '#f0f9ff',
        500: '#0ea5e9',
        900: '#0c4a6e',
      }
    }
  }
}
```

### Adding Custom Utilities
Add to `src/app/globals.css`:
```css
.text-gradient {
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Troubleshooting

### Classes Not Applying
1. Check if classes are in the `content` array in `tailwind.config.ts`
2. Verify PostCSS configuration
3. Restart development server

### IntelliSense Not Working
1. Ensure Tailwind CSS extension is installed
2. Check `.vscode/settings.json` configuration
3. Reload VS Code window

### Build Issues
1. Verify all files are saved
2. Check for typos in class names
3. Ensure Tailwind is properly imported in `globals.css`
