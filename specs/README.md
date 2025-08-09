# Meduza UI - Implementation Specs

A Vue.js component library with SCSS styling, inspired by shadcn/ui's copy-paste philosophy.

## Project Overview

Meduza UI is a Vue.js component library that provides beautifully designed, accessible components that developers copy directly into their projects. Unlike traditional npm packages, components are copied and owned by the developer, providing full customization control.

## Core Architecture

- **CLI Tool** (`packages/cli`) - Project initialization and component management
- **Documentation + Registry** (`apps/v1`) - Documentation site, component authoring, and distribution

## Implementation Plan - MVP First

### MVP Goal
Create a working registry with basic documentation and a CLI that can `init` and `add` components.

### MVP Implementation Steps

#### Step 1: Registry Foundation
- [x] [01 - Registry App Setup](./01-registry-app-setup.md)
- [ ] [02 - Registry Schema & Build System](./02-registry-schema-build.md)

#### Step 2: Init Support
- [ ] [03 - Init Requirements & Base Components](./03-init-requirements.md)

#### Step 3: First Component
- [ ] [04 - First Component](./04-first-component-docs.md)

#### Step 4: Documentation System
- [ ] [05 - Documentation & Markdown Support](./05-documentation-system.md)

#### Step 5: CLI Foundation
- [ ] [06 - CLI Package Setup](./06-cli-package-setup.md)

#### Step 6: CLI Init Command
- [ ] [07 - CLI Init Command](./07-cli-init-command.md)

#### Step 7: CLI Add Command
- [ ] [08 - CLI Add Command](./08-cli-add-command.md)

#### Step 8: MVP Launch
- [ ] [09 - MVP Testing & Deployment](./09-mvp-testing-deployment.md)

### Post-MVP: Iterative Development
- [ ] [10 - Component Development Process](./10-component-development-process.md)
- [ ] [11 - Release Strategy](./11-release-strategy.md)

## Quick Start for Developers

1. Read the specs in order
2. Each spec is self-contained with clear deliverables
3. Refer to shadcn/ui codebase for implementation patterns
4. Focus on Vue.js + SCSS instead of React + Tailwind

## MVP Commands Reference

```bash
# MVP User-facing commands
npx meduza-ui init     # Initialize Vue project
npx meduza-ui add button    # Add button component

# MVP Development commands
pnpm dev              # Start registry/docs app (apps/v1)
pnpm build:registry   # Build component registry
pnpm build:cli        # Build CLI package
```

## What the MVP Includes

### Registry Features
- Basic registry schema for Vue components with SCSS
- Build system that generates JSON from Vue SFCs
- Serves registry at `/r/` endpoint
- Basic documentation pages

### CLI Features  
- `init` command: Detects Vue projects, sets up SCSS, creates config
- `add` command: Fetches components from registry, installs dependencies

### Components
- Base style/theme system (for init)
- One functional UI component (e.g., Button)
- Component documentation page

## Key Principles

1. **Copy-Paste Philosophy**: Components are copied to user projects
2. **Developer Ownership**: Users own and can modify components
3. **Vue.js First**: Built specifically for Vue.js ecosystem
4. **SCSS Styling**: Powerful styling with variables and mixins
5. **Accessibility**: WCAG compliant components
6. **TypeScript**: Full type safety throughout
