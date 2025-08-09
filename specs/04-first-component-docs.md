# 04 - First Component

## Overview
Create the first UI component (Button) and deploy the registry app. This establishes the component pattern and validates the entire system works end-to-end.

## Goals
- Create a production-ready Button component using our design system
- Test the build system generates correct registry JSON
- Deploy the registry app to serve components
- Validate all registry endpoints work correctly
- Establish Vue component patterns for the library

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
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: var(--radius-md);
  transition: var(--transition-base);
  cursor: pointer;
  border: 1px solid transparent;
  
  @include text('text-sm-medium');
  @include focus-ring;
  
  // Variants
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
      background-color: var(--secondary-color);
      opacity: 0.8;
    }
  }
  
  &--outline {
    border-color: var(--border-color);
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
    padding: 0 var(--spacing-3);
    @include text('text-sm-medium');
  }
  
  &--md {
    height: 40px;
    padding: 0 var(--spacing-4);
    @include text('text-sm-medium');
  }
  
  &--lg {
    height: 44px;
    padding: 0 var(--spacing-6);
    @include text('text-base-medium');
  }
  
  // States
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

### Vercel Deployment (`apps/v1/vercel.json`)
```json
{
  "buildCommand": "npm run deploy",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nuxtjs",
  "rewrites": [
    {
      "source": "/r/(.*)",
      "destination": "/r/$1"
    }
  ]
}
```

## Testing Registry Endpoints

After deployment, these endpoints should work:

### Core Registry Endpoints
- `https://your-domain.com/r/styles/index.json`
- `https://your-domain.com/r/colors/index.json`
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

1. **Production-ready Button component** with full variant and size support
2. **Registry metadata structure** following shadcn patterns
3. **Enhanced build system** that processes registry items
4. **Working component registry** serving button component JSON
5. **Deployed registry app** with functional endpoints
6. **Established component patterns** for future components

## Testing

- [ ] Button component renders correctly in all variants and sizes
- [ ] Build script generates valid button.json file from registry metadata
- [ ] Registry endpoint `/r/styles/default/button.json` returns correct data
- [ ] Button component follows BEM naming with root `.button` class
- [ ] All accessibility features work correctly (focus rings, keyboard navigation)
- [ ] Enums work properly for type safety
- [ ] SCSS styles compile correctly with design system variables
- [ ] Registry app deploys successfully
- [ ] Registry structure follows shadcn patterns

