# 05 - CLI Build Command

## Overview
Implement the `build` command for the Meduza UI CLI that generates the registry JSON files from component source files. This command is essential for registry maintainers and custom registry creators who need to build their component distribution files from Vue.js Single File Components (SFCs) with SCSS styling.

## Goals
- Parse registry configuration and component definitions
- Transform Vue SFCs and SCSS files into JSON registry format
- Generate individual component JSON files and master registry index
- Validate component schemas and file structures
- Support custom output directories and registry configurations
- Provide detailed build feedback and error reporting
- Enable registry maintainers to publish component libraries

## Command Implementation

### 1. Build Command Definition (`packages/cli/src/commands/build.ts`)
```typescript
import { Command } from "commander"
import { z } from "zod"
import * as fs from "fs-extra"
import * as path from "path"
import kleur from "kleur"

import { logger } from "@/utils/logger"
import { handleError } from "@/utils/handle-error"
import { spinner } from "@/utils/spinner"
import { registrySchema, registryItemSchema } from "@/schemas/registry"
import { preFlightBuild } from "@/utils/preflight-build"
import { highlighter } from "@/utils/highlighter"

const buildOptionsSchema = z.object({
  cwd: z.string(),
  registryFile: z.string(),
  outputDir: z.string(),
  verbose: z.boolean().optional().default(false),
})

export const build = new Command()
  .name("build")
  .description("build components for a Meduza UI registry")
  .argument("[registry]", "path to registry.json file", "./registry.json")
  .option(
    "-o, --output <path>",
    "destination directory for json files",
    "./public/r"
  )
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-v, --verbose", "verbose output", false)
  .action(async (registry: string, opts) => {
    try {
      const options = buildOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        registryFile: registry,
        outputDir: opts.output,
        verbose: opts.verbose,
      })

      await runBuild(options)
    } catch (error) {
      handleError(error)
    }
  })

export async function runBuild(options: z.infer<typeof buildOptionsSchema>) {
  const { resolvePaths } = await preFlightBuild(options)
  
  if (!resolvePaths) {
    logger.error(
      `We could not find a registry file at ${highlighter.info(
        path.resolve(options.cwd, options.registryFile)
      )}.`
    )
    process.exit(1)
  }

  // Read and validate registry configuration
  const content = await fs.readFile(resolvePaths.registryFile, "utf-8")
  const result = registrySchema.safeParse(JSON.parse(content))

  if (!result.success) {
    logger.error(
      `Invalid registry file found at ${highlighter.info(
        resolvePaths.registryFile
      )}.`
    )
    logger.break()
    process.exit(1)
  }

  // Ensure output directory exists
  await fs.ensureDir(resolvePaths.outputDir)

  const buildSpinner = spinner("Building registry...")
  const registry = result.data

  try {
    // Process each component in the registry
    for (const registryItem of registry.items) {
      if (!registryItem.files) {
        continue
      }

      buildSpinner.start(`Building ${registryItem.name}...`)

      // Add the schema reference
      registryItem["$schema"] = "https://meduza-ui.dev/schema/registry-item.json"

      // Read and process component files
      for (const file of registryItem.files) {
        const absPath = path.resolve(resolvePaths.cwd, file.path)
        
        try {
          const stat = await fs.stat(absPath)
          if (!stat.isFile()) {
            continue
          }
          
          // Read file content and add to registry item
          file["content"] = await fs.readFile(absPath, "utf-8")
        } catch (err) {
          logger.warn(`Could not read file: ${file.path}`)
          continue
        }
      }

      // Validate the component registry item
      const itemResult = registryItemSchema.safeParse(registryItem)
      if (!itemResult.success) {
        logger.error(
          `Invalid registry item found for ${highlighter.info(
            registryItem.name
          )}.`
        )
        if (options.verbose) {
          console.error(itemResult.error)
        }
        continue
      }

      // Write individual component JSON file
      const outputPath = path.resolve(resolvePaths.outputDir, `${itemResult.data.name}.json`)
      await fs.writeFile(
        outputPath,
        JSON.stringify(itemResult.data, null, 2)
      )

      if (options.verbose) {
        logger.log(`  ✓ ${itemResult.data.name} → ${path.relative(options.cwd, outputPath)}`)
      }
    }

    // Copy main registry.json to output directory
    const registryOutputPath = path.resolve(resolvePaths.outputDir, "registry.json")
    await fs.writeFile(
      registryOutputPath,
      JSON.stringify(registry, null, 2)
    )

    buildSpinner.succeed("Building registry.")

    // Summary output
    if (options.verbose) {
      logger.break()
      logger.info(`Registry built successfully:`)
      logger.log(`  ${highlighter.info(registry.items.length.toString())} components processed`)
      logger.log(`  Output directory: ${highlighter.info(path.relative(options.cwd, resolvePaths.outputDir))}`)
      logger.break()
      
      // List all built components
      for (const item of registry.items) {
        logger.log(`  - ${item.name} (${highlighter.info(item.type)})`)
        if (item.files) {
          for (const file of item.files) {
            logger.log(`    - ${file.path}`)
          }
        }
      }
    } else {
      logger.info(`Built ${registry.items.length} components to ${path.relative(options.cwd, resolvePaths.outputDir)}`)
    }

  } catch (error) {
    buildSpinner.fail("Failed to build registry.")
    throw error
  }
}
```

### 2. Pre-flight Build Validation (`packages/cli/src/utils/preflight-build.ts`)
```typescript
import * as fs from "fs-extra"
import * as path from "path"
import { z } from "zod"

const buildOptionsSchema = z.object({
  cwd: z.string(),
  registryFile: z.string(),
  outputDir: z.string(),
  verbose: z.boolean().optional(),
})

export async function preFlightBuild(
  options: z.infer<typeof buildOptionsSchema>
) {
  const cwd = path.resolve(options.cwd)
  const registryFile = path.resolve(cwd, options.registryFile)
  const outputDir = path.resolve(cwd, options.outputDir)

  // Check if registry file exists
  const registryExists = await fs.pathExists(registryFile)
  if (!registryExists) {
    return {
      resolvePaths: null,
      errors: {
        MISSING_REGISTRY_FILE: true,
      },
    }
  }

  return {
    resolvePaths: {
      cwd,
      registryFile,
      outputDir,
    },
    errors: {},
  }
}
```

### 3. Add Registry Schema Definitions to existing schema file (`packages/cli/src/registry/schema.ts`)
```typescript
import { z } from "zod"

export const registryFileSchema = z.object({
  path: z.string(),
  content: z.string().optional(),
  type: z.enum(["file"]).default("file"),
  target: z.string().optional(),
})

export const registryItemCssVarsSchema = z.object({
  theme: z.record(z.string(), z.string()).optional(),
  light: z.record(z.string(), z.string()).optional(),
  dark: z.record(z.string(), z.string()).optional(),
})

export const registryItemSchema = z.object({
  "$schema": z.string().optional(),
  name: z.string(),
  type: z.enum([
    "registry:component",
    "registry:ui",
    "registry:composable",
    "registry:lib",
    "registry:theme",
    "registry:style",
  ]),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryFileSchema).optional(),
  category: z.string().optional(),
  cssVars: registryItemCssVarsSchema.optional(),
  docs: z.string().optional(),
})

export const registrySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  homepage: z.string().optional(),
  items: z.array(registryItemSchema),
})

export type RegistryFile = z.infer<typeof registryFileSchema>
export type RegistryItem = z.infer<typeof registryItemSchema>
export type Registry = z.infer<typeof registrySchema>
```

## Registry Configuration Format

### 1. Master Registry File (`registry.json`)
```json
{
  "name": "@your-org/meduza-ui",
  "version": "1.0.0",
  "description": "Vue.js components with SCSS styling",
  "homepage": "https://your-ui-library.dev",
  "baseUrl": "https://your-ui-library.dev",
  "style": "default",
  "prefix": "",
  "items": [
    {
      "name": "button",
      "type": "component", 
      "description": "A button component with multiple variants.",
      "dependencies": ["vue"],
      "registryDependencies": ["utils"],
      "files": [
        {
          "path": "components/ui/Button.vue",
          "type": "file"
        },
        {
          "path": "components/ui/button.scss",
          "type": "file"
        }
      ],
      "category": "form",
      "docs": "https://your-ui-library.dev/docs/components/button"
    },
    {
      "name": "utils",
      "type": "lib",
      "description": "Utility functions for component styling",
      "files": [
        {
          "path": "lib/utils.ts",
          "type": "file"
        }
      ]
    }
  ]
}
```

### 2. Component Definition Structure
```json
{
  "$schema": "https://meduza-ui.dev/schema/registry-item.json",
  "name": "button",
  "type": "component",
  "description": "A button component with multiple variants.",
  "dependencies": ["vue"],
  "registryDependencies": ["utils"],
  "files": [
    {
      "path": "components/ui/Button.vue",
      "type": "file",
      "content": "<template>\n  <button :class=\"buttonClasses\" v-bind=\"$attrs\">\n    <slot />\n  </button>\n</template>\n\n<script setup lang=\"ts\">\n// Component implementation\n</script>\n\n<style lang=\"scss\">\n@import './button.scss';\n</style>"
    },
    {
      "path": "components/ui/button.scss",
      "type": "file", 
      "content": ".btn {\n  @include button-base;\n  // SCSS implementation\n}"
    }
  ],
  "category": "form",
  "cssVars": {
    "--btn-padding": "0.5rem 1rem",
    "--btn-border-radius": "0.375rem"
  },
  "docs": "https://your-ui-library.dev/docs/components/button"
}
```

## Build Process Flow

### 1. Registry Validation
- Parse and validate `registry.json` against schema
- Verify all referenced component files exist
- Check for duplicate component names
- Validate component metadata

### 2. File Processing  
- Read Vue SFC content from file system
- Read associated SCSS files
- Parse and validate file structure
- Extract component metadata from file headers

### 3. JSON Generation
- Transform file content into registry format
- Add schema references and metadata
- Generate individual component JSON files
- Create master registry index

### 4. Output Generation
- Write component JSON files to output directory
- Copy master registry.json with updated content
- Generate file manifest for verification
- Create build summary report

## Command Usage Examples

### Basic Build
```bash
# Build registry with default settings
npx meduza-ui build

# Output
✓ Building registry...
✓ Built 15 components to public/r
```

### Custom Registry File
```bash
# Use custom registry configuration
npx meduza-ui build ./custom-registry.json

# With custom output directory
npx meduza-ui build --output ./dist/registry
```

### Verbose Output
```bash
# Show detailed build information
npx meduza-ui build --verbose

# Output
✓ Building registry...
  ✓ button → public/r/button.json
  ✓ input → public/r/input.json  
  ✓ utils → public/r/utils.json
✓ Building registry.

Registry built successfully:
  3 components processed
  Output directory: public/r

  - button (component)
    - components/ui/Button.vue
    - components/ui/button.scss
  - input (component)
    - components/ui/Input.vue
    - components/ui/input.scss
  - utils (lib)
    - lib/utils.ts
```

### Build in Different Directory
```bash
# Build registry in specific project directory
npx meduza-ui build --cwd ./my-component-library

# Combine with other options
npx meduza-ui build ./registry.json --output ./public/registry --verbose --cwd ./projects/ui-lib
```

## Error Scenarios and Handling

### 1. Missing Registry File
```bash
$ npx meduza-ui build
✖ We could not find a registry file at ./registry.json.
```

### 2. Invalid Registry Configuration
```bash
$ npx meduza-ui build
✖ Invalid registry file found at ./registry.json.
```

### 3. Missing Component Files
```bash
$ npx meduza-ui build --verbose
⚠ Could not read file: components/ui/NonExistent.vue
✓ Building registry.
```

### 4. Schema Validation Errors
```bash
$ npx meduza-ui build --verbose
✖ Invalid registry item found for button.
  ZodError: [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["name"],
      "message": "Required"
    }
  ]
```

### 5. File System Errors
```bash
$ npx meduza-ui build --output /readonly/path
✖ Failed to build registry.
Error: EACCES: permission denied, mkdir '/readonly/path'
```

## Integration with CLI

### 1. Command Registration (`packages/cli/src/index.ts`)
```typescript
import { build } from "./commands/build"

const program = new Command()
  .name("meduza-ui")
  .description("Vue.js components with SCSS styling")
  .version(packageJson.version)

program
  .addCommand(build) // Add build command

program.parse()
```

### 2. Help Integration
```bash
$ npx meduza-ui build --help
Usage: meduza-ui build [options] [registry]

build components for a Meduza UI registry

Arguments:
  registry                 path to registry.json file (default: "./registry.json")

Options:
  -o, --output <path>      destination directory for json files (default: "./public/r")
  -c, --cwd <cwd>          the working directory. defaults to the current directory.
  -v, --verbose            verbose output (default: false)
  -h, --help               display help for command

Examples:
  $ npx meduza-ui build
  $ npx meduza-ui build ./custom-registry.json
  $ npx meduza-ui build --output ./dist/registry --verbose
```

## Testing Strategy

### 1. Unit Tests (`packages/cli/src/commands/__tests__/build.test.ts`)
```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { runBuild } from "../build"
import * as fs from "fs-extra"
import * as path from "path"
import { temporaryDirectory } from "tempy"

describe("build command", () => {
  let tempDir: string
  
  beforeEach(async () => {
    tempDir = temporaryDirectory()
  })
  
  afterEach(async () => {
    await fs.remove(tempDir)
  })

  it("should build registry from valid configuration", async () => {
    // Setup test registry and components
    const registryPath = path.join(tempDir, "registry.json")
    const registry = {
      name: "test-registry", 
      version: "1.0.0",
      items: [
        {
          name: "button",
          type: "component",
          files: [
            {
              path: "Button.vue",
              type: "component"
            }
          ]
        }
      ]
    }
    
    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2))
    await fs.writeFile(
      path.join(tempDir, "Button.vue"),
      '<template><button><slot /></button></template>'
    )
    
    // Run build
    await runBuild({
      cwd: tempDir,
      registryFile: "./registry.json", 
      outputDir: "./public/r",
      verbose: false
    })
    
    // Verify output
    const outputDir = path.join(tempDir, "public/r")
    expect(await fs.pathExists(path.join(outputDir, "button.json"))).toBe(true)
    expect(await fs.pathExists(path.join(outputDir, "registry.json"))).toBe(true)
    
    const buttonJson = await fs.readJson(path.join(outputDir, "button.json"))
    expect(buttonJson.name).toBe("button")
    expect(buttonJson.files[0].content).toContain("<template>")
  })

  it("should handle missing registry file", async () => {
    await expect(runBuild({
      cwd: tempDir,
      registryFile: "./nonexistent.json",
      outputDir: "./public/r"
    })).rejects.toThrow()
  })

  it("should validate registry schema", async () => {
    const registryPath = path.join(tempDir, "registry.json")
    await fs.writeFile(registryPath, JSON.stringify({ invalid: "schema" }))
    
    await expect(runBuild({
      cwd: tempDir,
      registryFile: "./registry.json",
      outputDir: "./public/r"
    })).rejects.toThrow()
  })
})
```

### 2. Integration Tests
```typescript
describe("build command integration", () => {
  it("should build complete Vue component library", async () => {
    // Test with realistic component library structure
    // Verify all file types are processed correctly
    // Check dependency resolution
    // Validate output format matches expected schema
  })
  
  it("should handle complex file structures", async () => {
    // Test nested component directories
    // Multiple SCSS files per component
    // TypeScript interface files
    // Documentation files
  })
})
```

## Deliverables

1. **Complete build command implementation** with schema validation
2. **Registry configuration parsing** with comprehensive error handling  
3. **File processing pipeline** for Vue SFCs and SCSS files
4. **JSON output generation** with proper formatting and metadata
5. **Pre-flight validation system** for build prerequisites
6. **Comprehensive error handling** for all failure scenarios
7. **Verbose output mode** with detailed build information
8. **Testing suite** with unit and integration tests
9. **CLI integration** with help documentation and examples
10. **Schema definitions** for registry and component validation

## Testing Checklist

- [ ] Build command processes registry.json correctly
- [ ] Vue SFC files are read and content is included in output
- [ ] SCSS files are processed and included
- [ ] Registry schema validation works correctly
- [ ] Component schema validation catches invalid items
- [ ] Output directory is created if it doesn't exist
- [ ] Individual component JSON files are generated correctly
- [ ] Master registry.json is copied to output directory
- [ ] Verbose mode shows detailed build information
- [ ] Error handling works for all failure scenarios
- [ ] Missing files are handled gracefully with warnings
- [ ] File system permission errors are caught and reported
- [ ] CLI help and examples are accurate
- [ ] Integration with main CLI program works correctly
- [ ] Build process works in different working directories

## Notes

This build command is essential for registry maintainers and organizations creating custom component libraries with Meduza UI. It transforms Vue.js components with SCSS styling into the JSON format required for distribution through the registry system.

The command follows the same patterns as shadcn/ui's build command but is adapted for Vue.js Single File Components and SCSS styling instead of React components with Tailwind CSS.
