# 08 - CLI Add Command

## Overview
Implement the `add` command for the Meduza UI CLI that installs individual Vue.js components from the registry. The command handles dependency resolution, file installation, and project validation while providing an intuitive interface for component selection.

## Goals
- Install individual components with automatic dependency resolution
- Provide interactive component selection from registry
- Handle registry dependencies recursively
- Validate project configuration and suggest initialization if needed
- Support multiple component installation in a single command
- Provide detailed feedback and error handling

## Command Implementation

### 1. Add Command Definition (`packages/cli/src/commands/add.ts`)
```typescript
import { Command } from "commander"
import { z } from "zod"
import * as path from "path"
import prompts from "prompts"
import kleur from "kleur"

import { getConfig } from "@/utils/get-config"
import { getProjectInfo } from "@/utils/get-project-info"
import { logger } from "@/utils/logger"
import { handleError } from "@/utils/handle-error"
import { addComponents } from "@/utils/add-components"
import { fetchRegistryIndex, type RegistryIndex } from "@/utils/registry-api"
import { runInit } from "./init"

const addOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  overwrite: z.boolean(),
  cwd: z.string(),
  all: z.boolean(),
  silent: z.boolean(),
})

const DEPRECATED_COMPONENTS = [
  // Add any deprecated components here as they arise
  // Example:
  // {
  //   name: "old-button",
  //   deprecatedBy: "button",
  //   message: "The old-button component is deprecated. Use the button component instead.",
  // },
]

export const add = new Command()
  .name("add")
  .description("add components to your project")
  .argument("[components...]", "component names to add")
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option("-o, --overwrite", "overwrite existing files.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-a, --all", "add all available components", false)
  .option("-s, --silent", "mute output.", false)
  .action(async (components, opts) => {
    try {
      const options = addOptionsSchema.parse({
        components,
        cwd: path.resolve(opts.cwd),
        ...opts,
      })

      await runAdd(options)
    } catch (error) {
      handleError(error)
    }
  })

export async function runAdd(options: z.infer<typeof addOptionsSchema>) {
  // Check if project is initialized
  const config = await getConfig(options.cwd)
  
  if (!config) {
    logger.error("No configuration found. Please run the init command first:")
    logger.info("  " + kleur.cyan("npx meduza-ui init"))
    process.exit(1)
  }

  const projectInfo = await getProjectInfo(options.cwd)
  
  if (!projectInfo) {
    logger.error("Could not detect a Vue.js project. Please run this command in a Vue.js project directory.")
    process.exit(1)
  }

  if (!options.silent) {
    logger.info(`Adding components to ${kleur.cyan(projectInfo.framework)} project.`)
  }

  // Determine components to install
  let selectedComponents: string[]
  
  if (options.components?.length) {
    selectedComponents = options.components
  } else {
    selectedComponents = await promptForComponents(options, config)
  }

  // Check for deprecated components
  const deprecatedComponentsFound = selectedComponents.filter(component =>
    DEPRECATED_COMPONENTS.some(dep => dep.name === component)
  )

  if (deprecatedComponentsFound.length > 0) {
    for (const component of deprecatedComponentsFound) {
      const deprecated = DEPRECATED_COMPONENTS.find(dep => dep.name === component)
      if (deprecated) {
        logger.warn(deprecated.message)
      }
    }
    
    if (!options.yes) {
      const { proceed } = await prompts({
        type: "confirm",
        name: "proceed",
        message: "Do you want to continue with deprecated components?",
        initial: false,
      })

      if (!proceed) {
        process.exit(0)
      }
    }
  }

  // Install components
  await addComponents(selectedComponents, config, {
    overwrite: options.overwrite,
    silent: options.silent,
  })

  if (!options.silent) {
    logger.success(`Successfully added ${selectedComponents.length} component(s).`)
    logger.break()
    logger.info("Import the components in your Vue files:")
    
    selectedComponents.forEach(component => {
      const componentName = component.charAt(0).toUpperCase() + component.slice(1)
      logger.info(`  ${kleur.cyan(`import ${componentName} from '${config.aliases.ui}/${component}.vue'`)}`)
    })
  }
}
```

### 2. Component Selection Logic (`packages/cli/src/commands/add.ts` continued)
```typescript
async function promptForComponents(
  options: z.infer<typeof addOptionsSchema>,
  config: Config
): Promise<string[]> {
  // Fetch registry index
  const spinner = logger.spin("Fetching registry...")
  
  let registryIndex: RegistryIndex
  try {
    const registryUrl = config.registries["meduza-ui"]
    registryIndex = await fetchRegistryIndex(registryUrl)
    logger.stopSpinner(true, "Registry fetched.")
  } catch (error) {
    logger.stopSpinner(false, "Failed to fetch registry.")
    throw new Error("Failed to fetch components from registry. Please check your internet connection.")
  }

  if (!registryIndex || registryIndex.length === 0) {
    logger.error("No components found in registry.")
    process.exit(1)
  }

  // Filter for UI components only
  const uiComponents = registryIndex.filter(
    (entry) =>
      entry.type === "registry:ui" &&
      !DEPRECATED_COMPONENTS.some(dep => dep.name === entry.name)
  )

  if (uiComponents.length === 0) {
    logger.error("No UI components found in registry.")
    process.exit(1)
  }

  // Handle --all flag
  if (options.all) {
    return uiComponents.map(component => component.name)
  }

  // Interactive selection
  const { components } = await prompts({
    type: "multiselect",
    name: "components",
    message: "Which components would you like to add?",
    hint: "Space to select. A to toggle all. Enter to submit.",
    instructions: false,
    choices: uiComponents.map((entry) => ({
      title: entry.name,
      value: entry.name,
      description: entry.description || `Add ${entry.name} component`,
    })),
  })

  if (!components?.length) {
    logger.warn("No components selected. Exiting.")
    process.exit(1)
  }

  const result = z.array(z.string()).safeParse(components)
  if (!result.success) {
    logger.error("Something went wrong with component selection. Please try again.")
    process.exit(1)
  }

  return result.data
}
```

### 3. Enhanced Component Addition Logic (`packages/cli/src/utils/add-components.ts`)
```typescript
import fetch from "node-fetch"
import * as fs from "fs-extra"
import * as path from "path"
import { type RegistryItem, registryItemSchema } from "./registry"
import { updateFiles } from "./updaters/update-files"
import { updateDependencies } from "./updaters/update-dependencies"
import { type Config } from "./get-config"
import { logger } from "./logger"

export async function addComponents(
  componentNames: string[],
  config: Config,
  options: {
    overwrite?: boolean
    silent?: boolean
  } = {}
) {
  if (componentNames.length === 0) return

  const { overwrite = false, silent = false } = options

  // Resolve dependency tree
  const { components, allDependencies, allDevDependencies } = await resolveComponentTree(
    componentNames,
    config,
    silent
  )

  // Install npm dependencies
  if (allDependencies.length > 0 || allDevDependencies.length > 0) {
    await updateDependencies(allDependencies, allDevDependencies, config, { silent })
  }

  // Install component files
  const allFiles = components.flatMap(component => component.files)
  await updateFiles(allFiles, config, { overwrite, silent })

  // Update SCSS variables if needed
  await updateScssVariables(components, config, { silent })

  // Show success message
  if (!silent) {
    for (const componentName of componentNames) {
      logger.success(`Added ${componentName}`)
    }
  }
}

async function resolveComponentTree(
  componentNames: string[],
  config: Config,
  silent: boolean
) {
  const spinner = silent ? null : logger.spin("Resolving dependencies...")

  try {
    const components: RegistryItem[] = []
    const processedComponents = new Set<string>()
    const allDependencies = new Set<string>()
    const allDevDependencies = new Set<string>()

    // Recursively resolve components and their dependencies
    const resolveComponent = async (name: string): Promise<void> => {
      if (processedComponents.has(name)) return

      processedComponents.add(name)

      // Fetch component from registry
      const registryUrl = config.registries["meduza-ui"]
      const component = await fetchRegistryItem(registryUrl, name)
      
      components.push(component)

      // Add npm dependencies
      if (component.dependencies) {
        component.dependencies.forEach(dep => allDependencies.add(dep))
      }
      if (component.devDependencies) {
        component.devDependencies.forEach(dep => allDevDependencies.add(dep))
      }

      // Recursively resolve registry dependencies
      if (component.registryDependencies) {
        for (const depName of component.registryDependencies) {
          await resolveComponent(depName)
        }
      }
    }

    // Resolve all requested components
    for (const componentName of componentNames) {
      await resolveComponent(componentName)
    }

    if (!silent) {
      logger.stopSpinner(true, `Resolved ${components.length} components.`)
    }

    return {
      components,
      allDependencies: Array.from(allDependencies),
      allDevDependencies: Array.from(allDevDependencies),
    }
  } catch (error) {
    if (!silent) {
      logger.stopSpinner(false, "Failed to resolve dependencies.")
    }
    throw error
  }
}

async function fetchRegistryItem(registryUrl: string, name: string): Promise<RegistryItem> {
  const response = await fetch(`${registryUrl}/styles/default/${name}.json`)
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Component "${name}" not found in registry.`)
    }
    throw new Error(`Failed to fetch component ${name}: ${response.statusText}`)
  }

  const json = await response.json()
  return registryItemSchema.parse(json)
}

async function updateScssVariables(
  components: RegistryItem[],
  config: Config,
  options: { silent?: boolean }
) {
  const { silent = false } = options

  // Check if any components have scssVars
  const scssVars: Record<string, string> = {}
  
  components.forEach(component => {
    if (component.scssVars) {
      Object.assign(scssVars, component.scssVars)
    }
  })

  if (Object.keys(scssVars).length === 0) return

  const variablesPath = config.resolvedPaths.scssVariables
  
  if (!await fs.pathExists(variablesPath)) {
    if (!silent) {
      logger.warn(`SCSS variables file not found at ${variablesPath}`)
    }
    return
  }

  // Read existing variables file
  let content = await fs.readFile(variablesPath, "utf8")

  // Add new variables (simple append for now)
  const newVars = Object.entries(scssVars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n")

  if (newVars) {
    // Check if variables already exist to avoid duplicates
    const existingVars = Object.keys(scssVars).filter(key => 
      content.includes(key)
    )

    if (existingVars.length > 0 && !silent) {
      logger.warn(`Some SCSS variables already exist: ${existingVars.join(", ")}`)
    }

    const varsToAdd = Object.entries(scssVars).filter(([key]) => 
      !content.includes(key)
    )

    if (varsToAdd.length > 0) {
      content += `\n  // Added by component installation\n${
        varsToAdd.map(([key, value]) => `  ${key}: ${value};`).join("\n")
      }\n`

      await fs.writeFile(variablesPath, content, "utf8")

      if (!silent) {
        logger.success(`Updated SCSS variables with ${varsToAdd.length} new variables.`)
      }
    }
  }
}
```

### 4. Registry API Enhancement (`packages/cli/src/utils/registry-api.ts`)
```typescript
// Add to existing registry-api.ts

export async function fetchRegistryIndex(registryUrl: string): Promise<RegistryIndex> {
  try {
    const response = await fetch(`${registryUrl}/styles/index.json`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch registry index: ${response.statusText}`)
    }

    const json = await response.json()
    
    // Validate the response
    const result = registryIndexSchema.safeParse(json)
    if (!result.success) {
      throw new Error("Invalid registry index format")
    }

    return result.data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to fetch registry index")
  }
}

export async function validateComponentExists(
  registryUrl: string,
  componentName: string
): Promise<boolean> {
  try {
    const response = await fetch(`${registryUrl}/styles/default/${componentName}.json`, {
      method: "HEAD", // Only check if it exists
    })
    return response.ok
  } catch {
    return false
  }
}

export async function searchComponents(
  registryUrl: string,
  query: string
): Promise<RegistryIndex> {
  const index = await fetchRegistryIndex(registryUrl)
  
  const filtered = index.filter(component => 
    component.name.toLowerCase().includes(query.toLowerCase()) ||
    (component.description && component.description.toLowerCase().includes(query.toLowerCase()))
  )

  return filtered
}
```

### 5. Error Handling and Validation (`packages/cli/src/utils/validate-add.ts`)
```typescript
import * as fs from "fs-extra"
import * as path from "path"
import { type Config } from "./get-config"
import { logger } from "./logger"

export async function validateAddCommand(
  componentNames: string[],
  config: Config
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []

  // Check if required directories exist
  const requiredDirs = [
    config.resolvedPaths.ui,
    config.resolvedPaths.lib,
  ]

  for (const dir of requiredDirs) {
    if (!await fs.pathExists(dir)) {
      errors.push(`Required directory does not exist: ${dir}`)
    }
  }

  // Check if base utilities exist
  const utilsPath = path.resolve(config.resolvedPaths.utils + ".ts")
  if (!await fs.pathExists(utilsPath)) {
    errors.push(
      `Base utilities not found at ${utilsPath}. Please run 'npx meduza-ui init' first.`
    )
  }

  // Check if SCSS files exist
  if (!await fs.pathExists(config.resolvedPaths.scssVariables)) {
    errors.push(
      `SCSS variables file not found at ${config.resolvedPaths.scssVariables}. Please run 'npx meduza-ui init' first.`
    )
  }

  if (!await fs.pathExists(config.resolvedPaths.scssMixins)) {
    errors.push(
      `SCSS mixins file not found at ${config.resolvedPaths.scssMixins}. Please run 'npx meduza-ui init' first.`
    )
  }

  // Validate component names
  const invalidNames = componentNames.filter(name => 
    !/^[a-z][a-z0-9-]*[a-z0-9]$/.test(name) || name.length > 50
  )

  if (invalidNames.length > 0) {
    errors.push(`Invalid component names: ${invalidNames.join(", ")}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export async function checkComponentConflicts(
  componentNames: string[],
  config: Config
): Promise<string[]> {
  const conflicts: string[] = []

  for (const name of componentNames) {
    const componentPath = path.resolve(config.resolvedPaths.ui, `${name}.vue`)
    
    if (await fs.pathExists(componentPath)) {
      conflicts.push(name)
    }
  }

  return conflicts
}
```

### 6. Integration with Main CLI (`packages/cli/src/index.ts`)
```typescript
#!/usr/bin/env node
import { Command } from "commander"
import packageJson from "../package.json"
import { init } from "@/commands/init"
import { add } from "@/commands/add"

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

  // Add commands
  program.addCommand(init)
  program.addCommand(add)

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

### 7. Enhanced File Updates (`packages/cli/src/utils/updaters/update-files.ts`)
```typescript
// Enhance existing update-files.ts with better conflict handling

import { type RegistryItemFile } from "../registry"
import { type Config } from "../get-config"
import { logger } from "../logger"
import { checkComponentConflicts } from "../validate-add"
import prompts from "prompts"

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

  // Check for conflicts
  const componentNames = files
    .filter(file => file.type === "registry:ui")
    .map(file => path.basename(file.path, ".vue"))

  const conflicts = await checkComponentConflicts(componentNames, config)

  if (conflicts.length > 0 && !overwrite) {
    if (!silent) {
      logger.warn(`The following components already exist: ${conflicts.join(", ")}`)
      
      const { proceed } = await prompts({
        type: "confirm",
        name: "proceed",
        message: "Do you want to overwrite existing components?",
        initial: false,
      })

      if (!proceed) {
        logger.info("Installation cancelled.")
        process.exit(0)
      }
    } else {
      throw new Error(`Components already exist: ${conflicts.join(", ")}. Use --overwrite to replace them.`)
    }
  }

  // Continue with existing file update logic...
  for (const file of files) {
    const targetPath = getTargetPath(file, config)
    
    // Create directory if it doesn't exist
    await fs.ensureDir(path.dirname(targetPath))

    // Write file
    await fs.writeFile(targetPath, file.content, "utf8")

    if (!silent) {
      const relativePath = path.relative(config.resolvedPaths.cwd, targetPath)
      logger.success(`Created ${relativePath}`)
    }
  }
}
```

## Testing

### 8. Add Command Tests (`packages/cli/src/commands/__tests__/add.test.ts`)
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { tmpdir } from "os"
import { join } from "path"
import * as fs from "fs-extra"
import { runAdd } from "../add"

// Mock registry responses
vi.mock("@/utils/registry-api", () => ({
  fetchRegistryIndex: vi.fn().mockResolvedValue([
    { name: "button", type: "registry:ui", description: "A button component" },
    { name: "card", type: "registry:ui", description: "A card component" },
  ]),
  fetchRegistryItem: vi.fn().mockImplementation((url, name) => ({
    name,
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: `ui/${name}.vue`,
        content: `<template><div class="${name}">Test</div></template>`,
        type: "registry:ui",
      }
    ],
  })),
}))

describe("add command", () => {
  let testDir: string

  beforeEach(async () => {
    testDir = join(tmpdir(), `meduza-ui-test-${Date.now()}`)
    await fs.ensureDir(testDir)
    
    // Create project structure
    await fs.writeJson(join(testDir, "package.json"), {
      name: "test-project",
      dependencies: { vue: "^3.0.0" }
    })

    // Create config file
    await fs.writeJson(join(testDir, "meduza.config.json"), {
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
      registries: {
        "meduza-ui": "https://meduza-ui.com/r",
      },
    })

    // Create necessary directories
    await fs.ensureDir(join(testDir, "src/components/ui"))
    await fs.ensureDir(join(testDir, "src/lib"))
    await fs.ensureDir(join(testDir, "src/assets/styles"))

    // Create required files
    await fs.writeFile(join(testDir, "src/lib/utils.ts"), "// utils")
    await fs.writeFile(join(testDir, "src/assets/styles/_variables.scss"), "// variables")
    await fs.writeFile(join(testDir, "src/assets/styles/_mixins.scss"), "// mixins")
  })

  afterEach(async () => {
    await fs.remove(testDir)
  })

  it("should add a single component", async () => {
    await runAdd({
      components: ["button"],
      cwd: testDir,
      yes: true,
      overwrite: false,
      all: false,
      silent: true,
    })

    // Check if component was created
    const buttonPath = join(testDir, "src/components/ui/button.vue")
    expect(await fs.pathExists(buttonPath)).toBe(true)
    
    const content = await fs.readFile(buttonPath, "utf8")
    expect(content).toContain("button")
  })

  it("should add multiple components", async () => {
    await runAdd({
      components: ["button", "card"],
      cwd: testDir,
      yes: true,
      overwrite: false,
      all: false,
      silent: true,
    })

    // Check if both components were created
    expect(await fs.pathExists(join(testDir, "src/components/ui/button.vue"))).toBe(true)
    expect(await fs.pathExists(join(testDir, "src/components/ui/card.vue"))).toBe(true)
  })

  it("should fail if project is not initialized", async () => {
    // Remove config file
    await fs.remove(join(testDir, "meduza.config.json"))

    await expect(runAdd({
      components: ["button"],
      cwd: testDir,
      yes: true,
      overwrite: false,
      all: false,
      silent: true,
    })).rejects.toThrow()
  })
})
```

## CLI Usage Examples

```bash
# Add a single component
npx meduza-ui add button

# Add multiple components
npx meduza-ui add button card dialog

# Add with interactive selection
npx meduza-ui add

# Add all components
npx meduza-ui add --all

# Overwrite existing components
npx meduza-ui add button --overwrite

# Add components silently
npx meduza-ui add button --silent

# Add components in specific directory
npx meduza-ui add button --cwd ./my-project
```

## Error Scenarios and Handling

### 1. Project Not Initialized
```bash
$ npx meduza-ui add button
✖ No configuration found. Please run the init command first:
  npx meduza-ui init
```

### 2. Component Not Found
```bash
$ npx meduza-ui add nonexistent-component
✖ Component "nonexistent-component" not found in registry.
```

### 3. Network Error
```bash
$ npx meduza-ui add button
✖ Failed to fetch components from registry. Please check your internet connection.
```

### 4. Component Conflicts
```bash
$ npx meduza-ui add button
⚠ The following components already exist: button
? Do you want to overwrite existing components? › No
Installation cancelled.
```

### 5. Dependency Resolution Error
```bash
$ npx meduza-ui add advanced-component
✖ Failed to resolve dependencies for advanced-component. Some registry dependencies may be missing.
```

## Deliverables

1. **Complete add command** with dependency resolution and validation
2. **Interactive component selection** with multi-select and search capabilities
3. **Recursive dependency resolution** for registry and npm dependencies
4. **File conflict detection** with overwrite options
5. **SCSS variable updates** when components require new variables
6. **Comprehensive error handling** for all failure scenarios
7. **Testing suite** with mocked registry responses
8. **Progress indicators** and user feedback throughout the process
9. **CLI integration** with proper help and examples
10. **Validation utilities** for project setup and component names

## Testing Checklist

- [ ] Add command installs single components correctly
- [ ] Multiple components can be added in one command
- [ ] Dependency resolution works recursively
- [ ] Registry dependencies are installed before dependent components
- [ ] NPM dependencies are installed correctly
- [ ] File conflicts are detected and handled appropriately
- [ ] SCSS variables are updated when needed
- [ ] Interactive selection works with all options
- [ ] Error handling works for all failure scenarios
- [ ] Deprecated components show warnings
- [ ] Silent mode suppresses all output correctly
- [ ] CLI help and examples are accurate

