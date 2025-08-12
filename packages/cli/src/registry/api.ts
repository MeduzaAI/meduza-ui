import fetch from "node-fetch"
import fs from "fs-extra"
import * as path from "path"
import { registryItemSchema, registryBaseColorSchema, type RegistryItem, type RegistryBaseColor } from "./schema"

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
