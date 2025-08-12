# 01 - Registry App Setup

## Overview
Set up the foundational monorepo structure and create the registry application (`apps/v1`) that will serve as both the documentation site and component registry for Meduza UI.

## Goals
- Set up monorepo structure with pnpm workspaces
- Create a Vue.js/Nuxt application that serves the registry
- Set up basic project structure
- Configure development environment
- Prepare for registry endpoints and documentation

## Monorepo Structure
```
meduza-ui/
├── apps/
│   └── v1/                # Registry & Documentation app
│       ├── app/           # Nuxt 4 app directory
│       │   ├── app.vue    # Main app component
│       │   ├── index.vue  # Root page
│       │   ├── assets/
│       │   │   └── styles/ # SCSS files
│       │   ├── components/
│       │   │   └── ui/     # Component source files
│       │   ├── layouts/
│       │   │   └── default.vue
│       │   └── lib/       # Utility functions
│       ├── registry/      # Registry components and config
│       │   ├── default/   # Default theme components
│       │   │   ├── ui/    # UI components
│       │   │   └── lib/   # Library functions
│       │   ├── config/    # Configuration files
│       │   ├── styles/    # Registry-specific styles
│       │   └── registry-*.ts # Registry modules
│       ├── content/
│       │   └── docs/      # Documentation content
│       ├── public/
│       │   └── r/         # Generated registry JSON files
│       ├── scripts/
│       │   └── build-registry.ts  # Registry build script
│       ├── lib/           # Library files
│       ├── package.json
│       ├── nuxt.config.ts
│       ├── tsconfig.json
│       └── README.md
├── packages/              # Future CLI package location
├── package.json           # Root package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .gitignore
└── README.md
```

## Technology Stack
- **Framework**: Nuxt 4 (for SSG/SSR capabilities and easy API routes)
- **Styling**: SCSS + CSS custom properties
- **TypeScript**: Full TypeScript support
- **Build Tool**: Vite (included with Nuxt 4)

## Monorepo Setup

### Root Package.json
```json
{
  "name": "meduza-ui-monorepo",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "pnpm --filter=v1 dev",
    "build": "pnpm --filter=v1 build",
    "build:registry": "pnpm --filter=v1 build:registry"
  },
  "packageManager": "pnpm@9.0.6",
  "devDependencies": {
    "typescript": "^5.x"
  }
}
```

### Workspace Configuration (`pnpm-workspace.yaml`)
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Apps/v1 Dependencies (`apps/v1/package.json`)
```json
{
  "name": "v1",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@nuxt/content": "^2.x",
    "@vueuse/core": "^10.x",
    "sass": "^1.x",
    "clsx": "^2.x"
  },
  "devDependencies": {
    "@nuxt/devtools": "latest",
    "typescript": "^5.x"
  }
}
```

## Configuration

### Nuxt Config (`nuxt.config.ts`)
```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/content'],
  css: ['~/assets/styles/main.scss'],
  content: {
    documentDriven: true
  },
  nitro: {
    prerender: {
      routes: ['/r']
    }
  }
})
```

## Basic File Structure

### Main SCSS File (`assets/styles/main.scss`)
```scss
// Base styles
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}
```

### Basic Layout (`layouts/default.vue`)
```vue
<template>
  <div class="app">
    <header class="header">
      <h1>Meduza UI</h1>
    </header>
    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.main {
  flex: 1;
  padding: 1rem;
}
</style>
```

### Home Page (`pages/index.vue`)
```vue
<template>
  <div>
    <h1>Welcome to Meduza UI</h1>
    <p>A Vue.js component library with SCSS styling.</p>
  </div>
</template>
```

## Development Scripts

### V1 App Scripts (`apps/v1/package.json`)
```json
{
  "scripts": {
    "dev": "nuxt dev --port 3000",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "build:registry": "tsx scripts/build-registry.ts"
  }
}
```

### Root Development Commands
```bash
# From root directory
pnpm dev              # Start v1 app
pnpm build            # Build v1 app  
pnpm build:registry   # Build registry for v1 app

# Or run directly in app
cd apps/v1
pnpm dev
```



## Deliverables

1. **Monorepo structure** with pnpm workspaces
2. **Working Nuxt 4 application** with basic structure
3. **Development environment** with hot reload
4. **SCSS setup** with proper configuration
5. **Basic documentation structure** ready for content

## Initialization Steps

1. **Create monorepo structure**:
   ```bash
   mkdir meduza-ui
   cd meduza-ui
   mkdir -p apps/v1 packages
   ```

2. **Set up root workspace**:
   ```bash
   # Create root package.json and pnpm-workspace.yaml
   pnpm init
   # Edit package.json and add workspace config
   ```

3. **Initialize v1 app**:
   ```bash
   cd apps/v1
   npx nuxi@latest init . --package-manager pnpm
   # Configure according to spec
   ```

4. **Install dependencies**:
   ```bash
   # From root
   pnpm install
   ```

## Testing

- [ ] Monorepo structure is created correctly
- [ ] `pnpm dev` from root starts the v1 application successfully
- [ ] Application loads at `http://localhost:3000`
- [ ] SCSS compilation works in v1 app
- [ ] TypeScript compilation works without errors
- [ ] Workspace commands work from root directory

