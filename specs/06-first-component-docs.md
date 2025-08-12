# 04 - First Component

## Overview
Create the first UI component (Button) and deploy the registry app. This establishes the component pattern and validates the entire system works end-to-end.

## Goals
- Create a production-ready Button component using our design system
- Test the build system generates correct registry JSON
- Deploy the registry app to serve components
- Validate all registry endpoints work correctly
- Establish Vue component patterns for the library

## Base Colors System

Following shadcn's approach exactly, we need a simple base colors system that provides theming. The key insight is that base colors are **hardcoded in the CLI** and only the color mappings are served from the registry.

### 1. Color Registry Builder (`apps/v1/scripts/build-colors.ts`)
```typescript
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// Build the color registry files to match shadcn's schema
export async function buildColorsRegistry() {
  const outputDir = join(process.cwd(), 'public/r/colors')
  mkdirSync(outputDir, { recursive: true })
  
  // Build individual base color files matching shadcn's registryBaseColorSchema
  const baseColors = ['slate', 'zinc', 'stone', 'gray', 'neutral']
  
  for (const baseColorName of baseColors) {
    const colorData = generateBaseColorData(baseColorName)
    
    writeFileSync(
      join(outputDir, `${baseColorName}.json`),
      JSON.stringify(colorData, null, 2)
    )
  }
  
  console.log('✅ Built colors registry')
}

function generateBaseColorData(baseColor: string) {
  // This matches exactly what shadcn serves at /r/colors/{color}.json
  return {
    inlineColors: {
      light: {
        background: "white",
        foreground: `${baseColor}-950`,
        card: "white",
        "card-foreground": `${baseColor}-950`,
        popover: "white",
        "popover-foreground": `${baseColor}-950`,
        primary: `${baseColor}-900`,
        "primary-foreground": `${baseColor}-50`,
        secondary: `${baseColor}-100`,
        "secondary-foreground": `${baseColor}-900`,
        muted: `${baseColor}-100`,
        "muted-foreground": `${baseColor}-500`,
        accent: `${baseColor}-100`,
        "accent-foreground": `${baseColor}-900`,
        destructive: "red-500",
        "destructive-foreground": `${baseColor}-50`,
        border: `${baseColor}-200`,
        input: `${baseColor}-200`,
        ring: `${baseColor}-950`
      },
      dark: {
        background: `${baseColor}-950`,
        foreground: `${baseColor}-50`,
        card: `${baseColor}-950`,
        "card-foreground": `${baseColor}-50`,
        popover: `${baseColor}-950`,
        "popover-foreground": `${baseColor}-50`,
        primary: `${baseColor}-50`,
        "primary-foreground": `${baseColor}-900`,
        secondary: `${baseColor}-800`,
        "secondary-foreground": `${baseColor}-50`,
        muted: `${baseColor}-800`,
        "muted-foreground": `${baseColor}-400`,
        accent: `${baseColor}-800`,
        "accent-foreground": `${baseColor}-50`,
        destructive: "red-900",
        "destructive-foreground": `${baseColor}-50`,
        border: `${baseColor}-800`,
        input: `${baseColor}-800`,
        ring: `${baseColor}-300`
      }
    },
    cssVars: getCssVarsForBaseColor(baseColor),
    cssVarsTemplate: generateCssTemplate(baseColor)
  }
}

function getCssVarsForBaseColor(baseColor: string) {
  // Hex color mappings for each base color - matches shadcn exactly
  const colorMappings = {
    slate: {
      light: {
        "primary-color": "#0f172a",           // slate-900
        "primary-foreground-color": "#f8fafc", // slate-50
        "secondary-color": "#f1f5f9",         // slate-100
        "secondary-foreground-color": "#0f172a", // slate-900
        "background-color": "#ffffff",        // white
        "foreground-color": "#0f172a",        // slate-900
        "card-color": "#ffffff",              // white
        "card-foreground-color": "#0f172a",   // slate-900
        "popover-color": "#ffffff",           // white
        "popover-foreground-color": "#0f172a", // slate-900
        "muted-color": "#f1f5f9",             // slate-100
        "muted-foreground-color": "#64748b",  // slate-500
        "accent-color": "#f1f5f9",            // slate-100
        "accent-foreground-color": "#0f172a", // slate-900
        "destructive-color": "#ef4444",       // red-500
        "destructive-foreground-color": "#f8fafc", // slate-50
        "border-color": "#e2e8f0",            // slate-200
        "input-color": "#e2e8f0",             // slate-200
        "ring-color": "#0f172a"               // slate-900
      },
      dark: {
        "primary-color": "#f8fafc",           // slate-50
        "primary-foreground-color": "#0f172a", // slate-900
        "secondary-color": "#1e293b",         // slate-800
        "secondary-foreground-color": "#f8fafc", // slate-50
        "background-color": "#0f172a",        // slate-900
        "foreground-color": "#f8fafc",        // slate-50
        "card-color": "#0f172a",              // slate-900
        "card-foreground-color": "#f8fafc",   // slate-50
        "popover-color": "#0f172a",           // slate-900
        "popover-foreground-color": "#f8fafc", // slate-50
        "muted-color": "#1e293b",             // slate-800
        "muted-foreground-color": "#94a3b8",  // slate-400
        "accent-color": "#1e293b",            // slate-800
        "accent-foreground-color": "#f8fafc", // slate-50
        "destructive-color": "#dc2626",       // red-600
        "destructive-foreground-color": "#f8fafc", // slate-50
        "border-color": "#1e293b",            // slate-800
        "input-color": "#1e293b",             // slate-800
        "ring-color": "#cbd5e1"               // slate-300
      }
    },
    zinc: {
      light: {
        "primary-color": "#18181b",           // zinc-900
        "primary-foreground-color": "#fafafa", // zinc-50
        "secondary-color": "#f4f4f5",         // zinc-100
        "secondary-foreground-color": "#18181b", // zinc-900
        "background-color": "#ffffff",        // white
        "foreground-color": "#18181b",        // zinc-900
        "card-color": "#ffffff",              // white
        "card-foreground-color": "#18181b",   // zinc-900
        "popover-color": "#ffffff",           // white
        "popover-foreground-color": "#18181b", // zinc-900
        "muted-color": "#f4f4f5",             // zinc-100
        "muted-foreground-color": "#71717a",  // zinc-500
        "accent-color": "#f4f4f5",            // zinc-100
        "accent-foreground-color": "#18181b", // zinc-900
        "destructive-color": "#ef4444",       // red-500
        "destructive-foreground-color": "#fafafa", // zinc-50
        "border-color": "#e4e4e7",            // zinc-200
        "input-color": "#e4e4e7",             // zinc-200
        "ring-color": "#18181b"               // zinc-900
      },
      dark: {
        "primary-color": "#fafafa",           // zinc-50
        "primary-foreground-color": "#18181b", // zinc-900
        "secondary-color": "#27272a",         // zinc-800
        "secondary-foreground-color": "#fafafa", // zinc-50
        "background-color": "#09090b",        // zinc-950
        "foreground-color": "#fafafa",        // zinc-50
        "card-color": "#09090b",              // zinc-950
        "card-foreground-color": "#fafafa",   // zinc-50
        "popover-color": "#09090b",           // zinc-950
        "popover-foreground-color": "#fafafa", // zinc-50
        "muted-color": "#27272a",             // zinc-800
        "muted-foreground-color": "#a1a1aa",  // zinc-400
        "accent-color": "#27272a",            // zinc-800
        "accent-foreground-color": "#fafafa", // zinc-50
        "destructive-color": "#dc2626",       // red-600
        "destructive-foreground-color": "#fafafa", // zinc-50
        "border-color": "#27272a",            // zinc-800
        "input-color": "#27272a",             // zinc-800
        "ring-color": "#d4d4d8"               // zinc-300
      }
    }
    // Add stone, gray, neutral mappings...
  }
  
  return colorMappings[baseColor] || colorMappings.slate
}

function generateCssTemplate(baseColor: string) {
  const cssVars = getCssVarsForBaseColor(baseColor)
  
  const lightVars = Object.entries(cssVars.light)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')
  
  const darkVars = Object.entries(cssVars.dark)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')
  
  return `:root {
${lightVars}
}

[data-theme="dark"] {
${darkVars}
}`
}
```

### 2. Integration with Main Build Script
```typescript
// In apps/v1/scripts/build-registry.ts
import { buildColorsRegistry } from './build-colors'

async function buildRegistry() {
  console.log('🏗️  Building registry...')
  
  // ... existing code ...
  
  // Build colors registry (simple!)
  await buildColorsRegistry()
  
  console.log('✅ Registry built successfully!')
}
```

### 3. Complete Design System Variables (`apps/v1/assets/styles/_variables.scss`)
```scss
// Comprehensive design system variables matching spec 03
// Colors will be injected by CLI based on user's base color choice

:root {
  /* Colors - Semantic (injected by CLI) */
  --primary-color: #334155;
  --primary-foreground-color: #f8fafc;
  --secondary-color: #f1f5f9;
  --secondary-foreground-color: #0f172a;
  --accent-color: #3b82f6;
  --accent-foreground-color: #ffffff;
  --destructive-color: #ef4444;
  --destructive-foreground-color: #ffffff;
  --warning-color: #f59e0b;
  --warning-foreground-color: #ffffff;
  --success-color: #10b981;
  --success-foreground-color: #ffffff;
  --info-color: #06b6d4;
  --info-foreground-color: #ffffff;
  
  /* Surface colors */
  --background-color: #ffffff;
  --foreground-color: #0f172a;
  --surface-color: #ffffff;
  --surface-foreground-color: #0f172a;
  --card-color: #ffffff;
  --card-foreground-color: #0f172a;
  --popover-color: #ffffff;
  --popover-foreground-color: #0f172a;
  
  /* Border and outline */
  --border-color: #e2e8f0;
  --input-color: #e2e8f0;
  --ring-color: #3b82f6;
  --outline-color: #94a3b8;
  
  /* Muted colors */
  --muted-color: #f8fafc;
  --muted-foreground-color: #64748b;
  
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
  
  /* Semantic text sizes */
  --text-caption: var(--text-xs);
  --text-body: var(--text-base);
  --text-lead: var(--text-lg);
  --text-subhead: var(--text-xl);
  --text-heading: var(--text-2xl);
  --text-title: var(--text-3xl);
  --text-display: var(--text-4xl);
  
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
  /* Dark mode color overrides (injected by CLI) */
  --primary-color: #e2e8f0;
  --primary-foreground-color: #0f172a;
  --secondary-color: #1e293b;
  --secondary-foreground-color: #f8fafc;
  --accent-color: #60a5fa;
  --accent-foreground-color: #1e293b;
  --destructive-color: #f87171;
  --destructive-foreground-color: #1e293b;
  --warning-color: #fbbf24;
  --warning-foreground-color: #1e293b;
  --success-color: #34d399;
  --success-foreground-color: #1e293b;
  --info-color: #22d3ee;
  --info-foreground-color: #1e293b;
  
  --background-color: #0f172a;
  --foreground-color: #f8fafc;
  --surface-color: #1e293b;
  --surface-foreground-color: #f8fafc;
  --card-color: #1e293b;
  --card-foreground-color: #f8fafc;
  --popover-color: #1e293b;
  --popover-foreground-color: #f8fafc;
  
  --border-color: #334155;
  --input-color: #334155;
  --ring-color: #60a5fa;
  --outline-color: #64748b;
  
  --muted-color: #1e293b;
  --muted-foreground-color: #94a3b8;
}
```

## Button Component Implementation

### 1. Button Component (`apps/v1/registry/default/ui/button.vue`)
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useClassName } from '@/lib/utils'

// Enums for type safety
enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Outline = 'outline',
  Ghost = 'ghost',
  Destructive = 'destructive'
}

enum ButtonSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg'
}

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: ButtonVariant.Primary,
  size: ButtonSize.Medium,
  disabled: false,
  type: 'button'
})

// Root class using component name in kebab-case
const { b } = useClassName('button')

const buttonClasses = computed(() => {
  return b([
    props.variant,
    props.size,
    { disabled: props.disabled }
  ])
})
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :type="type"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: calc(var(--radius) - 2px);
  transition: colors 0.2s;
  cursor: pointer;
  border: 1px solid transparent;
  font-weight: 500;
  
  &:focus-visible {
    outline: 2px solid var(--ring-color);
    outline-offset: 2px;
  }
  
  // Variants using CSS variables directly
  &--primary {
    background-color: var(--primary-color);
    color: var(--primary-foreground-color);
    
    &:hover:not(.button--disabled) {
      opacity: 0.9;
    }
  }
  
  &--secondary {
    background-color: var(--secondary-color);
    color: var(--secondary-foreground-color);
    
    &:hover:not(.button--disabled) {
      opacity: 0.8;
    }
  }
  
  &--outline {
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    color: var(--foreground-color);
    
    &:hover:not(.button--disabled) {
      background-color: var(--accent-color);
      color: var(--accent-foreground-color);
    }
  }
  
  &--ghost {
    background-color: transparent;
    color: var(--foreground-color);
    
    &:hover:not(.button--disabled) {
      background-color: var(--accent-color);
      color: var(--accent-foreground-color);
    }
  }
  
  &--destructive {
    background-color: var(--destructive-color);
    color: var(--destructive-foreground-color);
    
    &:hover:not(.button--disabled) {
      opacity: 0.9;
    }
  }
  
  // Sizes
  &--sm {
    height: 36px;
    padding: 0 12px;
    font-size: 0.875rem;
  }
  
  &--md {
    height: 40px;
    padding: 0 16px;
    font-size: 0.875rem;
  }
  
  &--lg {
    height: 44px;
    padding: 0 24px;
    font-size: 1rem;
  }
  
  // States
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}
</style>
```

### 2. Button Registry Metadata (`apps/v1/registry/registry-ui.ts`)
```typescript
import { type Registry } from "@/lib/registry-schema"

export const ui: Registry["items"] = [
  {
    name: "button",
    type: "registry:ui",
    description: "A flexible button component with multiple variants and sizes",
    dependencies: [],
    registryDependencies: ["utils"],
    files: [
      {
        path: "ui/button.vue",
        type: "registry:ui",
      },
    ],
  },
]
```

### 3. Registry Index (`apps/v1/registry/index.ts`)
```typescript
import { type Registry } from "@/lib/registry-schema"

import { ui } from "@/registry/registry-ui"
import { lib } from "@/registry/registry-lib"
import { themes } from "@/registry/registry-themes"

export const registry: Registry = {
  name: "meduza-ui",
  items: [
    ...ui,
    ...lib,
    ...themes,
  ],
}
```

## Updated Build Script (Extending Spec 03)

### Enhanced Registry Builder (`apps/v1/scripts/build-registry.ts`)
```typescript
import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { availableStyles } from '../registry/config/styles';
import { availableColors, colorValues } from '../registry/config/colors';
import { registry } from '../registry/index';

interface RegistryItem {
  name: string;
  type: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: Array<{
    path: string;
    content: string;
    type: string;
    target?: string;
  }>;
}

async function buildRegistry() {
  console.log('🏗️  Building registry...');
  
  // Ensure output directory exists
  const outputDir = join(process.cwd(), 'public/r');
  mkdirSync(outputDir, { recursive: true });
  mkdirSync(join(outputDir, 'styles'), { recursive: true });
  mkdirSync(join(outputDir, 'styles/default'), { recursive: true });
  mkdirSync(join(outputDir, 'colors'), { recursive: true });
  
  // 1. Build styles index
  writeFileSync(
    join(outputDir, 'styles/index.json'),
    JSON.stringify(availableStyles, null, 2)
  );
  
  // 2. Build colors index  
  writeFileSync(
    join(outputDir, 'colors/index.json'),
    JSON.stringify(availableColors, null, 2)
  );
  
  // 3. Build individual color files
  Object.entries(colorValues).forEach(([colorName, colors]) => {
    writeFileSync(
      join(outputDir, 'colors', `${colorName}.json`),
      JSON.stringify(colors, null, 2)
    );
  });
  
  // 4. Build registry components from registry items
  await buildRegistryComponents();
  
  console.log('✅ Registry built successfully!');
}

async function buildRegistryComponents() {
  for (const item of registry.items) {
    try {
      const registryItem = await buildRegistryItem(item);
      
      // Write to output
      const outputPath = join(process.cwd(), 'public/r/styles/default', `${item.name}.json`);
      writeFileSync(outputPath, JSON.stringify(registryItem, null, 2));
      
      console.log(`📦 Built component: ${item.name}`);
    } catch (error) {
      console.error(`❌ Error building ${item.name}:`, error);
    }
  }
}

async function buildRegistryItem(item: any): Promise<RegistryItem> {
  const files = [];
  
  for (const fileConfig of item.files) {
    let sourcePath: string;
    let content: string;
    
    if (fileConfig.path.endsWith('.vue')) {
      // Read Vue component from registry directory
      sourcePath = join(process.cwd(), 'registry/default', fileConfig.path);
    } else if (fileConfig.path.endsWith('.scss')) {
      // Read SCSS files from styles directory
      sourcePath = join(process.cwd(), 'registry/styles', fileConfig.path.replace('assets/styles/', ''));
    } else {
      // Read TS files from lib directory
      sourcePath = join(process.cwd(), 'registry/default', fileConfig.path);
    }
    
    try {
      content = readFileSync(sourcePath, 'utf-8');
    } catch (error) {
      console.warn(`⚠️  Could not read file: ${sourcePath}`);
      content = `// File not found: ${fileConfig.path}`;
    }
    
    files.push({
      path: fileConfig.path,
      content,
      type: fileConfig.type,
      target: fileConfig.target || fileConfig.path
    });
  }
  
  return {
    $schema: "https://meduza-ui.com/schema/registry-item.json",
    ...item,
    files
  };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildRegistry().catch(console.error);
}
```

## Deployment Configuration

### Package.json Scripts (`apps/v1/package.json`)
```json
{
  "scripts": {
    "dev": "nuxt dev --port 3000",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "build:registry": "tsx scripts/build-registry.ts",
    "deploy": "npm run build:registry && npm run build",
    "start": "node .output/server/index.mjs"
  }
}
```

## CLI Integration

The base colors work exactly like shadcn - hardcoded in CLI, registry serves color mappings:

### 1. CLI Color Selection Process
1. **Hardcoded list** in CLI shows: Slate, Zinc, Stone, Gray, Neutral
2. User selects base color during `meduza-ui init`
3. CLI fetches `/r/colors/{color}.json` from registry
4. CLI updates the color variables in `assets/styles/_variables.scss`
5. **All other design variables stay intact** (spacing, typography, shadows, etc.)
6. Components automatically work with the selected base color

### 2. Registry Endpoints Required
- `/r/colors/slate.json` - Slate color mappings  
- `/r/colors/zinc.json` - Zinc color mappings
- `/r/colors/stone.json` - Stone color mappings
- `/r/colors/gray.json` - Gray color mappings
- `/r/colors/neutral.json` - Neutral color mappings

### 3. Example Registry Response (`/r/colors/slate.json`)
```json
{
  "cssVars": {
    "light": {
      "primary-color": "#0f172a",
      "primary-foreground-color": "#f8fafc",
      "secondary-color": "#f1f5f9",
      "secondary-foreground-color": "#0f172a",
      "background-color": "#ffffff",
      "foreground-color": "#0f172a",
      "border-color": "#e2e8f0",
      "destructive-color": "#ef4444",
      "destructive-foreground-color": "#f8fafc"
    },
    "dark": {
      "primary-color": "#f8fafc",
      "primary-foreground-color": "#0f172a", 
      "secondary-color": "#1e293b",
      "secondary-foreground-color": "#f8fafc",
      "background-color": "#0f172a",
      "foreground-color": "#f8fafc",
      "border-color": "#1e293b",
      "destructive-color": "#dc2626",
      "destructive-foreground-color": "#f8fafc"
    }
  },
  "cssVarsTemplate": ":root {\n  --primary-color: #0f172a;\n  --primary-foreground-color: #f8fafc;\n  --secondary-color: #f1f5f9;\n  --background-color: #ffffff;\n}\n\n[data-theme=\"dark\"] {\n  --primary-color: #f8fafc;\n  --primary-foreground-color: #0f172a;\n  --secondary-color: #1e293b;\n  --background-color: #0f172a;\n}"
}
```

## Testing Registry Endpoints

After deployment, these endpoints should work:

### Core Registry Endpoints
- `https://your-domain.com/r/styles/index.json`
- `https://your-domain.com/r/colors/slate.json`
- `https://your-domain.com/r/colors/zinc.json`
- `https://your-domain.com/r/colors/stone.json`
- `https://your-domain.com/r/colors/gray.json`
- `https://your-domain.com/r/colors/neutral.json`
- `https://your-domain.com/r/styles/default/index.json`
- `https://your-domain.com/r/styles/default/utils.json`
- `https://your-domain.com/r/styles/default/button.json`

### Example Button Component Response
```json
{
  "$schema": "https://meduza-ui.com/schema/registry-item.json",
  "name": "button",
  "type": "registry:ui",
  "description": "A flexible button component with multiple variants and sizes",
  "dependencies": [],
  "registryDependencies": ["utils"],
  "files": [
    {
      "path": "components/ui/button.vue",
      "content": "<template>\n  <button\n    :class=\"buttonClasses\"\n    :disabled=\"disabled\"\n    :type=\"type\"\n    v-bind=\"$attrs\"\n  >\n    <slot />\n  </button>\n</template>\n\n<script setup lang=\"ts\">\nimport { computed } from 'vue'\nimport { useClassName } from '@/lib/utils'\n\n// ... rest of component code",
      "type": "registry:ui",
      "target": "components/ui/button.vue"
    }
  ]
}
```

## Component Patterns Established

### 1. Vue SFC Structure
- **Script first**: setup, enums, props, logic
- **Template second**: clean, semantic HTML
- **Style last**: BEM with root class matching component name

### 2. BEM Naming Convention
- **Root class**: kebab-case component name (`.button`)
- **Modifiers**: variants and states (`--primary`, `--disabled`)
- **Elements**: child components when needed (`__icon`)

### 3. Type Safety
- **Enums for variants**: `ButtonVariant.Primary`
- **Proper interfaces**: `ButtonProps` with defaults
- **TypeScript throughout**: full type coverage

### 4. Registry Structure
- **Separate metadata files**: `registry-ui.ts` for component definitions
- **Clean component files**: no metadata mixed with component code
- **Organized imports**: centralized registry index

## Deliverables

1. **Simple base colors registry** matching shadcn's schema exactly
2. **Color endpoints** serving 5 base colors (slate, zinc, stone, gray, neutral)
3. **CSS variables system** that works with any base color
4. **Production-ready Button component** using semantic CSS variables
5. **Registry metadata structure** following shadcn patterns
6. **Enhanced build system** that processes components and colors
7. **Working registry endpoints** serving button and color JSON
8. **Deployed registry app** with functional endpoints
9. **Established Vue + SCSS patterns** for future components

## Testing

### Color System Testing
- [ ] Base colors build script generates valid JSON for slate, zinc, stone, gray, neutral
- [ ] Color registry endpoints `/r/colors/{color}.json` return correct schema
- [ ] CSS templates contain valid HSL values for light and dark modes
- [ ] `inlineColors` map semantic tokens to Tailwind color classes
- [ ] `cssVars` map semantic tokens to HSL values
- [ ] `cssVarsTemplate` contains ready-to-inject CSS

### Button Component Testing  
- [ ] Button component renders correctly in all variants and sizes
- [ ] Build script generates valid button.json file from registry metadata
- [ ] Registry endpoint `/r/styles/default/button.json` returns correct data
- [ ] Button component follows BEM naming with root `.button` class
- [ ] Button uses CSS variables and responds to any base color
- [ ] All accessibility features work correctly (focus rings, keyboard navigation)
- [ ] Enums work properly for type safety
- [ ] SCSS compiles correctly and semantic colors work

### System Integration Testing
- [ ] Registry app deploys successfully with all endpoints
- [ ] Registry structure follows shadcn patterns
- [ ] Color and component registries integrate correctly
- [ ] Build process handles both colors and components

