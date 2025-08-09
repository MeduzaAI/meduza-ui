# Build System Specification

## Overview

Comprehensive build system for the meduza-ui monorepo using Turborepo, pnpm workspaces, and modern
development tools.

## Architecture

### Monorepo Structure

```
meduza-ui/
├── packages/
│   ├── cli/                    # @meduza-ui/cli
│   ├── core/                   # @meduza-ui/core
│   └── eslint-config/          # @meduza-ui/eslint-config
├── apps/
│   ├── docs/                   # Documentation site
│   └── playground/             # Component playground
├── templates/
│   ├── vite-vue/              # Starter templates
│   ├── nuxt/
│   └── quasar/
├── registry/                   # Component registry
│   ├── components/
│   ├── blocks/
│   └── utils/
└── tools/                      # Build tools and scripts
    ├── build-registry/
    ├── release/
    └── testing/
```

### Build Tools

- **Turborepo**: Build system orchestration and caching
- **pnpm**: Package manager with workspace support
- **tsup**: TypeScript bundler for packages
- **Vite**: Development and build tool for apps
- **TypeScript**: Type checking across all packages
- **ESLint + Prettier**: Code quality and formatting

## Turborepo Configuration

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".vitepress/dist/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "test:dev": {
      "cache": false
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "lint:fix": {
      "outputs": [],
      "cache": false
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "format": {
      "outputs": [],
      "cache": true
    },
    "format:write": {
      "outputs": [],
      "cache": false
    },
    "clean": {
      "cache": false
    },
    "registry:build": {
      "dependsOn": ["build"],
      "outputs": ["registry.json", "registry/**/*.json"],
      "cache": true
    },
    "registry:validate": {
      "dependsOn": ["registry:build"],
      "outputs": [],
      "cache": true
    },
    "docs:build": {
      "dependsOn": ["build", "registry:build"],
      "outputs": [".vitepress/dist/**"],
      "cache": true
    },
    "playground:build": {
      "dependsOn": ["build"],
      "outputs": ["dist/**"],
      "cache": true
    }
  },
  "globalDependencies": [
    "package.json",
    "pnpm-lock.yaml",
    "turbo.json",
    "tsconfig.json",
    ".eslintrc.js",
    "prettier.config.js"
  ]
}
```

## Package Build Configurations

### CLI Package (packages/cli)

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  minify: false,
  sourcemap: true,
  external: ['vue', '@vue/compiler-sfc', 'typescript'],
  banner: {
    js: '#!/usr/bin/env node',
  },
  onSuccess: async () => {
    // Make CLI executable
    await import('fs').then(fs => {
      fs.chmodSync('dist/index.js', '755');
    });
  },
});
```

```json
// package.json
{
  "name": "@meduza-ui/cli",
  "type": "module",
  "bin": {
    "meduza-ui": "./dist/index.js"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./registry": {
      "types": "./dist/registry/index.d.ts",
      "default": "./dist/registry/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:dev": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix"
  }
}
```

### Core Package (packages/core)

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  external: ['vue'],
  splitting: true,
});
```

```json
// package.json
{
  "name": "@meduza-ui/core",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils/index.d.ts",
      "import": "./dist/utils/index.js",
      "require": "./dist/utils/index.cjs"
    }
  },
  "files": ["dist"],
  "peerDependencies": {
    "vue": "^3.4.0"
  }
}
```

## App Build Configurations

### Documentation Site (apps/docs)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@/components': resolve(__dirname, 'components'),
      '@/styles': resolve(__dirname, 'styles'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/_functions.scss";
          @import "@/styles/_mixins.scss";
          @import "@/styles/_tokens.scss";
        `,
      },
    },
  },
  build: {
    outDir: '.vitepress/dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['vue'],
    },
  },
});
```

### Playground (apps/playground)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@meduza-ui/core': resolve(__dirname, '../../packages/core/src'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

## Registry Build System

### Registry Builder

```typescript
// tools/build-registry/index.ts
import { glob } from 'fast-glob';
import { readFile, writeFile, ensureDir } from 'fs-extra';
import { resolve, relative, dirname } from 'path';
import { parse } from '@vue/compiler-sfc';
import { Project, ScriptKind } from 'ts-morph';

interface RegistryBuilder {
  buildComponentRegistry(): Promise<void>;
  validateRegistry(): Promise<void>;
  generateTypeDefinitions(): Promise<void>;
}

export class RegistryBuilder implements RegistryBuilder {
  private outputDir: string;
  private sourceDir: string;

  constructor(sourceDir: string, outputDir: string) {
    this.sourceDir = sourceDir;
    this.outputDir = outputDir;
  }

  async buildComponentRegistry(): Promise<void> {
    console.log('🔨 Building component registry...');

    // Find all component files
    const componentFiles = await glob('**/*.vue', {
      cwd: this.sourceDir,
      absolute: true,
    });

    const registry: RegistryComponent[] = [];

    for (const file of componentFiles) {
      const component = await this.parseComponent(file);
      if (component) {
        registry.push(component);
      }
    }

    // Write registry file
    await ensureDir(this.outputDir);
    await writeFile(
      resolve(this.outputDir, 'registry.json'),
      JSON.stringify({ components: registry }, null, 2)
    );

    console.log(`✅ Built registry with ${registry.length} components`);
  }

  private async parseComponent(filePath: string): Promise<RegistryComponent | null> {
    const content = await readFile(filePath, 'utf-8');
    const { descriptor } = parse(content);

    if (!descriptor.script && !descriptor.scriptSetup) {
      return null;
    }

    const relativePath = relative(this.sourceDir, filePath);
    const componentName = this.getComponentName(relativePath);

    // Parse script for props, emits, etc.
    const scriptContent = descriptor.scriptSetup?.content || descriptor.script?.content || '';
    const metadata = await this.parseScriptMetadata(scriptContent);

    return {
      name: componentName,
      type: this.getComponentType(relativePath),
      files: [
        {
          path: relativePath,
          type: 'vue:component',
          content,
        },
      ],
      ...metadata,
    };
  }

  private async parseScriptMetadata(scriptContent: string): Promise<Partial<RegistryComponent>> {
    const project = new Project();
    const sourceFile = project.createSourceFile('temp.ts', scriptContent, {
      scriptKind: ScriptKind.TS,
    });

    // Extract props interface
    const propsInterface = this.extractPropsInterface(sourceFile);

    // Extract emits
    const emits = this.extractEmits(sourceFile);

    // Extract BEM configuration
    const bemConfig = this.extractBemConfig(sourceFile);

    return {
      props: propsInterface,
      emits,
      bem: bemConfig,
    };
  }

  async validateRegistry(): Promise<void> {
    console.log('🔍 Validating registry...');

    const registryPath = resolve(this.outputDir, 'registry.json');
    const registry = JSON.parse(await readFile(registryPath, 'utf-8'));

    const errors: string[] = [];

    for (const component of registry.components) {
      const componentErrors = await this.validateComponent(component);
      errors.push(...componentErrors);
    }

    if (errors.length > 0) {
      console.error('❌ Registry validation failed:');
      errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }

    console.log('✅ Registry validation passed');
  }

  private async validateComponent(component: RegistryComponent): Promise<string[]> {
    const errors: string[] = [];

    // Validate BEM naming
    if (!this.isValidBemBlock(component.bem?.block)) {
      errors.push(`Invalid BEM block name: ${component.bem?.block}`);
    }

    // Validate component files exist
    for (const file of component.files) {
      const filePath = resolve(this.sourceDir, file.path);
      try {
        await readFile(filePath);
      } catch {
        errors.push(`Component file not found: ${file.path}`);
      }
    }

    return errors;
  }
}
```

### Registry Build Script

```typescript
// scripts/build-registry.ts
import { RegistryBuilder } from '../tools/build-registry';
import { resolve } from 'path';

async function main() {
  const sourceDir = resolve(__dirname, '../registry');
  const outputDir = resolve(__dirname, '../dist/registry');

  const builder = new RegistryBuilder(sourceDir, outputDir);

  try {
    await builder.buildComponentRegistry();
    await builder.validateRegistry();
    await builder.generateTypeDefinitions();

    console.log('🎉 Registry build completed successfully!');
  } catch (error) {
    console.error('❌ Registry build failed:', error);
    process.exit(1);
  }
}

main();
```

## Development Workflow

### Root Package Scripts

```json
// package.json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "test": "turbo run test",
    "test:dev": "turbo run test:dev --parallel",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "typecheck": "turbo run typecheck",
    "format": "prettier --check \"**/*.{ts,tsx,vue,md,json}\"",
    "format:write": "prettier --write \"**/*.{ts,tsx,vue,md,json}\"",
    "clean": "turbo run clean && rm -rf node_modules/.cache",
    "registry:build": "turbo run registry:build",
    "registry:validate": "turbo run registry:validate",
    "docs:dev": "turbo run dev --filter=docs",
    "docs:build": "turbo run build --filter=docs",
    "playground:dev": "turbo run dev --filter=playground",
    "cli:dev": "turbo run dev --filter=@meduza-ui/cli",
    "cli:build": "turbo run build --filter=@meduza-ui/cli",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "changeset publish"
  }
}
```

### Development Commands

```bash
# Start development environment
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint and format
pnpm lint:fix
pnpm format:write

# Registry operations
pnpm registry:build
pnpm registry:validate

# Documentation
pnpm docs:dev
pnpm docs:build

# CLI development
pnpm cli:dev
pnpm cli:build
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test

      - name: Build registry
        run: pnpm registry:build

      - name: Validate registry
        run: pnpm registry:validate

      - name: Build documentation
        run: pnpm docs:build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./coverage
```

### Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    if: github.repository_owner == 'meduzaai'

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          title: 'chore: release packages'
          commit: 'chore: release packages'
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Performance Optimization

### Build Caching Strategy

1. **Turborepo Cache**: Aggressive caching of build outputs
2. **Docker Layer Caching**: For consistent CI environments
3. **NPM Registry Cache**: Faster dependency installation
4. **TypeScript Incremental Builds**: Faster type checking

### Bundle Optimization

```typescript
// Rollup configuration for optimized bundles
export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  external: ['vue', '@vue/runtime-core'],
  plugins: [
    typescript({
      typescript: require('typescript'),
      sourceMap: true,
      declaration: true,
      outDir: 'dist',
    }),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
};
```

## Quality Gates

### Pre-commit Hooks

```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx,vue}": ["eslint --fix", "prettier --write"],
    "*.{md,json}": ["prettier --write"],
    "*.scss": ["stylelint --fix", "prettier --write"]
  }
}
```

### Build Verification

- All packages must build successfully
- All tests must pass
- Linting must pass without errors
- Type checking must pass
- Registry validation must pass
- Documentation must build

This build system ensures consistent, reliable, and efficient development and deployment of the
meduza-ui library.
