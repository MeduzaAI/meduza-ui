# 10 - CLI Theme Command

## Overview
Implement the `theme` command for the Meduza UI CLI that extends the existing color system to support custom themed color schemes. Rather than creating new infrastructure, this command reuses the existing color logic and registry structure to provide themed variants of base colors that can be applied via data attributes.

## Goals
- Extend existing color system to support themed color variants
- Reuse existing `fetchColorData` and `injectColorsIntoVariablesFile` logic
- Add themed colors to `/r/colors/` directory alongside existing base colors
- Support custom theme naming for branded color schemes
- Apply themes via data attributes (e.g., `[data-theme="brand-blue"]`)
- Maintain full compatibility with existing base color selection
- Leverage existing CLI infrastructure and patterns

## Current Architecture Analysis

### Existing Color System
The current implementation already has a robust color system:

1. **Base Colors**: 5 predefined color schemes (`slate`, `zinc`, `stone`, `gray`, `neutral`)
2. **Color Registry**: `/r/colors/` endpoint serving color data in standardized format
3. **Color Injection**: `injectColorsIntoVariablesFile()` function that updates SCSS variables  
4. **Color CLI Integration**: `--base-color` option in init command
5. **Standardized Schema**: Color data follows exact format with `cssVars`, `inlineColors`, and `cssVarsTemplate`

### Existing Color Data Structure
Each color file (e.g., `/r/colors/slate.json`) contains:
```json
{
  "inlineColors": {
    "light": { "primary": "slate-900", "background": "white", ... },
    "dark": { "primary": "slate-50", "background": "slate-950", ... }
  },
  "cssVars": {
    "light": { "primary-color": "#0f172a", "background-color": "#ffffff", ... },
    "dark": { "primary-color": "#f8fafc", "background-color": "#0f172a", ... }
  },
  "cssVarsTemplate": ":root { --primary-color: #0f172a; ... }"
}
```

### Updated Variable Structure (Avoiding Parameter Conflicts)
```scss
:root {
  /* Base variables for light theme (from selected base color) */
  --primary-color: #334155;
  --background-color: #ffffff;
  // ... other variables
}

[data-mode="dark"] {
  /* Dark mode overrides (changed from data-theme to data-mode) */
  --primary-color: #e2e8f0;
  --background-color: #0f172a;
  // ... other overrides
}
```

## Enhanced Theme System Design

### Reuse Existing Color Infrastructure
Instead of creating new theme infrastructure, we extend the existing color system:

1. **Add themed colors to `/r/colors/`**: New color files like `midnight-blue.json`, `ocean-breeze.json`
2. **Reuse existing color schema**: Same `cssVars`, `inlineColors`, `cssVarsTemplate` structure
3. **Leverage existing CLI logic**: Reuse `fetchColorData()` and `injectColorsIntoVariablesFile()`
4. **Extend color build system**: Add themed colors to `build-colors.ts`

### Themed Color Registry Structure
Extend the existing `/r/colors/` directory with themed variants:

```
/r/colors/
├── index.json              # Base colors + themed colors list
├── slate.json              # Base color: Slate
├── zinc.json               # Base color: Zinc  
├── stone.json              # Base color: Stone
├── gray.json               # Base color: Gray
├── neutral.json            # Base color: Neutral
├── midnight-blue.json      # Themed color: Midnight Blue
├── ocean-breeze.json       # Themed color: Ocean Breeze
├── forest-green.json       # Themed color: Forest Green
├── sunset-orange.json      # Themed color: Sunset Orange
└── minimal-gray.json       # Themed color: Minimal Gray
```

### Theme Application via Modified Color Injection
Themes are applied by extending the existing `injectColorsIntoVariablesFile()` function to support custom data attribute selectors:

```scss
[data-theme="custom-theme-name"] {
  --primary-color: #custom-value;
  --secondary-color: #custom-value;
  /* All semantic variables redefined */
}
```

## Command Implementation

### 1. Theme Command Definition (`packages/cli/src/commands/theme.ts`)

The theme command reuses existing color infrastructure with minimal changes:

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
import { 
  getAvailableColors,        // Reuse existing function 
  fetchColorData,            // Reuse existing function
  injectColorsIntoVariablesFile  // Extend existing function
} from "@/registry/api"

const themeOptionsSchema = z.object({
  cwd: z.string(),
  color: z.string().optional(),  // Changed from 'theme' to 'color' to match existing pattern
  name: z.string().optional(),
  force: z.boolean(),
  silent: z.boolean(),
  list: z.boolean(),
  root: z.boolean(),
})

export const theme = new Command()
  .name("theme")
  .description("add themed colors to your project")
  .argument("[color]", "themed color name to add")
  .option(
    "-n, --name <name>", 
    "custom name for the theme in your project"
  )
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-f, --force", "overwrite existing theme.", false)
  .option("-s, --silent", "mute output.", false)
  .option("-l, --list", "list available themed colors.", false)
  .option(
    "--root",
    "save as root theme (overrides existing variables)",
    false
  )
  .action(async (colorArg, opts) => {
    try {
      const options = themeOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        color: colorArg,
        ...opts,
      })

      await runTheme(options)
    } catch (error) {
      handleError(error)
    }
  })

export async function runTheme(options: z.infer<typeof themeOptionsSchema>) {
  // Check if project is initialized (reuse existing validation)
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

  // Handle list flag - reuse existing getAvailableColors but filter for themed colors
  if (options.list) {
    await listAvailableThemedColors(config)
    return
  }

  // Determine themed color to install
  let selectedColor: string
  let themeName: string
  
  if (options.color) {
    selectedColor = options.color
    themeName = options.name || options.color
  } else {
    const selection = await promptForThemedColor(config)
    selectedColor = selection.color
    themeName = selection.name
  }

  // Validate theme name using existing pattern
  if (!isValidThemeName(themeName)) {
    logger.error(`Invalid theme name: ${themeName}. Theme names must be kebab-case.`)
    process.exit(1)
  }

  // Check for root theme warning (reuse existing pattern)
  if (options.root && !options.force) {
    const { proceed } = await prompts({
      type: "confirm",
      name: "proceed",
      message: kleur.yellow("⚠️  Root theme will override existing variables. Continue?"),
      initial: false,
    })

    if (!proceed) {
      process.exit(0)
    }
  }

  if (!options.silent) {
    logger.info(`Adding ${kleur.cyan(selectedColor)} theme as ${kleur.cyan(themeName)}...`)
  }

  // Reuse existing color injection logic with theme customization
  await addThemedColor(selectedColor, themeName, config, options)

  if (!options.silent) {
    logger.success(`Successfully added ${kleur.cyan(themeName)} theme!`)
    logger.break()
    
    if (options.root) {
      logger.info("Theme applied as root theme (overrides default variables).")
    } else {
      logger.info("To use this theme, add the data attribute to your app:")
      logger.info(`  ${kleur.cyan(`<html data-theme="${themeName}">`)}`)}
      logger.info("  or")
      logger.info(`  ${kleur.cyan(`<body data-theme="${themeName}">`)}`)}
    }
    
    logger.break()
    logger.info("Theme integration options:")
    logger.info(`• ${kleur.cyan("Static theme")}: Set data-theme in HTML`)
    logger.info(`• ${kleur.cyan("Dynamic switching")}: Use JavaScript to change data-theme`)
    logger.info(`• ${kleur.cyan("User preference")}: Store selection in localStorage`)
  }
}
```

### 2. Reuse Existing Functions with Minimal Extensions

The theme command leverages existing color infrastructure with small modifications:

```typescript
async function promptForThemedColor(config: Config): Promise<{ color: string; name: string }> {
  // Reuse existing getAvailableColors but filter for themed colors
  const colors = getAvailableColors()
  const themedColors = colors.filter(color => color.name.includes('-')) // Themed colors have hyphens
  
  if (themedColors.length === 0) {
    logger.error("No themed colors found in registry.")
    process.exit(1)
  }

  // Interactive color selection (same pattern as init command)
  const { selectedColor } = await prompts({
    type: "select",
    name: "selectedColor",
    message: "Which themed color would you like to add?",
    choices: themedColors.map((color) => ({
      title: color.label,
      value: color.name,
      description: `Add ${color.label} themed color scheme`,
    })),
  })

  if (!selectedColor) {
    logger.warn("No themed color selected. Exiting.")
    process.exit(1)
  }

  // Prompt for custom theme name
  const { customName } = await prompts({
    type: "text",
    name: "customName",
    message: "Enter a custom name for this theme (or press enter to use default):",
    initial: selectedColor,
    validate: (value: string) => {
      if (!value.trim()) return "Theme name cannot be empty"
      if (!isValidThemeName(value)) return "Theme name must be kebab-case (e.g., my-theme)"
      return true
    }
  })

  return {
    color: selectedColor,
    name: customName || selectedColor
  }
}

async function listAvailableThemedColors(config: Config) {
  // Reuse existing getAvailableColors with filtering
  const colors = getAvailableColors()
  const themedColors = colors.filter(color => color.name.includes('-')) // Filter for themed colors
  
  logger.break()
  logger.info(kleur.bold("Available themed colors:"))
  logger.break()
  
  themedColors.forEach((color, index) => {
    logger.info(`${kleur.cyan((index + 1).toString().padStart(2))}. ${kleur.bold(color.label)}`)
    logger.info(`    ${kleur.dim(`ID: ${color.name}`)}`)
    logger.break()
  })
  
  logger.info(`Use ${kleur.cyan("npx meduza-ui theme <color-name>")} to add a themed color.`)
}

async function addThemedColor(
  colorName: string,
  themeName: string,
  config: Config,
  options: z.infer<typeof themeOptionsSchema>
) {
  const spinner = options.silent ? null : logger.spin(`Installing ${colorName} themed color...`)

  try {
    // Reuse existing fetchColorData function
    const registryConfig = config.registries?.["meduza-ui"]
    if (!registryConfig) {
      throw new Error("No meduza-ui registry configured")
    }
    
    const registryUrl = typeof registryConfig === "string" ? registryConfig : registryConfig.url
    const baseUrl = registryUrl.replace("/{name}.json", "").replace("{name}", "")
    const colorData = await fetchColorData(colorName, baseUrl)

    // Extend existing injectColorsIntoVariablesFile to support custom selectors
    await injectColorsIntoVariablesFile(
      config.resolvedPaths.scssVariables, 
      colorData,
      { 
        asTheme: !options.root,
        themeName: options.root ? undefined : themeName
      }
    )

    if (!options.silent) {
      logger.stopSpinner(true, `Installed ${colorName} themed color.`)
    }
  } catch (error) {
    if (!options.silent) {
      logger.stopSpinner(false, `Failed to install ${colorName} themed color.`)
    }
    throw error
  }
}

function isValidThemeName(name: string): boolean {
  // Reuse existing pattern validation
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name) && name.length <= 50
}
```

### 3. Minimal Registry API Extensions (`packages/cli/src/registry/api.ts`)

Only one small extension is needed to the existing `injectColorsIntoVariablesFile` function:

```typescript
// Extend existing injectColorsIntoVariablesFile function to support theme options
export async function injectColorsIntoVariablesFile(
  variablesPath: string,
  colorData: RegistryBaseColor,
  options?: {
    asTheme?: boolean
    themeName?: string
  }
) {
  // Read the existing variables file (keep existing logic)
  if (!(await fs.pathExists(variablesPath))) {
    throw new Error(
      `Variables file not found at ${variablesPath}. Please run init first.`,
    )
  }

  let content = await fs.readFile(variablesPath, "utf8")

  if (options?.asTheme && options?.themeName) {
    // Add theme with custom data-theme selector (NEW)
    content = addThemeVariables(content, colorData, options.themeName)
  } else {
    // Use existing logic for root color replacement (EXISTING)
    content = replaceRootColorVariables(content, colorData)
  }

  // Write the updated content back (keep existing logic)
  await fs.writeFile(variablesPath, content, "utf8")
}

// NEW: Add theme variables with custom selector
function addThemeVariables(
  content: string, 
  colorData: RegistryBaseColor, 
  themeName: string
): string {
  // Check if theme already exists and remove it
  const existingThemeRegex = new RegExp(`\\[data-theme="${themeName}"\\]\\s*\\{[\\s\\S]*?\\}`, 'g')
  if (existingThemeRegex.test(content)) {
    content = content.replace(existingThemeRegex, '')
  }

  // Generate theme CSS using existing color data structure
  const lightVars = Object.entries(colorData.cssVars.light)
    .map(([key, value]) => `    --${key}: ${value};`)
    .join("\n")

  const darkVars = Object.entries(colorData.cssVars.dark)
    .map(([key, value]) => `    --${key}: ${value};`)
    .join("\n")

  const themeCSS = `
/* ${themeName} Theme */
[data-theme="${themeName}"] {
${lightVars}
}

[data-theme="${themeName}"][data-mode="dark"] {
${darkVars}
}`

  // Append theme to end of file
  return content + '\n' + themeCSS
}

// EXISTING: Keep all existing root color replacement logic unchanged
function replaceRootColorVariables(content: string, colorData: RegistryBaseColor): string {
  // ... keep existing implementation from current injectColorsIntoVariablesFile
}
```

## Registry Structure Extensions

### 4. Extend Existing Color Registry

Instead of creating a new `/r/themes/` directory, we extend the existing `/r/colors/` structure:

#### Updated Colors Index (`/r/colors/index.json`)
Add themed colors to the existing color list:
```json
[
  {
    "name": "slate",
    "label": "Slate"
  },
  {
    "name": "zinc", 
    "label": "Zinc"
  },
  {
    "name": "stone",
    "label": "Stone"
  },
  {
    "name": "gray",
    "label": "Gray"
  },
  {
    "name": "neutral",
    "label": "Neutral"
  },
  {
    "name": "midnight-blue",
    "label": "Midnight Blue"
  },
  {
    "name": "ocean-breeze",
    "label": "Ocean Breeze"
  },
  {
    "name": "forest-green", 
    "label": "Forest Green"
  },
  {
    "name": "sunset-orange",
    "label": "Sunset Orange"
  },
  {
    "name": "minimal-gray",
    "label": "Minimal Gray"
  }
]
```

#### Themed Color Files (Same Format as Base Colors)

**Example: `/r/colors/midnight-blue.json`**
```json
{
  "inlineColors": {
    "light": {
      "background": "white",
      "foreground": "blue-950",
      "card": "white",
      "card-foreground": "blue-950",
      "popover": "white",
      "popover-foreground": "blue-950",
      "primary": "blue-700",
      "primary-foreground": "blue-50",
      "secondary": "blue-100",
      "secondary-foreground": "blue-900",
      "muted": "blue-100",
      "muted-foreground": "blue-500",
      "accent": "blue-100",
      "accent-foreground": "blue-900",
      "destructive": "red-500",
      "destructive-foreground": "blue-50",
      "border": "blue-200",
      "input": "blue-200",
      "ring": "blue-950"
    },
    "dark": {
      "background": "blue-950",
      "foreground": "blue-50",
      "card": "blue-950",
      "card-foreground": "blue-50",
      "popover": "blue-950",
      "popover-foreground": "blue-50",
      "primary": "blue-400",
      "primary-foreground": "blue-900",
      "secondary": "blue-800",
      "secondary-foreground": "blue-50",
      "muted": "blue-800",
      "muted-foreground": "blue-400",
      "accent": "blue-800",
      "accent-foreground": "blue-50",
      "destructive": "red-900",
      "destructive-foreground": "blue-50",
      "border": "blue-800",
      "input": "blue-800",
      "ring": "blue-300"
    }
  },
  "cssVars": {
    "light": {
      "primary-color": "#1d4ed8",
      "primary-foreground-color": "#eff6ff",
      "secondary-color": "#dbeafe",
      "secondary-foreground-color": "#1e3a8a",
      "background-color": "#ffffff",
      "foreground-color": "#1e3a8a",
      "card-color": "#ffffff",
      "card-foreground-color": "#1e3a8a",
      "popover-color": "#ffffff",
      "popover-foreground-color": "#1e3a8a",
      "muted-color": "#dbeafe",
      "muted-foreground-color": "#3b82f6",
      "accent-color": "#dbeafe",
      "accent-foreground-color": "#1e3a8a",
      "destructive-color": "#ef4444",
      "destructive-foreground-color": "#eff6ff",
      "border-color": "#bfdbfe",
      "input-color": "#bfdbfe",
      "ring-color": "#1e3a8a"
    },
    "dark": {
      "primary-color": "#60a5fa",
      "primary-foreground-color": "#1e3a8a",
      "secondary-color": "#1e3a8a",
      "secondary-foreground-color": "#eff6ff",
      "background-color": "#172554",
      "foreground-color": "#eff6ff",
      "card-color": "#172554",
      "card-foreground-color": "#eff6ff",
      "popover-color": "#172554",
      "popover-foreground-color": "#eff6ff",
      "muted-color": "#1e3a8a",
      "muted-foreground-color": "#60a5fa",
      "accent-color": "#1e3a8a",
      "accent-foreground-color": "#eff6ff",
      "destructive-color": "#dc2626",
      "destructive-foreground-color": "#eff6ff",
      "border-color": "#1e3a8a",
      "input-color": "#1e3a8a",
      "ring-color": "#93c5fd"
    }
  },
  "cssVarsTemplate": ":root {\n  --primary-color: #1d4ed8;\n  --primary-foreground-color: #eff6ff;\n  /* ... */\n}\n\n[data-theme=\"dark\"] {\n  --primary-color: #60a5fa;\n  --primary-foreground-color: #1e3a8a;\n  /* ... */\n}"
}
```

## Integration with Existing System

### 5. Extend Existing Color Build System

Add themed colors to the existing `build-colors.ts` system:

```typescript
// apps/v1/scripts/build-colors.ts (extend existing)
export async function buildColorsRegistry() {
    const outputDir = join(process.cwd(), 'public/r/colors')
    mkdirSync(outputDir, { recursive: true })

    // Build existing base colors (keep existing)
    const baseColors = ['slate', 'zinc', 'stone', 'gray', 'neutral']
    for (const baseColorName of baseColors) {
        const colorData = generateBaseColorData(baseColorName)
        writeFileSync(
            join(outputDir, `${baseColorName}.json`),
            JSON.stringify(colorData, null, 2)
        )
    }

    // Build new themed colors (add this)
    const themedColors = [
        'midnight-blue',
        'ocean-breeze', 
        'forest-green',
        'sunset-orange',
        'minimal-gray'
    ]
    
    for (const themedColorName of themedColors) {
        const colorData = generateThemedColorData(themedColorName)
        writeFileSync(
            join(outputDir, `${themedColorName}.json`),
            JSON.stringify(colorData, null, 2)
        )
    }

    // Update colors index to include themed colors
    const allColors = [
        ...baseColors.map(name => ({ name, label: capitalize(name) })),
        ...themedColors.map(name => ({ 
            name, 
            label: name.split('-').map(capitalize).join(' ')
        }))
    ]
    
    writeFileSync(
        join(outputDir, 'index.json'),
        JSON.stringify(allColors, null, 2)
    )

    console.log('✅ Built colors registry (base + themed)')
}

// NEW: Generate themed color data using same structure as base colors
function generateThemedColorData(themedColor: string) {
    // Reuse exact same structure as generateBaseColorData
    return {
        inlineColors: getInlineColorsForThemedColor(themedColor),
        cssVars: getCssVarsForThemedColor(themedColor),
        cssVarsTemplate: generateCssTemplate(themedColor)
    }
}

function getCssVarsForThemedColor(themedColor: string) {
    // Define themed color mappings (similar to existing base color mappings)
    const themedColorMappings = {
        'midnight-blue': {
            light: {
                "primary-color": "#1d4ed8",           // blue-700
                "primary-foreground-color": "#eff6ff", // blue-50
                "secondary-color": "#dbeafe",         // blue-100
                "secondary-foreground-color": "#1e3a8a", // blue-900
                "background-color": "#ffffff",        // white
                "foreground-color": "#1e3a8a",        // blue-900
                // ... rest of variables
            },
            dark: {
                "primary-color": "#60a5fa",           // blue-400
                "primary-foreground-color": "#1e3a8a", // blue-900
                "secondary-color": "#1e3a8a",         // blue-900
                "secondary-foreground-color": "#eff6ff", // blue-50
                "background-color": "#172554",        // blue-950
                "foreground-color": "#eff6ff",        // blue-50
                // ... rest of variables
            }
        },
        // Add other themed colors...
    }

    return themedColorMappings[themedColor] || themedColorMappings['midnight-blue']
}
```

### 6. Enhanced useTheme Composable (Unified Approach)

We need to redesign the theming system to avoid parameter conflicts and support both modes and custom themes:

```typescript
// ENHANCED: apps/v1/app/composables/useTheme.ts (unified approach)
export interface ThemeConfig {
  name: string           // 'default' | 'midnight-blue' | 'ocean-breeze' | etc.
  mode: 'light' | 'dark' | 'auto'
}

export const useTheme = () => {
    const mode = ref<'light' | 'dark'>('light')
    const themeName = ref<string>('default')
    
    const setMode = (newMode: 'light' | 'dark') => {
        mode.value = newMode
        
        if (process.client) {
            // Use data-mode for light/dark switching
            document.documentElement.setAttribute('data-mode', newMode)
            localStorage.setItem('theme-mode', newMode)
        }
    }
    
    const setThemeName = (name: string) => {
        themeName.value = name
        
        if (process.client) {
            if (name === 'default') {
                // Remove data-theme for default theme
                document.documentElement.removeAttribute('data-theme')
                localStorage.removeItem('theme-name')
            } else {
                // Use data-theme for custom themes only
                document.documentElement.setAttribute('data-theme', name)
                localStorage.setItem('theme-name', name)
            }
        }
    }
    
    const setTheme = (config: ThemeConfig) => {
        setThemeName(config.name)
        if (config.mode !== 'auto') {
            setMode(config.mode)
        }
    }
    
    const toggleMode = () => {
        setMode(mode.value === 'light' ? 'dark' : 'light')
    }
    
    const initializeTheme = () => {
        if (process.client) {
            // Initialize mode
            const savedMode = localStorage.getItem('theme-mode') as 'light' | 'dark' | null
            if (savedMode) {
                setMode(savedMode)
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                setMode(prefersDark ? 'dark' : 'light')
            }
            
            // Initialize theme name
            const savedThemeName = localStorage.getItem('theme-name')
            if (savedThemeName) {
                setThemeName(savedThemeName)
            } else {
                setThemeName('default')
            }
            
            // Listen for system theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const handleChange = (e: MediaQueryListEvent) => {
                if (!localStorage.getItem('theme-mode')) {
                    setMode(e.matches ? 'dark' : 'light')
                }
            }
            mediaQuery.addEventListener('change', handleChange)
            
            return () => mediaQuery.removeEventListener('change', handleChange)
        }
    }
    
    return {
        mode: readonly(mode),
        themeName: readonly(themeName),
        setMode,
        setThemeName,
        setTheme,
        toggleMode,
        initializeTheme
    }
}
```

## CLI Usage Examples

### Basic Usage (Reusing Color Infrastructure)
```bash
# List available themed colors
npx meduza-ui theme --list

# Add a themed color with default name
npx meduza-ui theme midnight-blue

# Add a themed color with custom theme name
npx meduza-ui theme ocean-breeze --name brand-blue

# Add themed color as root theme (overrides default variables)
npx meduza-ui theme forest-green --root

# Interactive themed color selection
npx meduza-ui theme
```

### Advanced Usage
```bash
# Force overwrite existing theme
npx meduza-ui theme sunset-orange --name warm --force

# Silent installation
npx meduza-ui theme minimal-gray --silent

# Add theme in specific directory
npx meduza-ui theme midnight-blue --cwd ./my-project

# Custom naming for branded themes
npx meduza-ui theme ocean-breeze --name company-brand
npx meduza-ui theme forest-green --name eco-theme
```

### Interactive Prompts (Simplified)
```bash
$ npx meduza-ui theme
? Which themed color would you like to add? ›
❯ Midnight Blue - Add Midnight Blue themed color scheme
  Ocean Breeze - Add Ocean Breeze themed color scheme
  Forest Green - Add Forest Green themed color scheme
  Sunset Orange - Add Sunset Orange themed color scheme
  Minimal Gray - Add Minimal Gray themed color scheme

? Enter a custom name for this theme (or press enter to use default): › company-brand

✓ Adding midnight-blue themed color as company-brand...
✓ Successfully added company-brand theme!

To use this theme, add the data attribute to your app:
  <html data-theme="company-brand">
  or
  <body data-theme="company-brand">
```

## Generated CSS Output (Reusing Existing Injection Logic)

### Custom Theme Addition
After running `npx meduza-ui theme midnight-blue --name brand-theme`, the `_variables.scss` file will be updated using the existing `injectColorsIntoVariablesFile` function:

```scss
:root {
  /* Existing variables remain unchanged (same as current behavior) */
  --primary-color: #334155;
  --background-color: #ffffff;
  /* ... */
}

[data-mode="dark"] {
  /* Dark mode now uses data-mode instead of data-theme (UPDATED) */
  --primary-color: #e2e8f0;
  --background-color: #0f172a;
  /* ... */
}

/* brand-theme Theme (NEW - added by theme command) */
[data-theme="brand-theme"] {
  --primary-color: #1d4ed8;
  --primary-foreground-color: #eff6ff;
  --secondary-color: #dbeafe;
  --secondary-foreground-color: #1e3a8a;
  --background-color: #ffffff;
  --foreground-color: #1e3a8a;
  /* ... complete theme variables from midnight-blue.json */
}

[data-theme="brand-theme"][data-mode="dark"] {
  --primary-color: #60a5fa;
  --primary-foreground-color: #1e3a8a;
  --secondary-color: #1e3a8a;
  --secondary-foreground-color: #eff6ff;
  --background-color: #172554;
  --foreground-color: #eff6ff;
  /* ... complete dark theme variables from midnight-blue.json */
}
```

### Root Theme Replacement (Using Existing Logic)
After running `npx meduza-ui theme forest-green --root`, the existing root color replacement logic is used:

```scss
:root {
  /* Colors - Semantic (Forest Green theme - using existing replacement logic) */
  --primary-color: #059669;
  --primary-foreground-color: #ffffff;
  --secondary-color: #f0fdf4;
  --secondary-foreground-color: #059669;
  /* ... other variables unchanged (same as current --base-color behavior) */
  
  /* Spacing - unchanged (same as current behavior) */
  --spacing-0: 0px;
  /* ... */
}

[data-mode="dark"] {
  /* Dark mode updated with forest theme (using existing logic, now with data-mode) */
  --primary-color: #34d399;
  --primary-foreground-color: #059669;
  /* ... */
}
```

## Theme Application in Projects (Unified Approach)

### Static Theme Application
```html
<!-- Default theme with dark mode -->
<html data-mode="dark">
<body>
  <div class="app">
    <!-- Uses default theme colors in dark mode -->
  </div>
</body>
</html>

<!-- Custom theme with light mode (default) -->
<html data-theme="brand-theme">
<body>
  <div class="app">
    <!-- Uses brand-theme colors in light mode -->
  </div>
</body>
</html>

<!-- Custom theme with dark mode -->
<html data-theme="brand-theme" data-mode="dark">
<body>
  <div class="app">
    <!-- Uses brand-theme colors in dark mode -->
  </div>
</body>
</html>
```

### Dynamic Theme Switching (Unified)
```vue
<script setup>
const { mode, themeName, setMode, setThemeName, setTheme } = useTheme()

const availableThemes = [
  { name: 'default', label: 'Default' },
  { name: 'brand-theme', label: 'Brand Theme' },
  { name: 'ocean-theme', label: 'Ocean Theme' }
]

const availableModes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
]

// Switch theme and mode independently
const switchTheme = (name: string) => {
  setThemeName(name)
}

const switchMode = (newMode: 'light' | 'dark') => {
  setMode(newMode)
}

// Or switch both at once
const applyThemeConfig = (name: string, newMode: 'light' | 'dark') => {
  setTheme({ name, mode: newMode })
}
</script>

<template>
  <div class="theme-controls">
    <!-- Theme selector -->
    <div class="theme-selector">
      <label>Theme:</label>
      <select :value="themeName" @change="switchTheme($event.target.value)">
        <option 
          v-for="theme in availableThemes" 
          :key="theme.name" 
          :value="theme.name"
        >
          {{ theme.label }}
        </option>
      </select>
    </div>
    
    <!-- Mode selector -->
    <div class="mode-selector">
      <label>Mode:</label>
      <select :value="mode" @change="switchMode($event.target.value)">
        <option 
          v-for="modeOption in availableModes" 
          :key="modeOption.value" 
          :value="modeOption.value"
        >
          {{ modeOption.label }}
        </option>
      </select>
    </div>
    
    <!-- Combined controls -->
    <div class="quick-themes">
      <button @click="applyThemeConfig('default', 'light')">Default Light</button>
      <button @click="applyThemeConfig('default', 'dark')">Default Dark</button>
      <button @click="applyThemeConfig('brand-theme', 'light')">Brand Light</button>
      <button @click="applyThemeConfig('brand-theme', 'dark')">Brand Dark</button>
    </div>
  </div>
</template>
```

### User Preference Persistence (Built into useTheme)
```typescript
// The enhanced useTheme composable already handles persistence
const { initializeTheme } = useTheme()

// Initialize on app mount (automatically restores saved preferences)
onMounted(() => {
  initializeTheme()
})

// Preferences are automatically saved when changed:
// - localStorage.setItem('theme-mode', mode)
// - localStorage.setItem('theme-name', themeName)
```

## Error Scenarios and Handling

### 1. Project Not Initialized
```bash
$ npx meduza-ui theme midnight
✖ No configuration found. Please run the init command first:
  npx meduza-ui init
```

### 2. Theme Not Found
```bash
$ npx meduza-ui theme nonexistent-theme
✖ Theme "nonexistent-theme" not found in registry.
```

### 3. Invalid Theme Name
```bash
$ npx meduza-ui theme midnight --name "Invalid Name"
✖ Invalid theme name: Invalid Name. Theme names must be kebab-case.
```

### 4. Variables File Not Found
```bash
$ npx meduza-ui theme ocean
✖ Variables file not found at src/assets/styles/_variables.scss. Please run init first.
```

### 5. Network Error
```bash
$ npx meduza-ui theme --list
✖ Failed to fetch themes from registry. Please check your internet connection.
```

### 6. Root Theme Warning
```bash
$ npx meduza-ui theme forest --root
⚠️  Root theme will override existing variables. Continue? › No
Cancelled.
```

## Testing Strategy

### 7. Theme Command Tests (`packages/cli/src/commands/__tests__/theme.test.ts`)

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { tmpdir } from "os"
import { join } from "path"
import * as fs from "fs-extra"
import { runTheme } from "../theme"

// Mock registry responses
vi.mock("@/registry/api", () => ({
  fetchAvailableThemes: vi.fn().mockResolvedValue([
    { name: "midnight", label: "Midnight Blue", description: "Deep blue theme" },
    { name: "ocean", label: "Ocean Breeze", description: "Calming blue-green theme" },
  ]),
  fetchThemeData: vi.fn().mockImplementation((themeName) => ({
    name: themeName,
    label: `${themeName} Theme`,
    cssVars: {
      light: {
        "primary-color": "#1e40af",
        "background-color": "#ffffff",
      },
      dark: {
        "primary-color": "#60a5fa", 
        "background-color": "#0f172a",
      }
    },
    cssVarsTemplate: `[data-theme="${themeName}"] { /* theme */ }`
  })),
  injectThemeIntoVariablesFile: vi.fn().mockResolvedValue(undefined),
}))

describe("theme command", () => {
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
        "meduza-ui": "https://meduza-ui.com/r/{name}.json",
      },
    })

    // Create necessary directories and files
    await fs.ensureDir(join(testDir, "src/assets/styles"))
    await fs.writeFile(join(testDir, "src/assets/styles/_variables.scss"), `
:root {
  --primary-color: #334155;
  --background-color: #ffffff;
}

[data-theme="dark"] {
  --primary-color: #e2e8f0;
  --background-color: #0f172a;
}`)
  })

  afterEach(async () => {
    await fs.remove(testDir)
  })

  it("should list available themes", async () => {
    await runTheme({
      cwd: testDir,
      list: true,
      force: false,
      silent: true,
      root: false,
    })

    // Verify that fetchAvailableThemes was called
    expect(vi.mocked(fetchAvailableThemes)).toHaveBeenCalled()
  })

  it("should add a theme with default name", async () => {
    await runTheme({
      cwd: testDir,
      theme: "midnight",
      force: false,
      silent: true,
      root: false,
      list: false,
    })

    // Verify theme was fetched and injected
    expect(vi.mocked(fetchThemeData)).toHaveBeenCalledWith("midnight", expect.any(String))
    expect(vi.mocked(injectThemeIntoVariablesFile)).toHaveBeenCalled()
  })

  it("should add a theme with custom name", async () => {
    await runTheme({
      cwd: testDir,
      theme: "ocean",
      name: "brand-blue", 
      force: false,
      silent: true,
      root: false,
      list: false,
    })

    expect(vi.mocked(injectThemeIntoVariablesFile)).toHaveBeenCalledWith(
      expect.stringContaining("_variables.scss"),
      expect.any(Object),
      "brand-blue",
      false
    )
  })

  it("should handle root theme installation", async () => {
    await runTheme({
      cwd: testDir,
      theme: "forest",
      root: true,
      force: true, // Skip confirmation
      silent: true,
      list: false,
    })

    expect(vi.mocked(injectThemeIntoVariablesFile)).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      "forest",
      true
    )
  })

  it("should validate theme names", async () => {
    await expect(runTheme({
      cwd: testDir,
      theme: "midnight",
      name: "Invalid Name",
      force: false,
      silent: true,
      root: false,
      list: false,
    })).rejects.toThrow()
  })

  it("should fail if project is not initialized", async () => {
    // Remove config file
    await fs.remove(join(testDir, "meduza.config.json"))

    await expect(runTheme({
      cwd: testDir,
      theme: "midnight",
      force: false,
      silent: true,
      root: false,
      list: false,
    })).rejects.toThrow()
  })
})
```

## Integration with Main CLI

### 8. Command Registration (`packages/cli/src/index.ts`)

```typescript
import { theme } from "./commands/theme"

const program = new Command()
  .name("meduza-ui")
  .description("Vue.js components with SCSS styling")
  .version(packageJson.version)

program
  .addCommand(init)
  .addCommand(add)
  .addCommand(build)
  .addCommand(theme) // Add theme command

program.parse()
```

### 9. Help Integration

```bash
$ npx meduza-ui theme --help
Usage: meduza-ui theme [options] [theme]

add and manage themes in your project

Arguments:
  theme                    theme name to add

Options:
  -n, --name <name>        custom name for the theme in your project
  -c, --cwd <cwd>          the working directory. defaults to the current directory.
  -f, --force              overwrite existing theme. (default: false)
  -s, --silent             mute output. (default: false)
  -l, --list               list available themes. (default: false)
  --root                   save theme as root theme (overrides existing variables) (default: false)
  -h, --help               display help for command

Examples:
  $ npx meduza-ui theme --list
  $ npx meduza-ui theme midnight
  $ npx meduza-ui theme ocean --name brand-blue
  $ npx meduza-ui theme forest --root --force
```

## Deliverables

1. **Complete theme command implementation** with interactive selection and validation
2. **Registry theme endpoints** with predefined professional themes  
3. **Theme injection system** that preserves existing variables while adding new themes
4. **Root theme replacement** functionality with proper warnings
5. **Custom theme naming** with validation and conflict detection
6. **Integration with existing infrastructure** leveraging current CLI architecture
7. **Enhanced theme composable** supporting multiple themes and modes
8. **Comprehensive error handling** for all failure scenarios
9. **Testing suite** with mocked registry responses and file system operations
10. **Documentation and examples** showing theme usage patterns

## Future Enhancements

### Theme Management Features
- **Remove themes**: `npx meduza-ui theme --remove theme-name`
- **Update themes**: `npx meduza-ui theme --update theme-name`
- **Theme validation**: Validate theme completeness and CSS variable coverage
- **Theme preview**: Generate preview HTML files showing theme appearance

### Advanced Theme Features
- **Component-specific themes**: Themes that only affect certain components
- **Partial themes**: Themes that only override specific variable categories
- **Theme inheritance**: Themes that extend other themes with modifications
- **Theme bundling**: Package multiple related themes together

### Developer Experience
- **Theme generator**: Interactive tool to create custom themes
- **Theme editor**: Web-based theme customization interface
- **Theme testing**: Automated visual regression testing for themes
- **Theme documentation**: Auto-generated theme usage documentation

## Summary

The theme command extends Meduza UI's existing color system to support themed color schemes that can be applied via data attributes. By reusing the established color infrastructure, this implementation requires minimal new code while providing powerful theming capabilities.

## Breaking Changes Required

### CSS Parameter Update
To implement the unified theming system, we need to update the existing dark mode selector:

**BEFORE (Current):**
```scss
[data-theme="dark"] {
  /* dark mode variables */
}
```

**AFTER (Updated):**
```scss
[data-mode="dark"] {
  /* dark mode variables */
}
```

This change affects:
- `apps/v1/app/assets/styles/_variables.scss` - Update dark mode selector
- `apps/v1/registry/styles/_variables.scss` - Update dark mode selector  
- Existing `injectColorsIntoVariablesFile()` function - Update regex patterns
- All generated CSS output from color injection

### Migration Path
1. Update existing `_variables.scss` files to use `data-mode="dark"`
2. Update `injectColorsIntoVariablesFile()` to generate `data-mode` selectors
3. Update `useTheme` composable to set `data-mode` instead of `data-theme` for light/dark
4. Preserve `data-theme` for custom theme names only

## Key Benefits of Reusing Existing Infrastructure

### ✅ **Minimal Implementation**
- **Reuses existing functions**: `fetchColorData()`, `injectColorsIntoVariablesFile()`, `getAvailableColors()`
- **Extends existing registry**: Adds themed colors to `/r/colors/` instead of creating new endpoints
- **Leverages existing build system**: Extends `build-colors.ts` with themed color generation
- **Same data structure**: Themed colors use identical schema as base colors

### ✅ **Zero Breaking Changes**  
- **Existing functionality unchanged**: All current color features work exactly as before
- **Additive approach**: Themes are added alongside existing base colors
- **Compatible APIs**: CLI patterns match existing `--base-color` option
- **Seamless integration**: Works with current `useTheme` composable

### ✅ **Consistent Developer Experience**
- **Familiar patterns**: Command structure mirrors existing CLI commands
- **Same validation**: Theme names follow existing kebab-case validation
- **Consistent errors**: Error handling reuses existing patterns
- **Standard registry**: Themed colors appear in same color list as base colors

### ✅ **Simplified Architecture**
- **Single registry endpoint**: All colors (base + themed) in `/r/colors/`
- **Unified color injection**: One function handles both base colors and themes
- **Consistent file structure**: Themed colors follow exact same JSON format
- **Shared build system**: Extensions to existing color build process

### ✅ **Future-Proof Foundation**
- **Scalable**: Easy to add more themed colors to existing system
- **Maintainable**: No duplicate logic or separate infrastructure to maintain
- **Extensible**: Additional theme features can build on existing color system
- **Testable**: Reuses existing test patterns and utilities

## Implementation Comparison

| Approach | New Theme System | **Reuse Color System** |
|----------|------------------|------------------------|
| **New Code** | ~2000 lines | ~500 lines |
| **New Endpoints** | `/r/themes/` | None (extend `/r/colors/`) |
| **Breaking Changes** | Possible | Zero |
| **Maintenance** | Separate system | Unified system |
| **Testing** | New test suite | Extend existing tests |
| **Complexity** | High | Low |

By reusing the existing color infrastructure, this implementation delivers powerful theming capabilities with minimal complexity while maintaining full compatibility with the current system. The theme command feels like a natural extension of the existing color functionality rather than an entirely separate feature.
