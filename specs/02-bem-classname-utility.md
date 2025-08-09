# BEM ClassName Utility Specification

## Overview

Design and implement the `useClassName` utility function that generates BEM-style class names for
Vue components, providing a consistent and maintainable approach to CSS class management.

## Core Concept

The `useClassName` utility follows BEM (Block-Element-Modifier) methodology:

- **Block**: Independent component (e.g., `button`)
- **Element**: Part of a block (e.g., `button__text`)
- **Modifier**: Variation of block/element (e.g., `button--primary`, `button__text--bold`)

## API Design

### Basic Usage

```typescript
// In a Vue component
import { useClassName } from '@/utils/useClassName';

const cn = useClassName('button');

// Generate classes
cn.b(); // 'button'
cn.e('text'); // 'button__text'
cn.m('primary'); // 'button--primary'
cn.e('text').m('bold'); // 'button__text--bold'
```

### Advanced Usage

```typescript
// With conditional modifiers
cn.b(['primary', { active: isActive, disabled: isDisabled }]);
// Result: 'button button--primary button--active' (if isActive is true)

// With custom prefix (from config)
const cn = useClassName('button', { prefix: 'ui' });
cn.b(); // 'ui-button'

// Multiple elements and modifiers
cn.e('icon').m(['small', { visible: showIcon }]);
// Result: 'button__icon button__icon--small button__icon--visible'
```

## Implementation Specification

### Interface Definitions

```typescript
// types/bem.ts
export interface BemModifiers {
  [key: string]: boolean | undefined;
}

export interface BemClassNameOptions {
  prefix?: string;
  separator?: {
    element?: string;
    modifier?: string;
  };
}

export interface BemElement {
  m(modifiers: string | string[] | BemModifiers): string;
}

export interface BemBlock {
  (): string;
  (modifiers: string | string[] | BemModifiers): string;
  e(element: string): BemElement & {
    m(modifiers: string | string[] | BemModifiers): string;
  };
  m(modifiers: string | string[] | BemModifiers): string;
}

export interface UseClassNameReturn {
  b: BemBlock;
  e: (element: string) => BemElement;
  m: (modifiers: string | string[] | BemModifiers) => string;
}
```

### Core Implementation

```typescript
// utils/useClassName.ts
import { inject, computed } from 'vue';
import type { BemModifiers, BemClassNameOptions, UseClassNameReturn } from '@/types/bem';

const BEM_CONFIG_KEY = Symbol('bem-config');

export function useClassName(block: string, options?: BemClassNameOptions): UseClassNameReturn {
  // Get config from provide/inject or use defaults
  const globalConfig = inject(BEM_CONFIG_KEY, {});
  const config = {
    prefix: '',
    separator: {
      element: '__',
      modifier: '--',
    },
    ...globalConfig,
    ...options,
  };

  const getBlockName = () => {
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

  const b: BemBlock = (modifiers?: string | string[] | BemModifiers) => {
    const blockName = getBlockName();

    if (!modifiers) {
      return blockName;
    }

    return generateModifiers(blockName, modifiers).join(' ');
  };

  const e = (element: string) => {
    const elementName = `${getBlockName()}${config.separator.element}${element}`;

    const elementObj = {
      m: (modifiers: string | string[] | BemModifiers) => {
        return generateModifiers(elementName, modifiers).join(' ');
      },
    };

    return elementObj;
  };

  const m = (modifiers: string | string[] | BemModifiers) => {
    return generateModifiers(getBlockName(), modifiers).join(' ');
  };

  // Add element method to block function
  b.e = e;
  b.m = m;

  return { b, e, m };
}

// Provider for global configuration
export function provideBemConfig(config: BemClassNameOptions) {
  provide(BEM_CONFIG_KEY, config);
}
```

## Usage Examples

### Simple Button Component

```vue
<template>
  <button :class="cn.b([variant, { disabled, loading }])">
    <span v-if="loading" :class="cn.e('spinner')" />
    <span :class="cn.e('text')">
      <slot />
    </span>
    <span v-if="icon" :class="cn.e('icon').m({ right: iconPosition === 'right' })">
      <Icon :name="icon" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { useClassName } from '@/utils/useClassName';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  iconPosition: 'left',
});

const cn = useClassName('button');

// Generated classes would be:
// button button--primary button--loading (if loading)
// button__text
// button__icon button__icon--right (if iconPosition is 'right')
</script>
```

### Complex Card Component

```vue
<template>
  <article :class="cn.b([size, { elevated, interactive }])">
    <header v-if="$slots.header" :class="cn.e('header')">
      <slot name="header" />
    </header>

    <div :class="cn.e('content')">
      <slot />
    </div>

    <footer v-if="$slots.footer" :class="cn.e('footer').m({ sticky: stickyFooter })">
      <slot name="footer" />
    </footer>
  </article>
</template>

<script setup lang="ts">
import { useClassName } from '@/utils/useClassName';

interface CardProps {
  size?: 'small' | 'medium' | 'large';
  elevated?: boolean;
  interactive?: boolean;
  stickyFooter?: boolean;
}

const props = withDefaults(defineProps<CardProps>(), {
  size: 'medium',
});

const cn = useClassName('card');
</script>
```

## Configuration Integration

### Global Configuration (App Level)

```typescript
// main.ts
import { createApp } from 'vue';
import { provideBemConfig } from '@/utils/useClassName';
import App from './App.vue';

const app = createApp(App);

// Configure BEM globally
app.use({
  install(app) {
    app.provide(BEM_CONFIG_KEY, {
      prefix: '', // All classes will start with 'mz-'
      separator: {
        element: '__',
        modifier: '--',
      },
    });
  },
});
```

### Project Configuration

```json
// meduza.config.json
{
  "bemPrefix": "ui",
  "bemSeparators": {
    "element": "__",
    "modifier": "--"
  }
}
```

## SCSS Integration

### Generated Class Structure

```scss
// Generated for button component
.button {
  // Block styles

  &--primary {
    // Primary modifier
  }

  &--secondary {
    // Secondary modifier
  }

  &--disabled {
    // Disabled modifier
  }

  &__text {
    // Text element

    &--bold {
      // Bold text modifier
    }
  }

  &__icon {
    // Icon element

    &--right {
      // Right positioned icon
    }
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// tests/utils/useClassName.test.ts
import { describe, it, expect } from 'vitest';
import { useClassName } from '@/utils/useClassName';

describe('useClassName', () => {
  it('generates basic block class', () => {
    const cn = useClassName('button');
    expect(cn.b()).toBe('button');
  });

  it('generates element classes', () => {
    const cn = useClassName('button');
    expect(cn.e('text')).toBe('button__text');
  });

  it('generates modifier classes', () => {
    const cn = useClassName('button');
    expect(cn.m('primary')).toBe('button button--primary');
  });

  it('handles conditional modifiers', () => {
    const cn = useClassName('button');
    expect(cn.b({ primary: true, disabled: false })).toBe('button button--primary');
  });

  it('supports custom prefix', () => {
    const cn = useClassName('button', { prefix: 'ui' });
    expect(cn.b()).toBe('ui-button');
  });
});
```

## Performance Considerations

- Memoize generated class strings
- Minimize object creation in hot paths
- Use computed properties for reactive class generation
- Efficient string concatenation

## Migration Guide

### From Traditional CSS Classes

```vue
<!-- Before -->
<template>
  <button :class="['btn', `btn-${variant}`, { 'btn-disabled': disabled }]">
    <span class="btn-text">{{ text }}</span>
  </button>
</template>

<!-- After -->
<template>
  <button :class="cn.b([variant, { disabled }])">
    <span :class="cn.e('text')">{{ text }}</span>
  </button>
</template>
```

## Error Handling

- Validate block names (no special characters)
- Warn about invalid modifier values
- Provide helpful error messages
- TypeScript integration for compile-time checks
