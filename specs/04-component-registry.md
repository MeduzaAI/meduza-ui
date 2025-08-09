# Component Registry Specification

## Overview

Define the registry system for meduza-ui components, including schema, API, and component
organization for BEM-based Vue components with SCSS styling.

## Registry Schema

### Core Registry Item

```typescript
// registry/schema.ts
export enum ComponentType {
  UI = 'meduza:ui',
  BLOCK = 'meduza:block',
  LAYOUT = 'meduza:layout',
  UTILITY = 'meduza:utility',
  THEME = 'meduza:theme',
}

export enum FileType {
  VUE_COMPONENT = 'vue:component',
  VUE_COMPOSABLE = 'vue:composable',
  SCSS_STYLE = 'scss:style',
  SCSS_VARIABLES = 'scss:variables',
  SCSS_MIXINS = 'scss:mixins',
  TYPESCRIPT = 'ts:types',
  JAVASCRIPT = 'js:utils',
}

export interface RegistryFile {
  path: string;
  type: FileType;
  target?: string;
  content?: string;
}

export interface BemConfiguration {
  block: string; // e.g., 'button'
  elements?: string[]; // e.g., ['text', 'icon']
  modifiers?: string[]; // e.g., ['primary', 'disabled']
  prefix?: string; // Global BEM prefix
}

export interface ComponentProps {
  [key: string]: {
    type: string;
    required?: boolean;
    default?: any;
    description?: string;
    enum?: string[];
  };
}

export interface ComponentSlots {
  [key: string]: {
    description?: string;
    props?: ComponentProps;
  };
}

export interface ComponentEmits {
  [key: string]: {
    description?: string;
    payload?: ComponentProps;
  };
}

export interface RegistryComponent {
  name: string;
  type: ComponentType;
  title?: string;
  description?: string;
  category?: string;

  // Dependencies
  dependencies?: string[]; // NPM packages
  registryDependencies?: string[]; // Other registry components
  devDependencies?: string[]; // Development dependencies

  // Vue-specific
  vueVersion: '3'; // Only Vue 3 support
  compositionApi: true; // Only Composition API

  // Component interface
  props?: ComponentProps;
  slots?: ComponentSlots;
  emits?: ComponentEmits;

  // BEM configuration
  bem: BemConfiguration;

  // Files
  files: RegistryFile[];

  // Styling
  scssVariables?: Record<string, string>;
  scssFeatures?: string[]; // e.g., ['mixins', 'functions']

  // Metadata
  version: string;
  author?: string;
  tags?: string[];
  documentation?: string;
  examples?: string[];

  // Spacing configuration (4px based)
  spacing?: {
    padding?: Record<string, number>; // In pixels
    margin?: Record<string, number>; // In pixels
    gaps?: Record<string, number>; // In pixels
  };
}
```

### Registry Index

```typescript
// registry/index.ts
export interface Registry {
  name: 'meduza-ui';
  version: string;
  description: string;
  homepage: string;
  repository: string;
  components: RegistryComponent[];
  categories: ComponentCategory[];
  themes: RegistryTheme[];
}

export interface ComponentCategory {
  name: string;
  label: string;
  description: string;
  components: string[]; // Component names
}

export interface RegistryTheme {
  name: string;
  label: string;
  scssVariables: Record<string, string>;
  bemPrefix?: string;
}
```

## Component Categories

### UI Components (Basic Building Blocks)

```typescript
export const UI_COMPONENTS: ComponentCategory = {
  name: 'ui',
  label: 'UI Components',
  description: 'Basic building blocks for user interfaces',
  components: [
    'button',
    'input',
    'textarea',
    'select',
    'checkbox',
    'radio',
    'switch',
    'slider',
    'progress',
    'spinner',
    'avatar',
    'badge',
    'tag',
    'tooltip',
    'popover',
    'modal',
    'alert',
    'toast',
    'dropdown',
    'accordion',
    'tabs',
    'pagination',
    'breadcrumb',
    'stepper',
  ],
};
```

### Block Components (Complex Compositions)

```typescript
export const BLOCK_COMPONENTS: ComponentCategory = {
  name: 'blocks',
  label: 'Block Components',
  description: 'Complex component compositions for common UI patterns',
  components: [
    'header',
    'navigation',
    'sidebar',
    'footer',
    'hero-section',
    'feature-grid',
    'testimonial-card',
    'pricing-table',
    'contact-form',
    'search-bar',
    'data-table',
    'calendar',
    'dashboard-card',
    'statistics-panel',
  ],
};
```

### Layout Components

```typescript
export const LAYOUT_COMPONENTS: ComponentCategory = {
  name: 'layouts',
  label: 'Layout Components',
  description: 'Page and section layout components',
  components: [
    'container',
    'grid',
    'flex',
    'stack',
    'spacer',
    'divider',
    'card',
    'panel',
    'section',
  ],
};
```

## Example Component Registry Entry

### Button Component

```typescript
export const buttonComponent: RegistryComponent = {
  name: 'button',
  type: ComponentType.UI,
  title: 'Button',
  description: 'Interactive button component with multiple variants and states',
  category: 'ui',

  vueVersion: '3',
  compositionApi: true,

  props: {
    variant: {
      type: 'ButtonVariant',
      required: false,
      default: 'ButtonVariant.Primary',
      description: 'Visual style variant',
      enum: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      type: 'ButtonSize',
      required: false,
      default: 'ButtonSize.Medium',
      description: 'Size variant',
      enum: ['small', 'medium', 'large'],
    },
    disabled: {
      type: 'boolean',
      required: false,
      default: false,
      description: 'Disabled state',
    },
    loading: {
      type: 'boolean',
      required: false,
      default: false,
      description: 'Loading state with spinner',
    },
    icon: {
      type: 'string',
      required: false,
      description: 'Icon name to display',
    },
    iconPosition: {
      type: 'IconPosition',
      required: false,
      default: 'IconPosition.Left',
      description: 'Icon position',
      enum: ['left', 'right'],
    },
  },

  slots: {
    default: {
      description: 'Button content',
    },
    icon: {
      description: 'Custom icon slot',
      props: {
        position: { type: 'string' },
      },
    },
  },

  emits: {
    click: {
      description: 'Fired when button is clicked',
      payload: {
        event: { type: 'MouseEvent' },
      },
    },
  },

  bem: {
    block: 'button',
    elements: ['text', 'icon', 'spinner'],
    modifiers: [
      'primary',
      'secondary',
      'outline',
      'ghost',
      'danger',
      'small',
      'medium',
      'large',
      'disabled',
      'loading',
    ],
  },

  files: [
    {
      path: 'components/ui/Button.vue',
      type: FileType.VUE_COMPONENT,
      target: 'components/ui/Button.vue',
    },
    {
      path: 'types/Button.ts',
      type: FileType.TYPESCRIPT,
      target: 'types/Button.ts',
    },
    {
      path: 'styles/components/_button.scss',
      type: FileType.SCSS_STYLE,
      target: 'styles/components/_button.scss',
    },
  ],

  scssVariables: {
    '--button-padding-x': '16px',
    '--button-padding-y': '8px',
    '--button-border-radius': '4px',
    '--button-font-weight': '500',
    '--button-transition': 'all 150ms ease',
  },

  spacing: {
    padding: {
      small: 12, // 3 * 4px
      medium: 16, // 4 * 4px
      large: 20, // 5 * 4px
    },
    margin: {
      default: 8, // 2 * 4px
    },
  },

  version: '1.0.0',
  tags: ['interactive', 'form', 'action'],

  dependencies: [],
  registryDependencies: ['spinner'], // Uses spinner component for loading state

  examples: [
    'button-basic',
    'button-variants',
    'button-sizes',
    'button-with-icons',
    'button-loading-states',
  ],
};
```

## File Structure Examples

### Vue Component File

```vue
<!-- Button.vue -->
<template>
  <component
    :is="tag"
    :class="cn.b([variant, size, { disabled, loading }])"
    :disabled="disabled || loading"
    :type="type"
    v-bind="$attrs"
    @click="handleClick"
  >
    <span v-if="loading" :class="cn.e('spinner')">
      <Spinner :size="spinnerSize" />
    </span>

    <span v-if="icon && iconPosition === 'left' && !loading" :class="cn.e('icon').m('left')">
      <slot name="icon" :position="iconPosition">
        <Icon :name="icon" />
      </slot>
    </span>

    <span :class="cn.e('text')">
      <slot />
    </span>

    <span v-if="icon && iconPosition === 'right' && !loading" :class="cn.e('icon').m('right')">
      <slot name="icon" :position="iconPosition">
        <Icon :name="icon" />
      </slot>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useClassName } from '@/utils/useClassName';
import type { ButtonVariant, ButtonSize, IconPosition } from '@/types/Button';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: IconPosition;
  tag?: string;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: ButtonVariant.Primary,
  size: ButtonSize.Medium,
  iconPosition: IconPosition.Left,
  tag: 'button',
  type: 'button',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const cn = useClassName('button');

const spinnerSize = computed(() => {
  switch (props.size) {
    case ButtonSize.Small:
      return 'small';
    case ButtonSize.Large:
      return 'large';
    default:
      return 'medium';
  }
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>
```

### TypeScript Types File

```typescript
// types/Button.ts
export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Outline = 'outline',
  Ghost = 'ghost',
  Danger = 'danger',
}

export enum ButtonSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum IconPosition {
  Left = 'left',
  Right = 'right',
}

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: IconPosition;
  tag?: string;
  type?: 'button' | 'submit' | 'reset';
}
```

### SCSS Component File

```scss
// styles/components/_button.scss
@import '../mixins';
@import '../variables';

.button {
  @include reset-button;
  @include focus-ring;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px; // 2 * 4px

  font-family: var(--font-family);
  font-weight: var(--button-font-weight);
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;

  border: 1px solid transparent;
  border-radius: var(--button-border-radius);
  cursor: pointer;
  transition: var(--button-transition);

  // Size variants
  &--small {
    padding: 6px 12px; // 1.5 * 4px, 3 * 4px
    font-size: 14px;
    min-height: 32px; // 8 * 4px
  }

  &--medium {
    padding: 8px 16px; // 2 * 4px, 4 * 4px
    font-size: 16px;
    min-height: 40px; // 10 * 4px
  }

  &--large {
    padding: 12px 20px; // 3 * 4px, 5 * 4px
    font-size: 18px;
    min-height: 48px; // 12 * 4px
  }

  // Style variants
  &--primary {
    background-color: var(--color-primary);
    color: var(--color-primary-foreground);

    &:hover:not(&--disabled) {
      background-color: var(--color-primary-hover);
    }

    &:active:not(&--disabled) {
      background-color: var(--color-primary-active);
    }
  }

  &--secondary {
    background-color: var(--color-secondary);
    color: var(--color-secondary-foreground);

    &:hover:not(&--disabled) {
      background-color: var(--color-secondary-hover);
    }
  }

  &--outline {
    background-color: transparent;
    color: var(--color-primary);
    border-color: var(--color-primary);

    &:hover:not(&--disabled) {
      background-color: var(--color-primary);
      color: var(--color-primary-foreground);
    }
  }

  &--ghost {
    background-color: transparent;
    color: var(--color-foreground);

    &:hover:not(&--disabled) {
      background-color: var(--color-muted);
    }
  }

  &--danger {
    background-color: var(--color-danger);
    color: var(--color-danger-foreground);

    &:hover:not(&--disabled) {
      background-color: var(--color-danger-hover);
    }
  }

  // State modifiers
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &--loading {
    cursor: wait;

    .button__text {
      opacity: 0.7;
    }
  }

  // Elements
  &__text {
    display: inline-flex;
    align-items: center;
  }

  &__icon {
    display: inline-flex;
    align-items: center;

    &--left {
      order: -1;
    }

    &--right {
      order: 1;
    }
  }

  &__spinner {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
```

## Registry API

### API Endpoints

```typescript
// Registry API specification
interface RegistryAPI {
  // Get all components
  GET /api/components

  // Get specific component
  GET /api/components/:name

  // Get component dependencies
  GET /api/components/:name/dependencies

  // Get component examples
  GET /api/components/:name/examples

  // Get all categories
  GET /api/categories

  // Get components by category
  GET /api/categories/:category/components

  // Get all themes
  GET /api/themes

  // Search components
  GET /api/search?q=:query&category=:category&tags=:tags

  // Get registry metadata
  GET /api/meta
}
```

### API Response Examples

```typescript
// GET /api/components/button
{
  "name": "button",
  "type": "meduza:ui",
  "title": "Button",
  "description": "Interactive button component...",
  "props": { /* ... */ },
  "slots": { /* ... */ },
  "emits": { /* ... */ },
  "bem": { /* ... */ },
  "files": [
    {
      "path": "components/ui/Button.vue",
      "type": "vue:component",
      "target": "components/ui/Button.vue",
      "content": "<!-- Vue component content -->"
    }
  ],
  "dependencies": [],
  "registryDependencies": ["spinner"],
  "version": "1.0.0"
}

// GET /api/components/button/dependencies
{
  "direct": ["spinner"],
  "tree": {
    "button": {
      "dependencies": ["spinner"],
      "children": {
        "spinner": {
          "dependencies": [],
          "children": {}
        }
      }
    }
  }
}
```

## Registry Build Process

### Build Script

```typescript
// scripts/build-registry.ts
export async function buildRegistry() {
  // 1. Scan component directories
  const componentDirs = await scanComponentDirectories();

  // 2. Parse component metadata
  const components: RegistryComponent[] = [];
  for (const dir of componentDirs) {
    const component = await parseComponent(dir);
    components.push(component);
  }

  // 3. Resolve dependencies
  const resolvedComponents = await resolveDependencies(components);

  // 4. Generate registry JSON
  const registry: Registry = {
    name: 'meduza-ui',
    version: process.env.REGISTRY_VERSION || '1.0.0',
    description: 'MeduzaAI Vue component library',
    homepage: 'https://meduza-ui.dev',
    repository: 'https://github.com/meduzaai/meduza-ui',
    components: resolvedComponents,
    categories: buildCategories(resolvedComponents),
    themes: await buildThemes(),
  };

  // 5. Write registry files
  await writeRegistryFiles(registry);

  // 6. Generate TypeScript definitions
  await generateTypeDefinitions(registry);
}
```

## Validation and Testing

### Component Validation

```typescript
// validation/component-validator.ts
export async function validateComponent(component: RegistryComponent): Promise<ValidationResult> {
  const errors: string[] = [];

  // Validate BEM naming
  if (!isValidBemBlock(component.bem.block)) {
    errors.push(`Invalid BEM block name: ${component.bem.block}`);
  }

  // Validate file structure
  for (const file of component.files) {
    if (!(await fs.pathExists(file.path))) {
      errors.push(`File not found: ${file.path}`);
    }
  }

  // Validate props schema
  if (component.props) {
    const propsValidation = validateProps(component.props);
    errors.push(...propsValidation);
  }

  // Validate spacing values (must be multiples of 4)
  if (component.spacing) {
    const spacingValidation = validateSpacing(component.spacing);
    errors.push(...spacingValidation);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

This registry specification provides a comprehensive foundation for organizing and distributing Vue
components with BEM methodology, SCSS styling, and proper TypeScript typing.
