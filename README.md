# Meduza UI

Vue.js component library with SCSS and BEM methodology for MeduzaAI.

## Project Structure

This is a monorepo containing:

- **packages/cli** - `@meduza-ui/cli` package for component installation
- **packages/core** - `@meduza-ui/core` shared utilities and types
- **apps/docs** - Documentation website (Nuxt 3)
- **apps/playground** - Component playground (Vite + Vue 3)
- **templates/** - Framework starter templates
- **registry/** - Component and style registry
- **specs/** - Project specifications

## Development

### Requirements

- Node.js 20.0.0 or higher
- pnpm 9.0.0 or higher

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build all packages
pnpm build

# Run linting
pnpm lint
```

## Architecture

Follows the shadcn/ui copy-paste philosophy adapted for Vue.js ecosystem with:

- BEM methodology for CSS classes
- TypeScript interfaces and enums
- Vue 3 Composition API exclusively
