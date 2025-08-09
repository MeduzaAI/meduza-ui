# 06 - CLI Package Setup

## Overview
Create the foundational CLI package structure for Meduza UI, establishing the core architecture, dependencies, and utilities needed for the `init` and `add` commands. This follows the established patterns from shadcn/ui but adapted for Vue.js and SCSS.

## Goals
- Set up CLI package structure with TypeScript and modern tooling
- Implement core utilities for project detection and configuration management
- Establish command parser architecture with Commander.js
- Create foundation for registry API communication
- Set up build system and package exports
- Implement basic error handling and logging

## Package Structure

### 1. Package Configuration (`packages/cli/package.json`)
```json
{
  "name": "meduza-ui",
  "version": "0.1.0",
  "description": "Add Vue.js components with SCSS styling to your project.",
  "publishConfig": {
    "access": "public"
  },
  "license": "MIT",
  "author": {
    "name": "Meduza UI Team"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/meduza-ui.git",
    "directory": "packages/cli"
  },
  "files": [
    "dist"
  ],
  "keywords": [
    "vue",
    "components",
    "ui",
    "scss",
    "css",
    "vue3",
    "meduza-ui"
  ],
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "bin": "./dist/index.js",
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "clean": "rimraf dist",
    "test": "vitest run",
    "test:dev": "vitest",
    "format:write": "prettier --write \"**/*.{ts,tsx,mdx}\" --cache",
    "format:check": "prettier --check \"**/*.{ts,tsx,mdx}\" --cache"
  },
  "dependencies": {
    "@antfu/ni": "^23.2.0",
    "commander": "^10.0.0",
    "cosmiconfig": "^8.1.3",
    "deepmerge": "^4.3.1",
    "execa": "^7.0.0",
    "fast-glob": "^3.3.2",
    "fs-extra": "^11.1.0",
    "kleur": "^4.1.5",
    "node-fetch": "^3.3.0",
    "ora": "^6.1.2",
    "prompts": "^2.4.2",
    "zod": "^3.20.2"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.1",
    "@types/prompts": "^2.4.2",
    "rimraf": "^6.0.1",
    "tsup": "^6.6.3",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### 2. Build Configuration (`packages/cli/tsup.config.ts`)
```typescript
import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: ["esm"],
  sourcemap: true,
  minify: false, // Keep readable for debugging during development
  target: "node18",
  outDir: "dist",
  treeshake: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
})
```

### 3. TypeScript Configuration (`packages/cli/tsconfig.json`)
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowImportingTsExtensions": false,
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts"
  ]
}
```

## Core Architecture

### 4. Main CLI Entry Point (`packages/cli/src/index.ts`)
```typescript
#!/usr/bin/env node
import { Command } from "commander"
import packageJson from "../package.json"

// Import commands (will be implemented in subsequent specs)
// import { init } from "@/commands/init"
// import { add } from "@/commands/add"

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))

async function main() {
  const program = new Command()
    .name("meduza-ui")
    .description("Add Vue.js components with SCSS styling to your project")
    .version(
      packageJson.version || "0.1.0",
      "-v, --version",
      "display the version number"
    )

  // Commands will be added in subsequent specs
  // program.addCommand(init)
  // program.addCommand(add)

  // For now, show help when no command is provided
  if (process.argv.length <= 2) {
    program.help()
  }

  program.parse()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
```

### 5. Configuration Schema (`packages/cli/src/utils/config-schema.ts`)
```typescript
import { z } from "zod"

export const rawConfigSchema = z.object({
  $schema: z.string().optional(),
  style: z.string().default("default"),
  scss: z.object({
    variables: z.string(),
    mixins: z.string(),
  }),
  aliases: z.object({
    components: z.string(),
    ui: z.string(),
    lib: z.string(),
    utils: z.string(),
  }),
  registries: z.record(z.string(), z.string()).optional(),
})

export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    cwd: z.string(),
    scssVariables: z.string(),
    scssMixins: z.string(),
    components: z.string(),
    ui: z.string(),
    lib: z.string(),
    utils: z.string(),
  }),
})

export type Config = z.infer<typeof configSchema>
export type RawConfig = z.infer<typeof rawConfigSchema>

// Default configuration for Vue projects
export const DEFAULT_REGISTRIES = {
  "meduza-ui": "https://meduza-ui.com/r",
}

export const DEFAULT_CONFIG: RawConfig = {
  style: "default",
  scss: {
    variables: "src/assets/styles/_variables.scss",
    mixins: "src/assets/styles/_mixins.scss",
  },
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    lib: "@/lib",
    utils: "@/lib/utils",
  },
  registries: DEFAULT_REGISTRIES,
}
```

### 6. Project Detection Utilities (`packages/cli/src/utils/get-project-info.ts`)
```typescript
import * as fs from "fs-extra"
import * as path from "path"
import fg from "fast-glob"

export interface ProjectInfo {
  framework: "vue" | "nuxt" | "vite" | "manual"
  isSrcDir: boolean
  isTypeScript: boolean
  packageManager: "npm" | "yarn" | "pnpm" | "bun"
  aliasPrefix: string
}

const PROJECT_IGNORE = [
  "**/node_modules/**",
  ".nuxt",
  ".output",
  "public",
  "dist",
  "build",
]

export async function getProjectInfo(cwd: string): Promise<ProjectInfo | null> {
  const [
    configFiles,
    isSrcDir,
    isTypeScript,
    packageManager,
    aliasPrefix,
  ] = await Promise.all([
    fg.glob(
      "**/{nuxt,vite,vue}.config.*|package.json",
      {
        cwd,
        deep: 3,
        ignore: PROJECT_IGNORE,
      }
    ),
    fs.pathExists(path.resolve(cwd, "src")),
    isTypeScriptProject(cwd),
    getPackageManager(cwd),
    getAliasPrefix(cwd),
  ])

  const type: ProjectInfo = {
    framework: "manual",
    isSrcDir,
    isTypeScript,
    packageManager,
    aliasPrefix,
  }

  // Nuxt.js detection
  if (configFiles.find((file) => file.startsWith("nuxt.config."))) {
    type.framework = "nuxt"
    return type
  }

  // Vite detection
  if (configFiles.find((file) => file.startsWith("vite.config."))) {
    type.framework = "vite"
    return type
  }

  // Vue CLI detection (check package.json for @vue/cli-service)
  const packageJsonPath = path.resolve(cwd, "package.json")
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath)
    
    if (packageJson.dependencies?.["@vue/cli-service"] || 
        packageJson.devDependencies?.["@vue/cli-service"]) {
      type.framework = "vue"
      return type
    }
  }

  return type
}

export async function isTypeScriptProject(cwd: string): Promise<boolean> {
  const tsConfigPath = path.resolve(cwd, "tsconfig.json")
  return fs.pathExists(tsConfigPath)
}

export async function getPackageManager(cwd: string): Promise<ProjectInfo["packageManager"]> {
  // Check for lock files
  const lockFiles = await fg.glob(
    "{package-lock.json,yarn.lock,pnpm-lock.yaml,bun.lockb}",
    { cwd, deep: 1 }
  )

  if (lockFiles.includes("pnpm-lock.yaml")) return "pnpm"
  if (lockFiles.includes("yarn.lock")) return "yarn"
  if (lockFiles.includes("bun.lockb")) return "bun"
  if (lockFiles.includes("package-lock.json")) return "npm"

  // Fallback to npm
  return "npm"
}

export async function getAliasPrefix(cwd: string): Promise<string> {
  // Check tsconfig.json or jsconfig.json for path aliases
  const configFiles = ["tsconfig.json", "jsconfig.json"]
  
  for (const configFile of configFiles) {
    const configPath = path.resolve(cwd, configFile)
    if (await fs.pathExists(configPath)) {
      try {
        const config = await fs.readJson(configPath)
        const paths = config.compilerOptions?.paths
        
        if (paths) {
          // Look for common alias patterns
          for (const [alias] of Object.entries(paths)) {
            if (alias.endsWith("/*")) {
              return alias.slice(0, -2) // Remove /*
            }
          }
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
  }

  // Default alias
  return "@"
}
```

### 7. Configuration Management (`packages/cli/src/utils/get-config.ts`)
```typescript
import { cosmiconfig } from "cosmiconfig"
import * as fs from "fs-extra"
import * as path from "path"
import { z } from "zod"
import { configSchema, rawConfigSchema, DEFAULT_CONFIG, type Config, type RawConfig } from "./config-schema"

const MEDUZA_CONFIG_FILES = [
  "meduza.config.js",
  "meduza.config.ts", 
  "meduza.config.json",
  ".meduzarc",
  ".meduzarc.json",
]

export async function getConfig(cwd: string): Promise<Config | null> {
  const config = await getRawConfig(cwd)
  
  if (!config) {
    return null
  }

  return await resolveConfigPaths(cwd, config)
}

export async function getRawConfig(cwd: string): Promise<RawConfig | null> {
  try {
    const explorer = cosmiconfig("meduza", {
      searchPlaces: MEDUZA_CONFIG_FILES,
    })

    const result = await explorer.search(cwd)

    if (!result) {
      return null
    }

    return rawConfigSchema.parse(result.config)
  } catch (error) {
    console.error("Error loading configuration:", error)
    return null
  }
}

export async function resolveConfigPaths(
  cwd: string,
  config: RawConfig
): Promise<Config> {
  // Merge with default registries
  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    registries: {
      ...DEFAULT_CONFIG.registries,
      ...(config.registries || {}),
    },
  }

  return configSchema.parse({
    ...mergedConfig,
    resolvedPaths: {
      cwd,
      scssVariables: path.resolve(cwd, mergedConfig.scss.variables),
      scssMixins: path.resolve(cwd, mergedConfig.scss.mixins),
      components: await resolveAlias(cwd, mergedConfig.aliases.components),
      ui: await resolveAlias(cwd, mergedConfig.aliases.ui),
      lib: await resolveAlias(cwd, mergedConfig.aliases.lib),
      utils: await resolveAlias(cwd, mergedConfig.aliases.utils),
    },
  })
}

async function resolveAlias(cwd: string, alias: string): Promise<string> {
  // Handle @ alias
  if (alias.startsWith("@/")) {
    const srcPath = path.resolve(cwd, "src", alias.slice(2))
    const rootPath = path.resolve(cwd, alias.slice(2))
    
    // Check if src directory exists and prefer it
    if (await fs.pathExists(path.dirname(srcPath))) {
      return srcPath
    }
    
    return rootPath
  }

  // Handle other aliases (can be extended for different alias patterns)
  return path.resolve(cwd, alias)
}

export async function writeConfig(cwd: string, config: RawConfig): Promise<void> {
  const configPath = path.resolve(cwd, "meduza.config.json")
  await fs.writeFile(configPath, JSON.stringify(config, null, 2))
}
```

### 8. Registry API Types (`packages/cli/src/utils/registry.ts`)
```typescript
import { z } from "zod"

export const registryItemFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  type: z.enum(["registry:lib", "registry:ui", "registry:style", "registry:theme"]),
  target: z.string().optional(),
})

export const registryItemSchema = z.object({
  name: z.string(),
  type: z.enum(["registry:lib", "registry:ui", "registry:style", "registry:theme"]),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryItemFileSchema),
  cssVars: z.record(z.string(), z.string()).optional(),
  scssVars: z.record(z.string(), z.string()).optional(),
})

export const registryIndexSchema = z.array(
  z.object({
    name: z.string(),
    type: z.enum(["registry:lib", "registry:ui", "registry:style", "registry:theme"]),
    description: z.string().optional(),
  })
)

export type RegistryItem = z.infer<typeof registryItemSchema>
export type RegistryItemFile = z.infer<typeof registryItemFileSchema>
export type RegistryIndex = z.infer<typeof registryIndexSchema>

// Registry API functions (to be implemented in add command spec)
export async function fetchRegistryIndex(
  registryUrl: string
): Promise<RegistryIndex> {
  // Implementation will be added in the add command spec
  throw new Error("Not implemented yet")
}

export async function fetchRegistryItem(
  registryUrl: string,
  name: string
): Promise<RegistryItem> {
  // Implementation will be added in the add command spec  
  throw new Error("Not implemented yet")
}
```

### 9. Logging and Output Utilities (`packages/cli/src/utils/logger.ts`)
```typescript
import kleur from "kleur"
import ora, { type Ora } from "ora"

export class Logger {
  private spinner: Ora | null = null

  info(message: string): void {
    console.log(kleur.blue("ℹ"), message)
  }

  success(message: string): void {
    console.log(kleur.green("✓"), message)
  }

  warn(message: string): void {
    console.log(kleur.yellow("⚠"), message)
  }

  error(message: string): void {
    console.log(kleur.red("✖"), message)
  }

  break(): void {
    console.log()
  }

  spin(message: string): void {
    this.spinner = ora(message).start()
  }

  stopSpinner(success: boolean = true, message?: string): void {
    if (this.spinner) {
      if (success) {
        this.spinner.succeed(message)
      } else {
        this.spinner.fail(message)
      }
      this.spinner = null
    }
  }
}

export const logger = new Logger()
```

### 10. Error Handling (`packages/cli/src/utils/handle-error.ts`)
```typescript
import kleur from "kleur"
import { logger } from "./logger"

export function handleError(error: unknown): never {
  if (typeof error === "string") {
    logger.error(error)
    process.exit(1)
  }

  if (error instanceof Error) {
    logger.error(error.message)
    
    // Show stack trace in development
    if (process.env.NODE_ENV === "development") {
      console.error(kleur.dim(error.stack))
    }
    
    process.exit(1)
  }

  logger.error("Something went wrong. Please try again.")
  process.exit(1)
}
```

### 11. Package Manager Detection (`packages/cli/src/utils/get-package-manager.ts`)
```typescript
import { detect } from "@antfu/ni"

export async function getPackageManager(
  targetDir: string,
  { withFallback }: { withFallback?: boolean } = { withFallback: false }
): Promise<"yarn" | "pnpm" | "bun" | "npm"> {
  const packageManager = await detect({ programmatic: true, cwd: targetDir })

  if (packageManager === "yarn@berry") return "yarn"
  if (packageManager === "pnpm@6") return "pnpm"  
  if (packageManager === "bun") return "bun"
  
  if (!withFallback) {
    return packageManager ?? "npm"
  }

  // Fallback to user agent if not detected
  const userAgent = process.env.npm_config_user_agent || ""

  if (userAgent.startsWith("yarn")) {
    return "yarn"
  }

  if (userAgent.startsWith("pnpm")) {
    return "pnpm"
  }

  if (userAgent.startsWith("bun")) {
    return "bun"
  }

  return "npm"
}

export async function getPackageRunner(cwd: string): Promise<string> {
  const packageManager = await getPackageManager(cwd)
  
  // Return the appropriate run command for each package manager
  switch (packageManager) {
    case "yarn":
      return "yarn"
    case "pnpm":
      return "pnpm"
    case "bun":
      return "bun"
    default:
      return "npm run"
  }
}
```

## Testing Setup

### 12. Basic Test Setup (`packages/cli/vitest.config.ts`)
```typescript
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### 13. Example Test (`packages/cli/src/utils/__tests__/config-schema.test.ts`)
```typescript
import { describe, it, expect } from "vitest"
import { rawConfigSchema, configSchema, DEFAULT_CONFIG } from "../config-schema"

describe("config-schema", () => {
  it("should validate default config", () => {
    const result = rawConfigSchema.safeParse(DEFAULT_CONFIG)
    expect(result.success).toBe(true)
  })

  it("should require required fields", () => {
    const result = rawConfigSchema.safeParse({})
    expect(result.success).toBe(true) // Should pass with defaults
  })

  it("should validate custom config", () => {
    const customConfig = {
      ...DEFAULT_CONFIG,
      style: "custom",
      aliases: {
        ...DEFAULT_CONFIG.aliases,
        components: "~/components",
      },
    }

    const result = rawConfigSchema.safeParse(customConfig)
    expect(result.success).toBe(true)
  })
})
```

## Documentation

### 14. CLI README (`packages/cli/README.md`)
```markdown
# Meduza UI CLI

A CLI for adding Vue.js components with SCSS styling to your project.

## Installation

```bash
npm install -g meduza-ui
```

## Usage

### Initialize a new project

```bash
npx meduza-ui init
```

### Add components

```bash
npx meduza-ui add button
npx meduza-ui add button card
```

## Configuration

Meduza UI uses a configuration file to understand your project setup. You can configure the CLI using `meduza.config.json`:

```json
{
  "style": "default",
  "scss": {
    "variables": "src/assets/styles/_variables.scss",
    "mixins": "src/assets/styles/_mixins.scss"
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui", 
    "lib": "@/lib",
    "utils": "@/lib/utils"
  }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build
pnpm build

# Test
pnpm test
```
```

## Deliverables

1. **Complete CLI package structure** with proper TypeScript configuration
2. **Core utilities** for project detection and configuration management
3. **Command architecture** foundation using Commander.js
4. **Registry API types** and structure for future implementation
5. **Error handling** and logging utilities
6. **Package manager detection** and execution utilities
7. **Configuration schema** and management system
8. **Testing setup** with Vitest and example tests
9. **Build system** with tsup for optimal bundling
10. **Documentation** and package metadata

## Testing

- [ ] Package builds successfully with TypeScript
- [ ] CLI binary is executable and shows help
- [ ] Project detection works for Vue/Nuxt/Vite projects
- [ ] Configuration loading and parsing works correctly
- [ ] Package manager detection works across npm/yarn/pnpm/bun
- [ ] Logger utilities display formatted output
- [ ] Error handling gracefully manages different error types
- [ ] All utility functions have proper TypeScript types
- [ ] Tests pass and provide good coverage

## Next Steps

After this foundation is complete:
1. Implement the `init` command functionality (Spec 07)
2. Implement the `add` command functionality (Spec 08)
3. Add comprehensive end-to-end testing (Spec 09)
