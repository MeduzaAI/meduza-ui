# CLI Package Specification

## Overview

Detailed specification for the `@meduza-ui/cli` package, providing command-line interface for
component installation and project management.

## Package Configuration

### package.json

```json
{
  "name": "@meduza-ui/cli",
  "version": "1.0.0",
  "description": "CLI for MeduzaAI component library",
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
    "dev": "tsup --watch",
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "keywords": ["vue", "ui", "components", "bem", "cli"],
  "repository": {
    "type": "git",
    "url": "https://github.com/meduzaai/meduza-ui.git",
    "directory": "packages/cli"
  }
}
```

## Commands

### 1. init - Initialize Project

**Command**: `meduza-ui init`

**Purpose**: Set up a new project with meduza-ui configuration

**Options**:

- `--framework <type>` - Framework type (vite, nuxt, quasar)
- `--typescript` - Use TypeScript (default: true)
- `--src-dir` - Use src directory structure
- `--style <name>` - Style variant (default)
- `--force` - Overwrite existing configuration

**Flow**:

1. Detect existing Vue project or create new one
2. Install required dependencies
3. Create `meduza.config.json`
4. Set up SCSS structure
5. Install `useClassName` utility
6. Configure framework-specific settings

```typescript
// commands/init.ts
export interface InitOptions {
  framework?: 'vite' | 'nuxt' | 'quasar';
  typescript?: boolean;
  srcDir?: boolean;
  style?: string;
  force?: boolean;
  cwd: string;
}

export async function runInit(options: InitOptions) {
  // 1. Detect or prompt for framework
  const framework = (await detectFramework(options.cwd)) || (await promptFramework());

  // 2. Create project if needed
  if (!(await isVueProject(options.cwd))) {
    await createVueProject(framework, options);
  }

  // 3. Install dependencies
  await installDependencies(framework, options);

  // 4. Generate configuration
  await generateConfig(options);

  // 5. Set up SCSS structure
  await setupScssStructure(options);

  // 6. Install utilities
  await installUtilities(options);
}
```

### 2. add - Add Components

**Command**: `meduza-ui add <components...>`

**Purpose**: Install one or more components

**Options**:

- `--overwrite` - Overwrite existing files
- `--all` - Add all available components
- `--path <path>` - Custom installation path

**Examples**:

```bash
meduza-ui add button
meduza-ui add button input dialog
meduza-ui add --all
```

**Flow**:

1. Read project configuration
2. Resolve component dependencies
3. Fetch component files from registry
4. Install SCSS styles
5. Update imports and dependencies

```typescript
// commands/add.ts
export interface AddOptions {
  components: string[];
  overwrite?: boolean;
  all?: boolean;
  path?: string;
  cwd: string;
}

export async function runAdd(options: AddOptions) {
  const config = await readConfig(options.cwd);

  if (options.all) {
    options.components = await getAllComponentNames();
  }

  // Resolve component tree with dependencies
  const componentTree = await resolveComponents(options.components);

  // Install each component
  for (const component of componentTree) {
    await installComponent(component, config, options);
  }

  // Update package.json if needed
  await updateDependencies(componentTree, config);
}
```

### 3. remove - Remove Components

**Command**: `meduza-ui remove <components...>`

**Purpose**: Remove installed components

**Options**:

- `--clean` - Remove unused dependencies

```typescript
// commands/remove.ts
export async function runRemove(options: RemoveOptions) {
  const config = await readConfig(options.cwd);

  for (const componentName of options.components) {
    await removeComponent(componentName, config);
  }

  if (options.clean) {
    await cleanUnusedDependencies(config);
  }
}
```

### 4. update - Update Components

**Command**: `meduza-ui update [components...]`

**Purpose**: Update components to latest version

**Options**:

- `--all` - Update all components
- `--check-only` - Only check for updates

### 5. info - Project Information

**Command**: `meduza-ui info`

**Purpose**: Display project and component information

**Output**:

- Project framework and configuration
- Installed components and versions
- Available updates

## Framework Detection

### Vue Project Detection

```typescript
// utils/get-vue-project-info.ts
export interface VueProjectInfo {
  framework: 'vite' | 'nuxt' | 'quasar' | 'vue-cli' | 'manual';
  hasTypeScript: boolean;
  hasSrcDir: boolean;
  vueVersion: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

export async function getVueProjectInfo(cwd: string): Promise<VueProjectInfo> {
  const packageJson = await readPackageJson(cwd);
  const configFiles = await findConfigFiles(cwd);

  // Detect framework
  let framework: VueProjectInfo['framework'] = 'manual';

  if (configFiles.includes('nuxt.config.ts') || configFiles.includes('nuxt.config.js')) {
    framework = 'nuxt';
  } else if (configFiles.includes('vite.config.ts') || configFiles.includes('vite.config.js')) {
    framework = 'vite';
  } else if (configFiles.includes('quasar.config.js')) {
    framework = 'quasar';
  } else if (configFiles.includes('vue.config.js')) {
    framework = 'vue-cli';
  }

  // Detect other properties
  const hasTypeScript = await fs.pathExists(path.join(cwd, 'tsconfig.json'));
  const hasSrcDir = await fs.pathExists(path.join(cwd, 'src'));
  const vueVersion = getVueVersion(packageJson);
  const packageManager = await detectPackageManager(cwd);

  return {
    framework,
    hasTypeScript,
    hasSrcDir,
    vueVersion,
    packageManager,
  };
}
```

## Configuration Management

### Config Schema

```typescript
// utils/config-schema.ts
export const configSchema = z.object({
  $schema: z.string().optional(),
  framework: z.enum(['vite', 'nuxt', 'quasar', 'vue-cli']),
  typescript: z.boolean().default(true),
  style: z.string().default('default'),
  bemPrefix: z.string().default(''),
  spacing: z.object({
    unit: z.literal('px'),
    base: z.number().default(4),
  }),
  aliases: z.object({
    components: z.string().default('@/components'),
    ui: z.string().default('@/components/ui'),
    utils: z.string().default('@/utils'),
    composables: z.string().default('@/composables'),
  }),
  scss: z.object({
    variables: z.string().default('@/styles/_variables.scss'),
    mixins: z.string().default('@/styles/_mixins.scss'),
    components: z.string().default('@/styles/components/'),
  }),
  resolvedPaths: z.object({
    cwd: z.string(),
    components: z.string(),
    ui: z.string(),
    utils: z.string(),
    styles: z.string(),
  }),
});

export type Config = z.infer<typeof configSchema>;
```

### Config File Operations

```typescript
// utils/get-config.ts
export async function readConfig(cwd: string): Promise<Config | null> {
  const configPath = path.join(cwd, 'meduza.config.json');

  if (!(await fs.pathExists(configPath))) {
    return null;
  }

  const rawConfig = await fs.readJson(configPath);
  const config = configSchema.parse(rawConfig);

  // Resolve paths
  return await resolveConfigPaths(cwd, config);
}

export async function writeConfig(cwd: string, config: Config): Promise<void> {
  const configPath = path.join(cwd, 'meduza.config.json');
  const { resolvedPaths, ...serializedConfig } = config;

  await fs.writeJson(configPath, serializedConfig, { spaces: 2 });
}
```

## Component Installation

### Installation Flow

```typescript
// utils/install-component.ts
export async function installComponent(
  component: RegistryComponent,
  config: Config,
  options: InstallOptions
) {
  // 1. Create component directories
  await ensureDirectories(config);

  // 2. Install Vue component files
  for (const file of component.files.vue) {
    await installVueFile(file, config, options);
  }

  // 3. Install SCSS files
  for (const file of component.files.scss) {
    await installScssFile(file, config, options);
  }

  // 4. Install utility files
  for (const file of component.files.utils) {
    await installUtilFile(file, config, options);
  }

  // 5. Update component registry
  await updateLocalRegistry(component, config);
}
```

### File Processing

```typescript
// utils/file-processor.ts
export async function processVueFile(content: string, config: Config): Promise<string> {
  // 1. Update import paths based on aliases
  content = updateImportPaths(content, config.aliases);

  // 2. Update BEM class names with prefix
  if (config.bemPrefix) {
    content = updateBemPrefix(content, config.bemPrefix);
  }

  // 3. Convert spacing values to pixels
  content = convertSpacingToPx(content, config.spacing);

  return content;
}

export async function processScssFile(content: string, config: Config): Promise<string> {
  // 1. Update SCSS imports
  content = updateScssImports(content, config.scss);

  // 2. Apply BEM prefix
  if (config.bemPrefix) {
    content = applyBemPrefix(content, config.bemPrefix);
  }

  // 3. Convert rem to px values
  content = convertRemToPx(content);

  return content;
}
```

## Registry Integration

### Registry API Client

```typescript
// registry/api.ts
export class RegistryClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl = 'https://registry.meduza-ui.dev') {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      'User-Agent': `@meduza-ui/cli@${process.env.CLI_VERSION}`,
    };
  }

  async getComponent(name: string): Promise<RegistryComponent> {
    const response = await fetch(`${this.baseUrl}/components/${name}`);

    if (!response.ok) {
      throw new Error(`Component '${name}' not found`);
    }

    return response.json();
  }

  async getAllComponents(): Promise<RegistryComponent[]> {
    const response = await fetch(`${this.baseUrl}/components`);
    return response.json();
  }

  async getComponentDependencies(name: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/components/${name}/dependencies`);
    return response.json();
  }
}
```

## Error Handling

### Error Types

```typescript
// utils/errors.ts
export class MeduzaError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'MeduzaError';
  }
}

export class ConfigError extends MeduzaError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
  }
}

export class ComponentError extends MeduzaError {
  constructor(message: string) {
    super(message, 'COMPONENT_ERROR');
  }
}

export class NetworkError extends MeduzaError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}
```

### Error Handler

```typescript
// utils/handle-error.ts
export function handleError(error: unknown): never {
  if (error instanceof MeduzaError) {
    console.error(chalk.red(`Error: ${error.message}`));

    if (error.code === 'NETWORK_ERROR') {
      console.error(chalk.yellow('Check your internet connection and try again.'));
    }
  } else if (error instanceof Error) {
    console.error(chalk.red(`Unexpected error: ${error.message}`));
  } else {
    console.error(chalk.red('An unknown error occurred'));
  }

  process.exit(1);
}
```

## Logging and Progress

### Logger Implementation

```typescript
// utils/logger.ts
import chalk from 'chalk';
import ora from 'ora';

export class Logger {
  private silent: boolean;

  constructor(silent = false) {
    this.silent = silent;
  }

  info(message: string) {
    if (!this.silent) {
      console.log(chalk.blue('ℹ'), message);
    }
  }

  success(message: string) {
    if (!this.silent) {
      console.log(chalk.green('✓'), message);
    }
  }

  warn(message: string) {
    if (!this.silent) {
      console.log(chalk.yellow('⚠'), message);
    }
  }

  error(message: string) {
    console.error(chalk.red('✗'), message);
  }

  spinner(message: string) {
    return this.silent ? null : ora(message);
  }
}
```

## Testing Strategy

### CLI Commands Testing

```typescript
// tests/commands/init.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { runInit } from '@/commands/init';
import { createTempDir, cleanTempDir } from '@/test-utils';

describe('init command', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanTempDir(tempDir);
  });

  it('should initialize vite project', async () => {
    await runInit({
      framework: 'vite',
      typescript: true,
      cwd: tempDir,
    });

    // Assert config file created
    expect(await fs.pathExists(path.join(tempDir, 'meduza.config.json'))).toBe(true);

    // Assert utilities installed
    expect(await fs.pathExists(path.join(tempDir, 'src/utils/useClassName.ts'))).toBe(true);
  });
});
```

## Performance Optimization

- Concurrent file operations where possible
- Caching of registry responses
- Minimal dependency tree analysis
- Efficient file watching for development
- Progress indication for long operations

## Security Considerations

- Validate all file paths to prevent directory traversal
- Sanitize component names and content
- Secure registry communications (HTTPS)
- Verify file integrity with checksums
- Rate limiting for registry requests
