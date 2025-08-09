# Meduza-UI Specifications

This directory contains detailed specifications for building the MeduzaAI component library system,
following the shadcn/ui architecture but adapted for Vue.js + SCSS with BEM methodology.

## Project Overview

**Name**: meduza-ui  
**Organization**: MeduzaAI  
**CLI Package**: `@meduza-ui/cli`  
**Installation**: `npx @meduza-ui/cli@latest`

## Core Principles

1. **BEM Methodology**: All components follow Block-Element-Modifier naming
2. **Pixel-based Design**: Use pixels instead of rem, all spacing in 4px increments
3. **Interface over Types**: Use TypeScript interfaces and enums for better structure
4. **Composition API Only**: Vue 3 Composition API exclusively
5. **Copy-Paste Philosophy**: Components are copied to user projects, not installed as dependencies

## Specifications Index

1. [Project Structure](./01-project-structure.md) - Overall monorepo and package organization
2. [BEM ClassName Utility](./02-bem-classname-utility.md) - useClassName helper function design
3. [CLI Package](./03-cli-package.md) - Command-line interface specification
4. [Component Registry](./04-component-registry.md) - Registry schema and structure
5. [SCSS System](./05-scss-system.md) - Styling and theming architecture
6. [Vue Components](./06-vue-components.md) - Component development standards
7. [Documentation Site](./07-documentation-site.md) - VitePress documentation website specification
8. [Framework Detection](./08-framework-detection.md) - Vue project type detection
9. [Build System](./09-build-system.md) - Build and deployment pipeline
10. [Testing Strategy](./10-testing-strategy.md) - Testing approach and tools

## Implementation Timeline

**Phase 1**: Core Infrastructure (Weeks 1-2)

- Project structure setup
- BEM className utility
- Basic CLI package

**Phase 2**: Component System (Weeks 3-4)

- Registry schema
- SCSS theming system
- First 5 UI components

**Phase 3**: Documentation & Polish (Weeks 5-6)

- Documentation site
- Testing setup
- CLI refinements

**Phase 4**: Launch Preparation (Week 7)

- Package publishing
- Documentation completion
- Examples and templates
