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

## Framework Support

Meduza UI supports the following Vue.js frameworks:

- **Vue 3** with Vite
- **Nuxt 3** 
- **Vue CLI** projects

The CLI automatically detects your project type and configures paths appropriately.

## Project Structure

The CLI expects and creates the following structure:

```
your-project/
├── src/                    # or root for Nuxt
│   ├── components/
│   │   └── ui/            # UI components go here
│   ├── lib/
│   │   └── utils.ts       # Utility functions
│   └── assets/
│       └── styles/
│           ├── _variables.scss
│           └── _mixins.scss
└── meduza.config.json     # Configuration file
```

## Commands

### `init`

Initialize your project with Meduza UI configuration and base components.

```bash
npx meduza-ui init
```

Options:
- `--yes, -y` - Skip prompts and use defaults
- `--force` - Overwrite existing files
- `--cwd <path>` - Set working directory

### `add`

Add components to your project.

```bash
npx meduza-ui add <component>
npx meduza-ui add <component> <component> ...
```

Options:
- `--yes, -y` - Skip prompts and use defaults
- `--force` - Overwrite existing files
- `--cwd <path>` - Set working directory

## SCSS Integration

Meduza UI uses SCSS for styling with a design system based on:

- **CSS Custom Properties** for theming
- **SCSS Variables** for design tokens
- **Mixins** for reusable styles
- **BEM Methodology** for class naming

### Example Component

```vue
<template>
  <button :class="buttonClasses">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useClassName } from '@/lib/utils'

interface Props {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md'
})

const cn = useClassName('button')
const buttonClasses = cn.b([props.variant, props.size])
</script>

<style lang="scss" scoped>
@import '@/assets/styles/mixins';

.button {
  @include text('text-sm-medium');
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: var(--transition-base);
  
  &--primary {
    background-color: var(--primary-color);
    color: var(--primary-foreground-color);
  }
  
  &--secondary {
    background-color: var(--secondary-color);
    color: var(--secondary-foreground-color);
  }
  
  &--sm {
    padding: var(--spacing-2) var(--spacing-3);
  }
  
  &--md {
    padding: var(--spacing-3) var(--spacing-4);
  }
  
  &--lg {
    padding: var(--spacing-4) var(--spacing-6);
  }
}
</style>
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

# Type checking
pnpm typecheck
```

## License

MIT
