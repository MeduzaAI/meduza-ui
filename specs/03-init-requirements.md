# 03 - Init Requirements & Base Components

## Overview
Implement the base components and functionality that the CLI's `init` command requires. This includes the base style system, utility functions, and configuration files that get installed when users run `meduza-ui init`.

## Goals
- Create source files for all init-required components
- Implement the base style system with SCSS variables and mixins
- Create the useClassName utility function
- Set up configuration templates
- Ensure build script generates all required registry endpoints
- Test that init requirements are served correctly

## Required Components for Init

Based on analysis of shadcn's init command, our CLI will need these components from the registry:

### 1. Base Style System ("index" component)
- SCSS variables and mixins
- CSS custom properties for theming
- Base component styles

### 2. Utility Functions ("utils" component)  
- useClassName BEM utility
- Helper functions for Vue projects

### 3. Configuration Templates
- components.json configuration
- Base SCSS structure

### 4. Available Options
- Style variants (default, minimal, etc.)
- Color schemes (slate, gray, neutral, etc.)

## Source Files to Create

### 1. Base Style System (`apps/v1/registry/default/lib/index.ts`)
```typescript
// apps/v1/registry/default/lib/index.ts
/**
 * @name index
 * @description Base style system with SCSS variables and CSS custom properties
 * @type registry:style
 * @dependencies []
 * @registryDependencies ["utils"]
 */

// This file serves as metadata for the build script
// The actual styles are in the SCSS files

export const metadata = {
  name: "index",
  type: "registry:style" as const,
  description: "Base style system with SCSS variables and mixins",
  dependencies: [],
  registryDependencies: ["utils"],
  files: [
    {
      path: "assets/styles/_variables.scss",
      type: "registry:style" as const,
      target: "assets/styles/_variables.scss"
    },
    {
      path: "assets/styles/_mixins.scss", 
      type: "registry:style" as const,
      target: "assets/styles/_mixins.scss"
    },

  ],
  cssVars: {
    light: {
      "primary-color": "#334155",
      "primary-foreground-color": "#f8fafc",
      "secondary-color": "#f1f5f9",
      "secondary-foreground-color": "#0f172a",
      "background-color": "#ffffff",
      "foreground-color": "#0f172a",
      "border-color": "#e2e8f0"
    },
    dark: {
      "primary-color": "#e2e8f0",
      "primary-foreground-color": "#0f172a",
      "secondary-color": "#1e293b", 
      "secondary-foreground-color": "#f8fafc",
      "background-color": "#0f172a",
      "foreground-color": "#f8fafc",
      "border-color": "#334155"
    }
  }
}
```

### 2. CSS Variables (`apps/v1/registry/styles/_variables.scss`)
```scss
// Comprehensive semantic CSS variables - no conflicts with user styles
:root {
  /* Colors - Semantic */
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

### 3. SCSS Mixins (`apps/v1/registry/styles/_mixins.scss`)
```scss
// Typography utility mixin - generates font styles from string like 'text-lg-semibold'
@mixin text($style) {
  // Examples: 'text-xs-regular', 'text-lg-semibold', 'heading-bold'
  
  @if $style == 'text-xs-light' {
    font-size: var(--text-xs);
    font-weight: var(--font-light);
    line-height: var(--leading-normal);
  } @else if $style == 'text-xs-regular' {
    font-size: var(--text-xs);
    font-weight: var(--font-regular);
    line-height: var(--leading-normal);
  } @else if $style == 'text-xs-medium' {
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    line-height: var(--leading-normal);
  } @else if $style == 'text-xs-semibold' {
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    line-height: var(--leading-normal);
  } @else if $style == 'text-xs-bold' {
    font-size: var(--text-xs);
    font-weight: var(--font-bold);
    line-height: var(--leading-normal);
  } @else if $style == 'text-sm-light' {
    font-size: var(--text-sm);
    font-weight: var(--font-light);
    line-height: var(--leading-normal);
  } @else if $style == 'text-sm-regular' {
    font-size: var(--text-sm);
    font-weight: var(--font-regular);
    line-height: var(--leading-normal);
  } @else if $style == 'text-sm-medium' {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    line-height: var(--leading-normal);
  } @else if $style == 'text-sm-semibold' {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    line-height: var(--leading-normal);
  } @else if $style == 'text-sm-bold' {
    font-size: var(--text-sm);
    font-weight: var(--font-bold);
    line-height: var(--leading-normal);
  } @else if $style == 'text-base-light' {
    font-size: var(--text-base);
    font-weight: var(--font-light);
    line-height: var(--leading-normal);
  } @else if $style == 'text-base-regular' {
    font-size: var(--text-base);
    font-weight: var(--font-regular);
    line-height: var(--leading-normal);
  } @else if $style == 'text-base-medium' {
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    line-height: var(--leading-normal);
  } @else if $style == 'text-base-semibold' {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    line-height: var(--leading-normal);
  } @else if $style == 'text-base-bold' {
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    line-height: var(--leading-normal);
  } @else if $style == 'text-lg-light' {
    font-size: var(--text-lg);
    font-weight: var(--font-light);
    line-height: var(--leading-normal);
  } @else if $style == 'text-lg-regular' {
    font-size: var(--text-lg);
    font-weight: var(--font-regular);
    line-height: var(--leading-normal);
  } @else if $style == 'text-lg-medium' {
    font-size: var(--text-lg);
    font-weight: var(--font-medium);
    line-height: var(--leading-normal);
  } @else if $style == 'text-lg-semibold' {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    line-height: var(--leading-normal);
  } @else if $style == 'text-lg-bold' {
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
    line-height: var(--leading-normal);
  } @else if $style == 'caption-regular' {
    font-size: var(--text-caption);
    font-weight: var(--font-regular);
    line-height: var(--leading-normal);
  } @else if $style == 'caption-medium' {
    font-size: var(--text-caption);
    font-weight: var(--font-medium);
    line-height: var(--leading-normal);
  } @else if $style == 'body-regular' {
    font-size: var(--text-body);
    font-weight: var(--font-regular);
    line-height: var(--leading-normal);
  } @else if $style == 'body-medium' {
    font-size: var(--text-body);
    font-weight: var(--font-medium);
    line-height: var(--leading-normal);
  } @else if $style == 'lead-regular' {
    font-size: var(--text-lead);
    font-weight: var(--font-regular);
    line-height: var(--leading-relaxed);
  } @else if $style == 'lead-medium' {
    font-size: var(--text-lead);
    font-weight: var(--font-medium);
    line-height: var(--leading-relaxed);
  } @else if $style == 'subhead-medium' {
    font-size: var(--text-subhead);
    font-weight: var(--font-medium);
    line-height: var(--leading-tight);
  } @else if $style == 'subhead-semibold' {
    font-size: var(--text-subhead);
    font-weight: var(--font-semibold);
    line-height: var(--leading-tight);
  } @else if $style == 'heading-medium' {
    font-size: var(--text-heading);
    font-weight: var(--font-medium);
    line-height: var(--leading-tight);
  } @else if $style == 'heading-semibold' {
    font-size: var(--text-heading);
    font-weight: var(--font-semibold);
    line-height: var(--leading-tight);
  } @else if $style == 'heading-bold' {
    font-size: var(--text-heading);
    font-weight: var(--font-bold);
    line-height: var(--leading-tight);
  } @else if $style == 'title-medium' {
    font-size: var(--text-title);
    font-weight: var(--font-medium);
    line-height: var(--leading-tight);
  } @else if $style == 'title-semibold' {
    font-size: var(--text-title);
    font-weight: var(--font-semibold);
    line-height: var(--leading-tight);
  } @else if $style == 'title-bold' {
    font-size: var(--text-title);
    font-weight: var(--font-bold);
    line-height: var(--leading-tight);
  } @else if $style == 'display-medium' {
    font-size: var(--text-display);
    font-weight: var(--font-medium);
    line-height: var(--leading-tight);
  } @else if $style == 'display-semibold' {
    font-size: var(--text-display);
    font-weight: var(--font-semibold);
    line-height: var(--leading-tight);
  } @else if $style == 'display-bold' {
    font-size: var(--text-display);
    font-weight: var(--font-bold);
    line-height: var(--leading-tight);
  } @else {
    @warn "Unknown text style: #{$style}";
    font-size: var(--text-base);
    font-weight: var(--font-regular);
    line-height: var(--leading-normal);
  }
}

// General utility mixins - pixels
@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin focus-ring {
  outline: 2px solid var(--ring-color);
  outline-offset: 2px;
}
```

### 4. BEM useClassName Utility (`apps/v1/registry/default/lib/utils.ts`)
```typescript
// apps/v1/registry/default/lib/utils.ts
/**
 * @name utils  
 * @description BEM className utility for Vue components
 * @type registry:lib
 * @dependencies []
 */

// Types for BEM className utility
type BemModifiers = Record<string, boolean>;

interface BemClassNameOptions {
  prefix?: string;
  separator?: {
    element?: string;
    modifier?: string;
  };
}

interface BemElement {
  m: (modifiers: string | string[] | BemModifiers) => string;
}

interface BemBlock {
  (modifiers?: string | string[] | BemModifiers): string;
  e: (element: string) => BemElement;
  m: (modifiers: string | string[] | BemModifiers) => string;
}

interface UseClassNameReturn {
  b: BemBlock;
  e: (element: string) => BemElement;
  m: (modifiers: string | string[] | BemModifiers) => string;
}

export function useClassName(block: string, options?: BemClassNameOptions): UseClassNameReturn {
  const config = {
    prefix: '',
    separator: {
      element: '__',
      modifier: '--',
    },
    ...options,
  };

  const getBlockName = (): string => {
    return config.prefix ? `${config.prefix}-${block}` : block;
  };

  const generateModifiers = (
    base: string,
    modifiers: string | string[] | BemModifiers
  ): string[] => {
    const classes = [base];

    if (typeof modifiers === 'string') {
      classes.push(`${base}${config.separator.modifier}${modifiers}`);
    } else if (Array.isArray(modifiers)) {
      modifiers.forEach(mod => {
        classes.push(`${base}${config.separator.modifier}${mod}`);
      });
    } else if (modifiers && typeof modifiers === 'object') {
      Object.entries(modifiers).forEach(([key, value]) => {
        if (value) {
          classes.push(`${base}${config.separator.modifier}${key}`);
        }
      });
    }

    return classes;
  };

  const b: BemBlock = ((modifiers?: string | string[] | BemModifiers) => {
    const blockName = getBlockName();

    if (!modifiers) {
      return blockName;
    }

    return generateModifiers(blockName, modifiers).join(' ');
  }) as BemBlock;

  const e = (element: string): BemElement => {
    const elementName = `${getBlockName()}${config.separator.element}${element}`;

    const elementObj: BemElement = {
      m: (modifiers: string | string[] | BemModifiers): string => {
        return generateModifiers(elementName, modifiers).join(' ');
      },
    };

    return elementObj;
  };

  const m = (modifiers: string | string[] | BemModifiers): string => {
    return generateModifiers(getBlockName(), modifiers).join(' ');
  };

  // Add element and modifier methods to block function
  b.e = e;
  b.m = m;

  return { b, e, m };
}

// Simple utility for combining classes
export function cn(...classes: (string | undefined | null | boolean | Record<string, boolean>)[]): string {
  const result: string[] = [];
  
  for (const cls of classes) {
    if (!cls) continue;
    
    if (typeof cls === 'string') {
      result.push(cls);
    } else if (typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) {
          result.push(key);
        }
      }
    }
  }
  
  return result.join(' ');
}

export const metadata = {
  name: "utils",
  type: "registry:lib" as const,
  description: "BEM className utility with configuration support for Vue components",
  dependencies: [],
  files: [
    {
      path: "lib/utils.ts",
      type: "registry:lib" as const,
      target: "lib/utils.ts"
    }
  ]
};
```

### 5. Color Configuration System

The color system works in multiple levels:

#### Available Colors (`apps/v1/registry/config/colors.ts`)
```typescript
// Defines which color schemes users can choose from during init
export const availableColors = [
  { name: "slate", label: "Slate" },
  { name: "gray", label: "Gray" },
  { name: "zinc", label: "Zinc" },
  { name: "neutral", label: "Neutral" },
  { name: "stone", label: "Stone" }
];

// Full color palettes - these become available as CSS variables
export const colorValues = {
  slate: {
    "50": "#f8fafc",
    "100": "#f1f5f9", 
    "200": "#e2e8f0",
    "300": "#cbd5e1",
    "400": "#94a3b8",
    "500": "#64748b",
    "600": "#475569",
    "700": "#334155",
    "800": "#1e293b",
    "900": "#0f172a"
  },
  gray: {
    "50": "#f9fafb",
    "100": "#f3f4f6",
    "200": "#e5e7eb", 
    "300": "#d1d5db",
    "400": "#9ca3af",
    "500": "#6b7280",
    "600": "#4b5563",
    "700": "#374151",
    "800": "#1f2937",
    "900": "#111827"
  }
  // ... other colors
};
```

#### How Colors Work:
1. **CLI Selection**: User runs `meduza-ui init` and selects a base color (e.g. "slate")
2. **Variable Generation**: The selected color palette gets mapped to our semantic variables:
   ```scss
   // If user selects "slate"
   --primary-color: #334155;        // slate-700
   --secondary-color: #f1f5f9;      // slate-100
   --border-color: #e2e8f0;         // slate-200
   --muted-color: #f8fafc;          // slate-50
   ```
3. **Registry Endpoints**: 
   - `/r/colors/index.json` - Lists available color schemes
   - `/r/colors/slate.json` - Full slate color palette
   - `/r/colors/gray.json` - Full gray color palette
4. **Runtime Usage**: Components use semantic variables, not color names:
   ```scss
   .button {
     background-color: var(--primary-color);
     color: var(--primary-foreground-color);
   }
   ```

### 6. Components Configuration Template (`apps/v1/registry/templates/components.json`)
```json
{
  "$schema": "https://meduza-ui.com/schema/components.json",
  "style": "default",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "assets/styles/globals.scss",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "lib": "@/lib",
    "styles": "@/assets/styles"
  },
  "iconLibrary": "@iconify/vue"
}
```

### 7. Available Styles Configuration (`apps/v1/registry/config/styles.ts`)
```typescript
// apps/v1/registry/config/styles.ts
export const availableStyles = [
  {
    name: "default",
    label: "Default"
  },
  {
    name: "minimal", 
    label: "Minimal"
  }
];
```

### 8. Available Colors Configuration (`apps/v1/registry/config/colors.ts`)
```typescript
// apps/v1/registry/config/colors.ts
export const availableColors = [
  {
    name: "slate",
    label: "Slate"
  },
  {
    name: "gray", 
    label: "Gray"
  },
  {
    name: "zinc",
    label: "Zinc"
  },
  {
    name: "neutral",
    label: "Neutral"
  },
  {
    name: "stone",
    label: "Stone"
  }
];

export const colorValues = {
  slate: {
    "50": "#f8fafc",
    "100": "#f1f5f9", 
    "200": "#e2e8f0",
    "300": "#cbd5e1",
    "400": "#94a3b8",
    "500": "#64748b",
    "600": "#475569",
    "700": "#334155",
    "800": "#1e293b",
    "900": "#0f172a"
  },
  // Add other color definitions...
};
```

## Updated Build Script (Extending Spec 02)

**Note**: This enhances the build script from Spec 02, doesn't replace it entirely. We're adding functionality to handle the new source files.

### Enhanced Registry Builder (`apps/v1/scripts/build-registry.ts`)
```typescript
import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { glob } from 'glob';
import { availableStyles } from '../registry/config/styles';
import { availableColors, colorValues } from '../registry/config/colors';

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
    target: string;
  }>;
  cssVars?: Record<string, Record<string, string>>;
  scssVars?: Record<string, string>;
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
  
  // 4. Build registry components
  await buildRegistryComponents();
  
  console.log('✅ Registry built successfully!');
}

async function buildRegistryComponents() {
  const registryPath = join(process.cwd(), 'registry');
  
  // Find all metadata files
  const metadataFiles = await glob('**/lib/*.ts', { 
    cwd: registryPath,
    absolute: true 
  });
  
  for (const file of metadataFiles) {
    try {
      // Dynamic import the metadata
      const module = await import(file);
      const metadata = module.metadata;
      
      if (!metadata) continue;
      
      // Build the registry item
      const registryItem = await buildRegistryItem(metadata, file);
      
      // Write to output
      const outputPath = join(process.cwd(), 'public/r/styles/default', `${metadata.name}.json`);
      writeFileSync(outputPath, JSON.stringify(registryItem, null, 2));
      
      console.log(`📦 Built component: ${metadata.name}`);
    } catch (error) {
      console.error(`❌ Error building ${file}:`, error);
    }
  }
}

async function buildRegistryItem(metadata: any, metadataFile: string): Promise<RegistryItem> {
  const registryPath = dirname(metadataFile);
  const files = [];
  
  // Read all files defined in metadata
  for (const fileConfig of metadata.files || []) {
    let content: string;
    let sourcePath: string;
    
    if (fileConfig.path.endsWith('.scss')) {
      // Read SCSS files from styles directory
      sourcePath = join(process.cwd(), 'registry/styles', fileConfig.path.replace('assets/styles/', ''));
    } else {
      // Read TS files from the same directory as metadata
      sourcePath = join(registryPath, fileConfig.path.replace('lib/', ''));
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
      target: fileConfig.target
    });
  }
  
  return {
    $schema: "https://meduza-ui.com/schema/registry-item.json",
    ...metadata,
    files
  };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildRegistry().catch(console.error);
}
```

## Package.json Scripts Update

### Add Build Scripts (`apps/v1/package.json`)
```json
{
  "scripts": {
    "dev": "nuxt dev --port 3000",
    "build": "nuxt build",
    "preview": "nuxt preview", 
    "build:registry": "tsx scripts/build-registry.ts",
    "dev:registry": "tsx scripts/build-registry.ts --watch"
  },
  "dependencies": {
    "@nuxt/content": "^2.x",
    "@vueuse/core": "^10.x",
    "sass": "^1.x"
  },
  "devDependencies": {
    "@nuxt/devtools": "latest",
    "typescript": "^5.x",
    "tsx": "^4.x",
    "glob": "^10.x"
  }
}
```

## Testing Endpoints

After building the registry, these endpoints should be available:

- `http://localhost:3000/r/styles/index.json` - Available styles
- `http://localhost:3000/r/colors/index.json` - Available colors  
- `http://localhost:3000/r/styles/default/index.json` - Base style system
- `http://localhost:3000/r/styles/default/utils.json` - Utility functions
- `http://localhost:3000/r/colors/slate.json` - Slate color values

## Deliverables

1. **Base style system** with SCSS variables, mixins, and CSS custom properties
2. **useClassName utility** with BEM methodology for Vue components
3. **Configuration templates** for components.json and project setup
4. **Available options** for styles and colors
5. **Enhanced build script** that generates all required registry endpoints
6. **Working registry endpoints** that serve init requirements

## Testing

- [ ] Build script generates all required JSON files
- [ ] Registry endpoints are accessible at expected URLs
- [ ] Base style system includes all necessary SCSS variables and mixins
- [ ] useClassName utility functions correctly generate BEM classes
- [ ] CSS custom properties work for light/dark theming
- [ ] Configuration templates are valid JSON
- [ ] All init requirements are available from registry

## Next Steps

After this spec is complete:
1. Create first UI component with documentation (Spec 04)
2. Build CLI init and add commands that consume these endpoints (Spec 05)
