# Meduza UI

A Vue.js component library with SCSS styling, inspired by shadcn/ui's copy-paste philosophy.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build registry
pnpm build:registry

# Build application
pnpm build
```

## Project Structure

- `apps/v1/` - Documentation and component registry application
- `packages/` - CLI package and other packages (to be added)
- `specs/` - Implementation specifications

## Development

This is a monorepo using pnpm workspaces. The main application is in `apps/v1` and serves as both the documentation site and component registry.

For detailed implementation information, see the specs in the `/specs` directory.
