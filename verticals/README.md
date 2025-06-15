# VERTICALS PLUGIN SYSTEM

This directory contains industry-specific configurations for the BridgeLayer platform. Each vertical maintains its own document types, AI prompts, and analysis modules while sharing the core platform infrastructure.

## Structure

```
/verticals/
├── firmsync/     → Legal industry (default)
├── medsync/      → Medical industry  
├── edusync/      → Education industry
└── hrsync/       → Hiring/HR industry
```

## Each Vertical Contains

- `/filetypes/` → Document configuration files
- `/prompts/` → AI behavior prompts and analysis modules
- `/reviewModules/` → Custom overrides for assemblePrompt()
- `config.json` → Vertical-specific settings

## Plugin Loading

The system automatically loads the appropriate vertical based on the firm's configuration:
- Default behavior uses existing logic
- Vertical-specific overrides are applied when present
- Document types can be added/removed per vertical
- Prompt assembly remains modular and transparent to end users

## Adding New Verticals

1. Create new directory under `/verticals/[name]/`
2. Copy structure from `/verticals/firmsync/` as template
3. Customize document types and prompts for industry
4. Update firm config to specify vertical: `"vertical": "[name]"`