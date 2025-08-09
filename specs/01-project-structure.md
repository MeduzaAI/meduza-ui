# Project Structure Specification

## Overview

Define the monorepo structure for meduza-ui, following shadcn's successful pattern but adapted for
Vue.js ecosystem.

## Repository Structure

```
meduza-ui/
├── packages/
│   ├── cli/                           # @meduza-ui/cli package
│   └── core/                          # @meduza-ui/core (shared utilities)
├── apps/
│   ├── docs/                          # Documentation website (Nuxt 3)
│   └── playground/                    # Component playground (Vite + Vue 3)
├── templates/
│   ├── vite-vue/                      # Vite + Vue 3 starter
│   ├── nuxt/                          # Nuxt 3 starter
│   └── quasar/                        # Quasar starter
├── registry/
│   ├── vue/                           # Vue components
│   ├── styles/                        # SCSS files
│   └── utils/                         # Utility functions
├── specs/                             # This documentation
└── tools/                             # Build and development tools
```

## Package Details

### packages/cli/

**Package Name**: `@meduza-ui/cli`  
**Purpose**: Command-line interface for component installation  
**Entry Point**: `dist/index.js`  
**Bin Command**: `meduza-ui`

```
packages/cli/
├── src/
│   ├── commands/
│   │   ├── init.ts                    # Initialize project
│   │   ├── add.ts                     # Add components
│   │   ├── remove.ts                  # Remove components
│   │   ├── update.ts                  # Update components
│   │   └── info.ts                    # Show project info
│   ├── utils/
│   │   ├── get-vue-project-info.ts    # Detect Vue framework
│   │   ├── get-config.ts              # Read meduza.config.json
│   │   ├── add-components.ts          # Component installation logic
│   │   ├── bem-generator.ts           # Generate BEM classes
│   │   └── framework-adapters/        # Framework-specific logic
│   │       ├── vite.ts
│   │       ├── nuxt.ts
│   │       └── quasar.ts
│   ├── registry/
│   │   ├── schema.ts                  # Registry item schema
│   │   ├── api.ts                     # Registry API client
│   │   └── resolver.ts                # Dependency resolution
│   └── index.ts                       # CLI entry point
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

### packages/core/

**Package Name**: `@meduza-ui/core`  
**Purpose**: Shared utilities and types  
**Entry Point**: `dist/index.js`

```
packages/core/
├── src/
│   ├── types/
│   │   ├── component.ts               # Component interfaces
│   │   ├── config.ts                  # Configuration interfaces
│   │   └── registry.ts                # Registry interfaces
│   ├── utils/
│   │   ├── bem.ts                     # BEM utility functions
│   │   ├── spacing.ts                 # 4px spacing utilities
│   │   └── validation.ts              # Validation helpers
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Configuration Files

### Root Configuration

- `pnpm-workspace.yaml` - Workspace configuration
- `turbo.json` - Build system configuration
- `tsconfig.json` - TypeScript base configuration
- `.eslintrc.js` - ESLint configuration
- `prettier.config.js` - Prettier configuration

### Project Configuration (User Projects)

`meduza.config.json` - User project configuration file:

```json
{
  "$schema": "https://meduza-ui.dev/schema.json",
  "framework": "vite" | "nuxt" | "quasar",
  "typescript": true,
  "style": "default",
  "bemPrefix": "",
  "spacing": {
    "unit": "px",
    "base": 4
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "utils": "@/utils",
    "composables": "@/composables"
  },
  "scss": {
    "variables": "@/styles/_variables.scss",
    "mixins": "@/styles/_mixins.scss",
    "components": "@/styles/components/"
  }
}
```

## Build System

### Tools

- **Package Manager**: pnpm with workspaces
- **Build System**: Turborepo for orchestration
- **Bundler**: tsup for TypeScript packages
- **Linting**: ESLint + Prettier
- **Testing**: Vitest + Vue Test Utils

### Scripts (Root package.json)

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "cli:dev": "pnpm --filter=@meduza-ui/cli dev",
    "docs:dev": "pnpm --filter=docs dev",
    "playground:dev": "pnpm --filter=playground dev"
  }
}
```

## Directory Naming Conventions

- **kebab-case**: All directory and file names
- **PascalCase**: Vue component files (e.g., `Button.vue`)
- **camelCase**: Utility functions and composables
- **SCREAMING_SNAKE_CASE**: Constants and enums

## File Extensions

- `.vue` - Vue Single File Components
- `.ts` - TypeScript files
- `.scss` - SCSS stylesheets
- `.json` - Configuration files
- `.md` - Documentation files

## Dependencies Management

### CLI Package Dependencies

- `commander` - CLI framework
- `prompts` - Interactive prompts
- `chalk` - Terminal colors
- `ora` - Loading spinners
- `fast-glob` - File pattern matching
- `fs-extra` - Enhanced file operations

### Core Package Dependencies

- Minimal dependencies for utilities
- Vue 3 as peer dependency
- TypeScript for type definitions

## Environment Variables

### Development

- `REGISTRY_URL` - Registry API URL (dev: localhost, prod: api.meduza-ui.dev)
- `NODE_ENV` - Environment (development/production)

### CI/CD

- `NPM_TOKEN` - NPM publishing token
- `REGISTRY_TOKEN` - Registry API token

## Security Considerations

- No sensitive data in templates
- Validate all user inputs
- Sanitize file paths
- Secure registry API endpoints
- Rate limiting for registry requests

## Performance Requirements

- CLI commands should complete within 30 seconds
- Component installation under 10 seconds
- Minimal package size (CLI < 5MB)
- Efficient dependency resolution

## Versioning Strategy

- Semantic versioning (semver)
- Independent package versioning
- Registry API versioning
- Component version tracking
