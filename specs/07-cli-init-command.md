# 07 - CLI Init Command

## Overview
Implement the `init` command for the Meduza UI CLI that initializes a Vue.js project with SCSS styling. The command sets up the project structure, installs base styles, utilities, and configuration files needed for using Meduza UI components.

## Goals
- Detect and validate Vue.js project setup
- Install base SCSS variables, mixins, and utility functions
- Create configuration file (`meduza.config.json`)
- Set up proper directory structure and aliases
- Install core dependencies for Vue + SCSS workflow
- Provide interactive prompts for customization options

## Command Implementation

### 1. Init Command Definition (`packages/cli/src/commands/init.ts`)
```typescript
import { Command } from "commander"
import { z } from "zod"
import * as fs from "fs-extra"
import * as path from "path"
import prompts from "prompts"
import kleur from "kleur"

import { getProjectInfo } from "@/utils/get-project-info"
import { getConfig, writeConfig, type RawConfig } from "@/utils/get-config"
import { logger } from "@/utils/logger"
import { handleError } from "@/utils/handle-error"
import { addComponents } from "@/utils/add-components"

const initOptionsSchema = z.object({
  cwd: z.string(),
  yes: z.boolean(),
  defaults: z.boolean(),
  force: z.boolean(),
  silent: z.boolean(),
  srcDir: z.boolean().optional(),
  style: z.string().default("default"),
  baseColor: z.string().optional(),
})

export const init = new Command()
  .name("init")
  .description("initialize your Vue.js project and install base styles")
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option("-d, --defaults", "use default configuration.", false)
  .option("-f, --force", "force overwrite of existing configuration.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-s, --silent", "mute output.", false)
  .option(
    "--src-dir",
    "use the src directory when creating a new project.",
    false
  )
  .option(
    "--no-src-dir",
    "do not use the src directory when creating a new project."
  )
  .option(
    "--style <style>",
    "the style to use. (default)",
    "default"
  )
  .option(
    "--base-color <base-color>",
    "the base color to use. (slate, gray, zinc, neutral, stone)",
    undefined
  )
  .action(async (opts) => {
    try {
      const options = initOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        ...opts,
      })

      await runInit(options)
    } catch (error) {
      handleError(error)
    }
  })

export async function runInit(options: z.infer<typeof initOptionsSchema>) {
  const projectInfo = await getProjectInfo(options.cwd)
  
  if (!projectInfo) {
    logger.error("Could not detect a Vue.js project. Please run this command in a Vue.js project directory.")
    process.exit(1)
  }

  if (!options.silent) {
    logger.info(`Detected ${kleur.cyan(projectInfo.framework)} project.`)
  }

  // Check for existing configuration
  const existingConfig = await getConfig(options.cwd)
  
  if (existingConfig && !options.force) {
    logger.warn("Configuration file already exists. Use --force to overwrite.")
    process.exit(1)
  }

  // Prompt for configuration
  let config: RawConfig
  if (options.defaults) {
    config = getDefaultConfig(projectInfo, options)
  } else {
    config = await promptForConfig(projectInfo, options)
  }

  // Confirm configuration
  if (!options.yes && !options.silent) {
    const { proceed } = await prompts({
      type: "confirm",
      name: "proceed",
      message: `Write configuration to ${kleur.info("meduza.config.json")}. Proceed?`,
      initial: true,
    })

    if (!proceed) {
      process.exit(0)
    }
  }

  // Write configuration
  const spinner = logger.spin("Writing configuration...")
  await writeConfig(options.cwd, config)
  logger.stopSpinner(true, "Configuration written.")

  // Install base components
  const resolvedConfig = await resolveConfigPaths(options.cwd, config)
  await installBaseComponents(resolvedConfig, options)

  if (!options.silent) {
    logger.success("Project initialized successfully!")
    logger.break()
    logger.info("Next steps:")
    logger.info("1. Import the base styles in your main CSS file:")
    logger.info(`   ${kleur.cyan(`@import "${config.scss.variables}";`)}`)
    logger.info(`   ${kleur.cyan(`@import "${config.scss.mixins}";`)}`)
    logger.break()
    logger.info("2. Start adding components:")
    logger.info("   " + kleur.cyan("npx meduza-ui add button"))
  }
}
```

### 2. Configuration Prompting (`packages/cli/src/commands/init.ts` continued)
```typescript
import { availableColors, getRegistryColors } from "@/utils/registry-api"

async function promptForConfig(
  projectInfo: ProjectInfo,
  options: z.infer<typeof initOptionsSchema>
): Promise<RawConfig> {
  const [colors] = await Promise.all([
    getRegistryColors(),
  ])

  const responses = await prompts([
    {
      type: "select",
      name: "style",
      message: "Which style would you like to use?",
      choices: [
        { title: "Default", value: "default", description: "A clean, minimal design system" },
      ],
      initial: 0,
    },
    {
      type: "select", 
      name: "baseColor",
      message: "Which base color would you like to use?",
      choices: colors.map((color) => ({
        title: color.label,
        value: color.name,
        description: `Use ${color.label.toLowerCase()} as the base color`,
      })),
      initial: 0,
    },
    {
      type: "text",
      name: "scssVariables",
      message: "Where would you like to store your SCSS variables?",
      initial: projectInfo.isSrcDir 
        ? "src/assets/styles/_variables.scss"
        : "assets/styles/_variables.scss",
    },
    {
      type: "text", 
      name: "scssMixins",
      message: "Where would you like to store your SCSS mixins?",
      initial: projectInfo.isSrcDir
        ? "src/assets/styles/_mixins.scss" 
        : "assets/styles/_mixins.scss",
    },
    {
      type: "text",
      name: "components",
      message: "Configure the import alias for components:",
      initial: "@/components",
    },
    {
      type: "text",
      name: "utils",
      message: "Configure the import alias for utils:",
      initial: "@/lib/utils",
    },
  ])

  const aliasPrefix = projectInfo.aliasPrefix

  return {
    $schema: "https://meduza-ui.com/schema.json",
    style: responses.style,
    scss: {
      variables: responses.scssVariables,
      mixins: responses.scssMixins,
    },
    aliases: {
      components: responses.components,
      ui: `${responses.components}/ui`,
      lib: `${aliasPrefix}/lib`,
      utils: responses.utils,
    },
    registries: {
      "meduza-ui": "https://meduza-ui.com/r",
    },
  }
}

function getDefaultConfig(
  projectInfo: ProjectInfo,
  options: z.infer<typeof initOptionsSchema>
): RawConfig {
  const baseDir = projectInfo.isSrcDir ? "src" : ""
  const aliasPrefix = projectInfo.aliasPrefix

  return {
    $schema: "https://meduza-ui.com/schema.json",
    style: options.style,
    scss: {
      variables: path.join(baseDir, "assets/styles/_variables.scss"),
      mixins: path.join(baseDir, "assets/styles/_mixins.scss"),
    },
    aliases: {
      components: `${aliasPrefix}/components`,
      ui: `${aliasPrefix}/components/ui`,
      lib: `${aliasPrefix}/lib`,
      utils: `${aliasPrefix}/lib/utils`,
    },
    registries: {
      "meduza-ui": "https://meduza-ui.com/r",
    },
  }
}
```

### 3. Base Component Installation (`packages/cli/src/utils/add-components.ts`)
```typescript
import { fetchRegistryItem, type RegistryItem } from "./registry-api"
import { updateFiles } from "./updaters/update-files"
import { updateDependencies } from "./updaters/update-dependencies"
import { type Config } from "./get-config"

export async function addComponents(
  components: string[],
  config: Config,
  options: {
    overwrite?: boolean
    silent?: boolean
    isInit?: boolean
  } = {}
) {
  if (components.length === 0) return

  const { overwrite = false, silent = false, isInit = false } = options

  // Fetch components from registry
  const spinner = logger.spin("Fetching components from registry...")
  
  const items: RegistryItem[] = []
  for (const componentName of components) {
    try {
      const item = await fetchRegistryItem(config.registries["meduza-ui"], componentName)
      items.push(item)
    } catch (error) {
      logger.stopSpinner(false, `Failed to fetch ${componentName}`)
      throw error
    }
  }

  logger.stopSpinner(true, "Components fetched.")

  // Install dependencies
  const allDependencies = items.flatMap(item => item.dependencies || [])
  const allRegistryDependencies = items.flatMap(item => item.registryDependencies || [])

  if (allDependencies.length > 0) {
    await updateDependencies(allDependencies, [], config, { silent })
  }

  // Install registry dependencies recursively
  if (allRegistryDependencies.length > 0) {
    await addComponents(allRegistryDependencies, config, { overwrite: true, silent, isInit })
  }

  // Install files
  const allFiles = items.flatMap(item => item.files)
  await updateFiles(allFiles, config, { overwrite, silent })

  // Show success message
  if (!silent) {
    for (const componentName of components) {
      logger.success(`Added ${componentName}`)
    }
  }
}

async function installBaseComponents(
  config: Config,
  options: z.infer<typeof initOptionsSchema>
) {
  // Install base utilities and styles
  const baseComponents = [
    "utils",           // useClassName utility and cn helper
    "variables",       // CSS custom properties
    "mixins",          // SCSS mixins  
    "index",          // Base style configuration
  ]

  await addComponents(baseComponents, config, {
    overwrite: true,
    silent: options.silent,
    isInit: true,
  })
}
```

### 4. Registry API Implementation (`packages/cli/src/utils/registry-api.ts`)
```typescript
import fetch from "node-fetch"
import { z } from "zod"
import { registryItemSchema, registryIndexSchema } from "./registry"

const colorSchema = z.object({
  name: z.string(),
  label: z.string(),
  colors: z.record(z.string(), z.string()),
})

const colorsSchema = z.array(colorSchema)

export async function fetchRegistryIndex(registryUrl: string) {
  const response = await fetch(`${registryUrl}/styles/index.json`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch registry index: ${response.statusText}`)
  }

  const json = await response.json()
  return registryIndexSchema.parse(json)
}

export async function fetchRegistryItem(
  registryUrl: string,
  name: string
): Promise<RegistryItem> {
  const response = await fetch(`${registryUrl}/styles/default/${name}.json`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch component ${name}: ${response.statusText}`)
  }

  const json = await response.json()
  return registryItemSchema.parse(json)
}

export async function getRegistryColors() {
  try {
    const response = await fetch("https://meduza-ui.com/r/colors/index.json")
    
    if (!response.ok) {
      return getDefaultColors()
    }

    const json = await response.json()
    return colorsSchema.parse(json)
  } catch {
    return getDefaultColors()
  }
}

function getDefaultColors() {
  return [
    { name: "slate", label: "Slate", colors: {} },
    { name: "gray", label: "Gray", colors: {} },
    { name: "zinc", label: "Zinc", colors: {} },
    { name: "neutral", label: "Neutral", colors: {} },
    { name: "stone", label: "Stone", colors: {} },
  ]
}
```

### 5. File Update Utilities (`packages/cli/src/utils/updaters/update-files.ts`)
```typescript
import * as fs from "fs-extra"
import * as path from "path"
import { type RegistryItemFile } from "../registry"
import { type Config } from "../get-config"
import { logger } from "../logger"

export async function updateFiles(
  files: RegistryItemFile[],
  config: Config,
  options: {
    overwrite?: boolean
    silent?: boolean
  } = {}
) {
  const { overwrite = false, silent = false } = options

  if (files.length === 0) return

  for (const file of files) {
    const targetPath = getTargetPath(file, config)
    
    // Create directory if it doesn't exist
    await fs.ensureDir(path.dirname(targetPath))

    // Check if file exists
    const exists = await fs.pathExists(targetPath)
    
    if (exists && !overwrite) {
      if (!silent) {
        logger.warn(`File ${targetPath} already exists. Skipping.`)
      }
      continue
    }

    // Write file
    await fs.writeFile(targetPath, file.content, "utf8")

    if (!silent) {
      logger.success(`Created ${path.relative(config.resolvedPaths.cwd, targetPath)}`)
    }
  }
}

function getTargetPath(file: RegistryItemFile, config: Config): string {
  const target = file.target || file.path

  // Handle different file types
  if (file.type === "registry:lib") {
    // Lib files go to the lib directory
    if (target.startsWith("lib/")) {
      return path.resolve(config.resolvedPaths.lib, target.slice(4))
    }
  }

  if (file.type === "registry:ui") {
    // UI components go to the ui directory
    if (target.startsWith("ui/")) {
      return path.resolve(config.resolvedPaths.ui, target.slice(3))
    }
  }

  if (file.type === "registry:style") {
    // Style files go to their respective locations
    if (target.includes("_variables.scss")) {
      return config.resolvedPaths.scssVariables
    }
    if (target.includes("_mixins.scss")) {
      return config.resolvedPaths.scssMixins
    }
  }

  // Default: resolve relative to cwd
  return path.resolve(config.resolvedPaths.cwd, target)
}
```

### 6. Dependency Management (`packages/cli/src/utils/updaters/update-dependencies.ts`)
```typescript
import { execa } from "execa"
import { getPackageManager } from "../get-package-manager"
import { type Config } from "../get-config"
import { logger } from "../logger"

export async function updateDependencies(
  dependencies: string[],
  devDependencies: string[],
  config: Config,
  options: {
    silent?: boolean
  } = {}
) {
  const { silent = false } = options

  if (dependencies.length === 0 && devDependencies.length === 0) {
    return
  }

  const packageManager = await getPackageManager(config.resolvedPaths.cwd)

  // Install regular dependencies
  if (dependencies.length > 0) {
    const spinner = silent ? null : logger.spin(`Installing dependencies...`)

    try {
      await installDependencies(packageManager, dependencies, false, config.resolvedPaths.cwd)
      
      if (!silent) {
        logger.stopSpinner(true, `Installed ${dependencies.length} dependencies.`)
      }
    } catch (error) {
      if (!silent) {
        logger.stopSpinner(false, "Failed to install dependencies.")
      }
      throw error
    }
  }

  // Install dev dependencies
  if (devDependencies.length > 0) {
    const spinner = silent ? null : logger.spin(`Installing dev dependencies...`)

    try {
      await installDependencies(packageManager, devDependencies, true, config.resolvedPaths.cwd)
      
      if (!silent) {
        logger.stopSpinner(true, `Installed ${devDependencies.length} dev dependencies.`)
      }
    } catch (error) {
      if (!silent) {
        logger.stopSpinner(false, "Failed to install dev dependencies.")
      }
      throw error
    }
  }
}

async function installDependencies(
  packageManager: string,
  packages: string[],
  isDev: boolean,
  cwd: string
) {
  const commands: Record<string, string[]> = {
    npm: ["install", ...(isDev ? ["--save-dev"] : []), ...packages],
    yarn: ["add", ...(isDev ? ["--dev"] : []), ...packages],
    pnpm: ["add", ...(isDev ? ["--save-dev"] : []), ...packages],
    bun: ["add", ...(isDev ? ["--development"] : []), ...packages],
  }

  const command = commands[packageManager]
  if (!command) {
    throw new Error(`Unsupported package manager: ${packageManager}`)
  }

  await execa(packageManager, command, { cwd })
}
```

### 7. Enhanced Logger with Init-specific Messages (`packages/cli/src/utils/logger.ts`)
```typescript
// Add to existing logger implementation

export function printInitSummary(config: RawConfig) {
  console.log()
  console.log(kleur.green("✓ Project initialized successfully!"))
  console.log()
  console.log(kleur.bold("Configuration:"))
  console.log(`  Style: ${kleur.cyan(config.style)}`)
  console.log(`  SCSS Variables: ${kleur.cyan(config.scss.variables)}`)
  console.log(`  SCSS Mixins: ${kleur.cyan(config.scss.mixins)}`)
  console.log(`  Components: ${kleur.cyan(config.aliases.components)}`)
  console.log(`  Utils: ${kleur.cyan(config.aliases.utils)}`)
  console.log()
  console.log(kleur.bold("Next steps:"))
  console.log(`  1. Import base styles in your main CSS file:`)
  console.log(`     ${kleur.cyan(`@import "${config.scss.variables}";`)}`)
  console.log(`     ${kleur.cyan(`@import "${config.scss.mixins}";`)}`)
  console.log()
  console.log(`  2. Start adding components:`)
  console.log(`     ${kleur.cyan("npx meduza-ui add button")}`)
  console.log()
}
```

### 8. Integration with Main CLI (`packages/cli/src/index.ts`)
```typescript
#!/usr/bin/env node
import { Command } from "commander"
import packageJson from "../package.json"
import { init } from "@/commands/init"

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

  // Add init command
  program.addCommand(init)

  // Show help when no command is provided
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

## Expected Registry Items for Init

Based on our previous specs, the `init` command will install these registry items:

### 1. Utils (`utils.json`)
```json
{
  "name": "utils",
  "type": "registry:lib",
  "dependencies": [],
  "files": [
    {
      "path": "lib/utils.ts",
      "content": "// useClassName and cn utilities",
      "type": "registry:lib"
    }
  ]
}
```

### 2. Variables (`variables.json`)
```json
{
  "name": "variables",
  "type": "registry:style",
  "dependencies": [],
  "files": [
    {
      "path": "assets/styles/_variables.scss",
      "content": "// CSS custom properties",
      "type": "registry:style"
    }
  ]
}
```

### 3. Mixins (`mixins.json`)
```json
{
  "name": "mixins", 
  "type": "registry:style",
  "dependencies": [],
  "files": [
    {
      "path": "assets/styles/_mixins.scss",
      "content": "// SCSS mixins",
      "type": "registry:style"
    }
  ]
}
```

### 4. Index (`index.json`)
```json
{
  "name": "index",
  "type": "registry:style", 
  "dependencies": ["sass"],
  "registryDependencies": ["utils"],
  "files": []
}
```

## Testing

### 9. Init Command Tests (`packages/cli/src/commands/__tests__/init.test.ts`)
```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { tmpdir } from "os"
import { join } from "path"
import * as fs from "fs-extra"
import { runInit } from "../init"

describe("init command", () => {
  let testDir: string

  beforeEach(async () => {
    testDir = join(tmpdir(), `meduza-ui-test-${Date.now()}`)
    await fs.ensureDir(testDir)
    
    // Create a basic Vue project structure
    await fs.writeJson(join(testDir, "package.json"), {
      name: "test-project",
      dependencies: {
        vue: "^3.0.0"
      }
    })
  })

  afterEach(async () => {
    await fs.remove(testDir)
  })

  it("should initialize a Vue project with default config", async () => {
    await runInit({
      cwd: testDir,
      yes: true,
      defaults: true,
      force: false,
      silent: true,
      style: "default",
    })

    // Check if config file was created
    const configPath = join(testDir, "meduza.config.json")
    expect(await fs.pathExists(configPath)).toBe(true)

    // Check config content
    const config = await fs.readJson(configPath)
    expect(config.style).toBe("default")
    expect(config.scss.variables).toBeDefined()
    expect(config.scss.mixins).toBeDefined()
  })

  it("should create necessary directories and files", async () => {
    await runInit({
      cwd: testDir,
      yes: true,
      defaults: true,
      force: false,
      silent: true,
      style: "default",
    })

    // Check if base files were created
    expect(await fs.pathExists(join(testDir, "src/lib/utils.ts"))).toBe(true)
    expect(await fs.pathExists(join(testDir, "src/assets/styles/_variables.scss"))).toBe(true)
    expect(await fs.pathExists(join(testDir, "src/assets/styles/_mixins.scss"))).toBe(true)
  })
})
```

## CLI Usage Examples

```bash
# Initialize with defaults
npx meduza-ui init --defaults

# Initialize with prompts
npx meduza-ui init

# Initialize with specific options
npx meduza-ui init --style default --base-color slate --src-dir

# Force overwrite existing config
npx meduza-ui init --force

# Initialize in specific directory
npx meduza-ui init --cwd ./my-vue-project

# Silent initialization
npx meduza-ui init --defaults --silent
```

## Deliverables

1. **Complete init command** with interactive prompts and validation
2. **Project detection** for Vue.js frameworks (Vue CLI, Vite, Nuxt)
3. **Configuration management** with `meduza.config.json` generation
4. **Base component installation** (utils, variables, mixins, index)
5. **Registry API integration** for fetching components
6. **File management** with proper path resolution and overwrite protection
7. **Dependency installation** with package manager detection
8. **Error handling** and user-friendly messages
9. **Testing suite** with comprehensive test coverage
10. **CLI integration** with proper help and version commands

## Testing Checklist

- [ ] Init command detects Vue.js projects correctly
- [ ] Configuration prompts work with all options
- [ ] Default configuration generates correctly
- [ ] Registry API fetches base components successfully
- [ ] Files are created in correct locations based on aliases
- [ ] Dependencies are installed with correct package manager
- [ ] Existing configuration is protected unless --force is used
- [ ] Error handling works for network failures and invalid projects
- [ ] Silent mode suppresses output correctly
- [ ] CLI help and version commands work

## Next Steps

After this init command is complete:
1. Implement the `add` command functionality (Spec 08)
2. Test the complete CLI workflow end-to-end (Spec 09)
3. Add comprehensive error scenarios and edge case handling
