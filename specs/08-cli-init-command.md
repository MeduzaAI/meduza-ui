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
  
  // Inject selected color variables
  await injectColorVariables(config.baseColor, resolvedConfig, options)

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
import { getAvailableColors, fetchColorData } from "@/registry/api"

async function promptForConfig(
  projectInfo: ProjectInfo,
  options: z.infer<typeof initOptionsSchema>
): Promise<RawConfig> {
  const colors = getAvailableColors()

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
    baseColor: responses.baseColor,
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
    baseColor: options.baseColor || "slate",
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
    "index",          // Base style configuration with theme variables
  ]

  await addComponents(baseComponents, config, {
    overwrite: true,
    silent: options.silent,
    isInit: true,
  })
}

async function injectColorVariables(
  baseColor: string,
  config: Config,
  options: z.infer<typeof initOptionsSchema>
) {
  if (!options.silent) {
    const spinner = logger.spin(`Injecting ${baseColor} color variables...`)
  }
  
  try {
    // Fetch color data from registry
    const registryUrl = config.registries["meduza-ui"]
    const colorData = await fetchColorData(baseColor, registryUrl)
    
    // Create variables file with selected colors
    await createVariablesFile(config.resolvedPaths.scssVariables, colorData)
    
    // Create mixins file
    await createMixinsFile(config.resolvedPaths.scssMixins)
    
    if (!options.silent) {
      logger.stopSpinner(true, `Injected ${baseColor} color variables.`)
    }
  } catch (error) {
    if (!options.silent) {
      logger.stopSpinner(false, `Failed to inject color variables.`)
    }
    throw error
  }
}
```

### 4. Registry API Implementation (`packages/cli/src/registry/api.ts`)
```typescript
import fetch from "node-fetch"
import * as fs from "fs-extra"
import * as path from "path"
import { registryItemSchema, registryBaseColorSchema, type RegistryItem, type RegistryBaseColor } from "meduza-ui/registry"

export async function fetchRegistryIndex(registryUrl: string) {
  const response = await fetch(`${registryUrl}/styles/index.json`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch registry index: ${response.statusText}`)
  }

  const json = await response.json()
  return json
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

export async function fetchColorData(
  baseColor: string,
  registryUrl: string
): Promise<RegistryBaseColor> {
  const response = await fetch(`${registryUrl}/colors/${baseColor}.json`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch color data for ${baseColor}: ${response.statusText}`)
  }

  const json = await response.json()
  return registryBaseColorSchema.parse(json)
}

export function getAvailableColors() {
  return [
    { name: "slate", label: "Slate" },
    { name: "zinc", label: "Zinc" },
    { name: "stone", label: "Stone" },
    { name: "gray", label: "Gray" },
    { name: "neutral", label: "Neutral" },
  ]
}

export async function createVariablesFile(
  variablesPath: string,
  colorData: RegistryBaseColor
) {
  // Create the directory if it doesn't exist
  await fs.ensureDir(path.dirname(variablesPath))

  // Generate variables file content with injected colors
  const variablesContent = generateVariablesContent(colorData)
  
  // Write the variables file
  await fs.writeFile(variablesPath, variablesContent, "utf8")
}

export async function createMixinsFile(mixinsPath: string) {
  // Create the directory if it doesn't exist
  await fs.ensureDir(path.dirname(mixinsPath))

  const mixinsContent = `// SCSS Mixins for Meduza UI
// Focus ring utility
@mixin focus-ring {
  &:focus-visible {
    outline: 2px solid var(--ring-color);
    outline-offset: 2px;
  }
}

// Text utilities  
@mixin text($size: 'base', $weight: 'regular') {
  @if $size == 'xs' {
    font-size: var(--text-xs);
  } @else if $size == 'sm' {
    font-size: var(--text-sm);
  } @else if $size == 'base' {
    font-size: var(--text-base);
  } @else if $size == 'lg' {
    font-size: var(--text-lg);
  } @else if $size == 'xl' {
    font-size: var(--text-xl);
  }
  
  @if $weight == 'light' {
    font-weight: var(--font-light);
  } @else if $weight == 'regular' {
    font-weight: var(--font-regular);
  } @else if $weight == 'medium' {
    font-weight: var(--font-medium);
  } @else if $weight == 'semibold' {
    font-weight: var(--font-semibold);
  } @else if $weight == 'bold' {
    font-weight: var(--font-bold);
  }
}

// Container utilities
@mixin container($size: 'default') {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
  
  @if $size == 'sm' {
    max-width: 640px;
  } @else if $size == 'md' {
    max-width: 768px;
  } @else if $size == 'lg' {
    max-width: 1024px;
  } @else if $size == 'xl' {
    max-width: 1280px;
  }
}
`
  
  // Write the mixins file
  await fs.writeFile(mixinsPath, mixinsContent, "utf8")
}

function generateVariablesContent(colorData: RegistryBaseColor): string {
  // Base design system variables template
  const baseVariables = `// Comprehensive design system variables
// Colors will be injected based on selected base color

:root {
  /* Colors - Semantic (injected based on selected base color) */`

  // Inject light mode color variables
  const lightVars = Object.entries(colorData.cssVars.light)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')

  const middleSection = `
  
  /* Spacing - comprehensive scale in pixels */
  --spacing-0: 0px;
  --spacing-px: 1px;
  --spacing-0-5: 2px;
  --spacing-1: 4px;
  --spacing-1-5: 6px;
  --spacing-2: 8px;
  --spacing-2-5: 10px;
  --spacing-3: 12px;
  --spacing-3-5: 14px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-7: 28px;
  --spacing-8: 32px;
  --spacing-9: 36px;
  --spacing-10: 40px;
  --spacing-11: 44px;
  --spacing-12: 48px;
  --spacing-14: 56px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;
  --spacing-28: 112px;
  --spacing-32: 128px;
  
  /* Typography - semantic naming */
  --font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
  
  /* Font sizes - pixels */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;
  --text-4xl: 36px;
  --text-5xl: 48px;
  --text-6xl: 60px;
  
  /* Font weights */
  --font-light: 300;
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Border radius - pixels */
  --radius-none: 0px;
  --radius-sm: 2px;
  --radius-base: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-3xl: 24px;
  --radius-full: 9999px;
  
  /* Default radius for components */
  --radius: 6px;
  
  /* Shadows - pixels */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
  
  /* Z-index scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

[data-theme="dark"] {
  /* Dark mode color overrides (injected based on selected base color) */`

  // Inject dark mode color variables
  const darkVars = Object.entries(colorData.cssVars.dark)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')

  const endSection = `
}`

  return baseVariables + '\n' + lightVars + middleSection + '\n' + darkVars + endSection
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
  if (file.type === "file") {
    // Handle lib files
    if (target.startsWith("lib/") || target.includes("utils.ts")) {
      const filename = path.basename(target)
      return path.resolve(config.resolvedPaths.lib, filename)
    }
    
    // Handle UI component files  
    if (target.startsWith("components/ui/") || target.startsWith("ui/")) {
      const filename = path.basename(target)
      return path.resolve(config.resolvedPaths.ui, filename)
    }
  }

  if (file.type === "registry:lib") {
    // Lib files go to the lib directory
    if (target.startsWith("lib/") || target.includes("utils")) {
      const filename = path.basename(target)
      return path.resolve(config.resolvedPaths.lib, filename)
    }
  }

  if (file.type === "registry:ui") {
    // UI components go to the ui directory
    if (target.startsWith("ui/") || target.startsWith("components/ui/")) {
      const filename = path.basename(target)
      return path.resolve(config.resolvedPaths.ui, filename)
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

Based on our current registry structure, the `init` command will install these registry items:

### 1. Utils (`utils.json`)
```json
{
  "$schema": "https://meduza-ui.dev/schema/registry-item.json",
  "name": "utils",
  "type": "registry:lib",
  "description": "BEM className utility for Vue components",
  "dependencies": [],
  "files": [
    {
      "path": "lib/utils.ts",
      "content": "// useClassName and cn utilities",
      "type": "file",
      "target": "lib/utils.ts"
    }
  ]
}
```

### 2. Index (`index.json`)
```json
{
  "$schema": "https://meduza-ui.dev/schema/registry-item.json",
  "name": "index",
  "type": "registry:style",
  "description": "Base style system with SCSS variables and mixins",
  "dependencies": [],
  "registryDependencies": ["utils"],
  "files": [
    {
      "path": "assets/styles/_variables.scss",
      "content": "// Base variables (injected during init)",
      "type": "file",
      "target": "assets/styles/_variables.scss"
    },
    {
      "path": "assets/styles/_mixins.scss", 
      "content": "// SCSS mixins",
      "type": "file",
      "target": "assets/styles/_mixins.scss"
    },
    {
      "path": "assets/styles/_main.scss",
      "content": "// Main styles",
      "type": "file", 
      "target": "assets/styles/_main.scss"
    }
  ],
  "cssVars": {
    "light": {
      "primary-color": "#334155",
      "primary-foreground-color": "#f8fafc"
    },
    "dark": {
      "primary-color": "#e2e8f0",
      "primary-foreground-color": "#0f172a"
    }
  }
}
```

### 3. Color Registry Endpoints

The init command will also fetch from these color endpoints to inject variables:

- `/r/colors/slate.json` - Slate color mappings
- `/r/colors/zinc.json` - Zinc color mappings  
- `/r/colors/stone.json` - Stone color mappings
- `/r/colors/gray.json` - Gray color mappings
- `/r/colors/neutral.json` - Neutral color mappings

Each color endpoint returns:
```json
{
  "inlineColors": {
    "light": { "primary": "slate-900", "background": "white" },
    "dark": { "primary": "slate-50", "background": "slate-950" }
  },
  "cssVars": {
    "light": { "primary-color": "#0f172a", "background-color": "#ffffff" },
    "dark": { "primary-color": "#f8fafc", "background-color": "#0f172a" }
  },
  "cssVarsTemplate": ":root {\n  --primary-color: #0f172a;\n}"
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
# Initialize with defaults (slate color)
npx meduza-ui init --defaults

# Initialize with interactive prompts (includes color selection)
npx meduza-ui init

# Initialize with specific base color
npx meduza-ui init --style default --base-color zinc --src-dir

# Initialize with different colors
npx meduza-ui init --base-color slate    # Cooler, professional
npx meduza-ui init --base-color zinc     # Modern, neutral
npx meduza-ui init --base-color stone    # Warm, natural  
npx meduza-ui init --base-color gray     # Classic, versatile
npx meduza-ui init --base-color neutral  # Clean, minimal

# Force overwrite existing config
npx meduza-ui init --force

# Initialize in specific directory
npx meduza-ui init --cwd ./my-vue-project

# Silent initialization with color
npx meduza-ui init --defaults --base-color zinc --silent
```

## Deliverables

1. **Complete init command** with interactive prompts and validation
2. **Project detection** for Vue.js frameworks (Vue CLI, Vite, Nuxt)
3. **Configuration management** with `meduza.config.json` generation including `baseColor`
4. **Base color selection** with 5 options (slate, zinc, stone, gray, neutral)
5. **Color system integration** that fetches and injects CSS variables
6. **Base component installation** (utils, index with comprehensive theme system)
7. **Variables and mixins generation** with selected color injection
8. **Registry API integration** for fetching components and color data
9. **File management** with proper path resolution and overwrite protection
10. **Dependency installation** with package manager detection
11. **Error handling** and user-friendly messages
12. **Testing suite** with comprehensive test coverage including color system
13. **CLI integration** with proper help and version commands

## Testing Checklist

### Core Functionality
- [ ] Init command detects Vue.js projects correctly
- [ ] Configuration prompts work with all color options (slate, zinc, stone, gray, neutral)
- [ ] Default configuration generates correctly with default slate color
- [ ] Registry API fetches base components successfully
- [ ] Files are created in correct locations based on aliases
- [ ] Dependencies are installed with correct package manager
- [ ] Existing configuration is protected unless --force is used

### Color System Integration  
- [ ] Base color selection prompts display all 5 colors
- [ ] Color data fetching works for all base colors from `/r/colors/{color}.json`
- [ ] Variables file injection includes selected color CSS variables
- [ ] Generated variables file preserves design system tokens (spacing, typography, etc.)
- [ ] Mixins file is created with proper SCSS utilities
- [ ] Dark mode color variables are injected correctly

### Error Handling & Edge Cases
- [ ] Error handling works for network failures and invalid projects
- [ ] Color fetching handles network failures gracefully
- [ ] Invalid color selections are handled properly
- [ ] File system errors during injection are caught
- [ ] Silent mode suppresses output correctly
- [ ] CLI help and version commands work

### File System & Paths
- [ ] Utils file is placed in correct lib directory
- [ ] Component files use correct target paths (components/ui/ vs ui/)
- [ ] Variables and mixins files respect user-defined paths
- [ ] Directory creation works for nested paths
- [ ] File overwrite protection works correctly

## Next Steps

After this init command is complete:
1. Implement the `add` command functionality (Spec 08)
2. Test the complete CLI workflow end-to-end (Spec 09)
3. Add comprehensive error scenarios and edge case handling
