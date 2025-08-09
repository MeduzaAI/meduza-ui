# Vue Components Specification

## Overview

Detailed specification for Vue 3 components in meduza-ui, using Composition API, TypeScript
interfaces, enums, and BEM methodology with the `useClassName` utility.

## Component Development Standards

### Core Principles

1. **Vue 3 Composition API Only**: No Options API usage
2. **TypeScript Interfaces**: Use interfaces instead of types for props
3. **Enums for String Literals**: Use enums for variant/size/position properties
4. **BEM Naming**: Component class names follow BEM methodology
5. **Pixel Spacing**: All spacing in 4px increments using pixel values
6. **Accessibility First**: ARIA attributes, keyboard navigation, screen reader support

### File Structure

```
components/
├── ui/
│   ├── Button/
│   │   ├── Button.vue
│   │   ├── Button.types.ts
│   │   ├── Button.stories.ts      # Storybook stories
│   │   └── index.ts               # Export file
│   ├── Input/
│   │   ├── Input.vue
│   │   ├── Input.types.ts
│   │   └── index.ts
│   └── ...
├── blocks/
│   ├── Header/
│   │   ├── Header.vue
│   │   ├── Header.types.ts
│   │   └── index.ts
│   └── ...
└── layouts/
    ├── Container/
    │   ├── Container.vue
    │   ├── Container.types.ts
    │   └── index.ts
    └── ...
```

## Component Template Standards

### Basic Component Structure

```vue
<!-- Button.vue -->
<template>
  <component
    :is="tag"
    :class="cn.b([variant, size, { disabled, loading }])"
    :disabled="disabled || loading"
    :type="type"
    :aria-disabled="disabled || loading"
    :aria-label="ariaLabel"
    v-bind="$attrs"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Loading spinner -->
    <span v-if="loading" :class="cn.e('spinner')" aria-hidden="true">
      <Spinner :size="spinnerSize" />
    </span>

    <!-- Left icon -->
    <span
      v-if="icon && iconPosition === IconPosition.Left && !loading"
      :class="cn.e('icon').m('left')"
      aria-hidden="true"
    >
      <slot name="icon" :position="iconPosition">
        <Icon :name="icon" />
      </slot>
    </span>

    <!-- Button text content -->
    <span :class="cn.e('text')">
      <slot />
    </span>

    <!-- Right icon -->
    <span
      v-if="icon && iconPosition === IconPosition.Right && !loading"
      :class="cn.e('icon').m('right')"
      aria-hidden="true"
    >
      <slot name="icon" :position="iconPosition">
        <Icon :name="icon" />
      </slot>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useClassName } from '@/utils/useClassName';
import { Icon, Spinner } from '@/components/ui';
import type { ButtonProps } from './Button.types';
import { ButtonVariant, ButtonSize, IconPosition } from './Button.types';

interface Props extends ButtonProps {}

const props = withDefaults(defineProps<Props>(), {
  variant: ButtonVariant.Primary,
  size: ButtonSize.Medium,
  iconPosition: IconPosition.Left,
  tag: 'button',
  type: 'button',
});

interface Emits {
  click: [event: MouseEvent];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}

const emit = defineEmits<Emits>();

// BEM class name utility
const cn = useClassName('button');

// Computed properties
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

// Event handlers
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  // Handle Enter and Space for custom tags
  if (props.tag !== 'button' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    handleClick(event as unknown as MouseEvent);
  }
};

// Accessibility
defineExpose({
  focus: () => {
    // Expose focus method for parent components
  },
});
</script>
```

### TypeScript Interface Standards

```typescript
// Button.types.ts
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
  /**
   * Visual style variant of the button
   * @default ButtonVariant.Primary
   */
  variant?: ButtonVariant;

  /**
   * Size variant of the button
   * @default ButtonSize.Medium
   */
  size?: ButtonSize;

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the button is in loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Icon name to display
   */
  icon?: string;

  /**
   * Position of the icon relative to text
   * @default IconPosition.Left
   */
  iconPosition?: IconPosition;

  /**
   * HTML tag or Vue component to render
   * @default 'button'
   */
  tag?: string;

  /**
   * Button type attribute (for button tag)
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Accessible label for screen readers
   */
  ariaLabel?: string;
}

export interface ButtonSlots {
  /**
   * Default slot for button content
   */
  default(): any;

  /**
   * Icon slot for custom icon rendering
   */
  icon(props: { position: IconPosition }): any;
}

export interface ButtonEmits {
  /**
   * Emitted when button is clicked
   */
  click: [event: MouseEvent];

  /**
   * Emitted when button receives focus
   */
  focus: [event: FocusEvent];

  /**
   * Emitted when button loses focus
   */
  blur: [event: FocusEvent];
}
```

## Complex Component Examples

### Input Component

```vue
<!-- Input.vue -->
<template>
  <div :class="cn.b({ disabled, error: !!error })">
    <!-- Label -->
    <label v-if="label" :for="inputId" :class="cn.e('label').m({ required })">
      {{ label }}
      <span v-if="required" :class="cn.e('required')" aria-label="required"> * </span>
    </label>

    <!-- Input wrapper -->
    <div :class="cn.e('wrapper').m([size, { 'has-prefix': hasPrefix, 'has-suffix': hasSuffix }])">
      <!-- Prefix slot -->
      <div v-if="hasPrefix" :class="cn.e('prefix')">
        <slot name="prefix" />
      </div>

      <!-- Input element -->
      <input
        :id="inputId"
        ref="inputRef"
        :class="cn.e('control')"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        v-bind="$attrs"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Suffix slot -->
      <div v-if="hasSuffix" :class="cn.e('suffix')">
        <slot name="suffix" />
      </div>
    </div>

    <!-- Helper text -->
    <div v-if="helperText || error" :class="cn.e('helper').m({ error: !!error })">
      <span v-if="error" :id="`${inputId}-error`" :class="cn.e('error')" role="alert">
        {{ error }}
      </span>
      <span v-else-if="helperText" :class="cn.e('helper-text')">
        {{ helperText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import { useClassName } from '@/utils/useClassName';
import { generateId } from '@/utils/generateId';
import type { InputProps } from './Input.types';
import { InputSize, InputType } from './Input.types';

interface Props extends InputProps {}

const props = withDefaults(defineProps<Props>(), {
  size: InputSize.Medium,
  type: InputType.Text,
});

interface Emits {
  'update:modelValue': [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  input: [event: Event];
}

const emit = defineEmits<Emits>();

// Refs
const inputRef = ref<HTMLInputElement>();
const slots = useSlots();

// Utilities
const cn = useClassName('input');
const inputId = generateId('input');

// Computed
const hasPrefix = computed(() => !!slots.prefix);
const hasSuffix = computed(() => !!slots.suffix);

// Event handlers
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
  emit('input', event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

// Expose methods
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
});
</script>
```

### Modal Component (Complex Composition)

```vue
<!-- Modal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal" @enter="onEnter" @leave="onLeave">
      <div
        v-if="modelValue"
        :class="cn.b({ fullscreen })"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        @click="handleBackdropClick"
        @keydown.esc="handleEscape"
      >
        <!-- Backdrop -->
        <div :class="cn.e('backdrop')" />

        <!-- Modal container -->
        <div :class="cn.e('container').m([size, { scrollable }])" @click.stop>
          <!-- Header -->
          <header v-if="hasHeader" :class="cn.e('header')">
            <h2 v-if="title" :id="titleId" :class="cn.e('title')">
              {{ title }}
            </h2>

            <slot name="header" />

            <button
              v-if="closable"
              :class="cn.e('close')"
              type="button"
              :aria-label="closeAriaLabel"
              @click="handleClose"
            >
              <Icon name="x" />
            </button>
          </header>

          <!-- Body -->
          <div :id="descriptionId" :class="cn.e('body')">
            <slot />
          </div>

          <!-- Footer -->
          <footer v-if="hasFooter" :class="cn.e('footer')">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, useSlots, watch } from 'vue';
import { useClassName } from '@/utils/useClassName';
import { generateId } from '@/utils/generateId';
import { useFocusTrap } from '@/composables/useFocusTrap';
import { useBodyScroll } from '@/composables/useBodyScroll';
import { Icon } from '@/components/ui';
import type { ModalProps } from './Modal.types';
import { ModalSize } from './Modal.types';

interface Props extends ModalProps {}

const props = withDefaults(defineProps<Props>(), {
  size: ModalSize.Medium,
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  closeAriaLabel: 'Close modal',
});

interface Emits {
  'update:modelValue': [value: boolean];
  open: [];
  close: [];
  beforeOpen: [];
  beforeClose: [];
}

const emit = defineEmits<Emits>();

// Utilities
const slots = useSlots();
const cn = useClassName('modal');
const titleId = generateId('modal-title');
const descriptionId = generateId('modal-description');

// Composables
const { enableFocusTrap, disableFocusTrap } = useFocusTrap();
const { lockScroll, unlockScroll } = useBodyScroll();

// Computed
const hasHeader = computed(() => props.title || slots.header);
const hasFooter = computed(() => !!slots.footer);

// Watchers
watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) {
      handleOpen();
    } else {
      handleClose();
    }
  }
);

// Event handlers
const handleOpen = async () => {
  emit('beforeOpen');
  await nextTick();
  lockScroll();
  enableFocusTrap();
  emit('open');
};

const handleClose = () => {
  emit('beforeClose');
  disableFocusTrap();
  unlockScroll();
  emit('update:modelValue', false);
  emit('close');
};

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleClose();
  }
};

const handleEscape = () => {
  if (props.closeOnEscape) {
    handleClose();
  }
};

// Transition handlers
const onEnter = () => {
  // Animation enter logic
};

const onLeave = () => {
  // Animation leave logic
};

// Cleanup
onUnmounted(() => {
  if (props.modelValue) {
    disableFocusTrap();
    unlockScroll();
  }
});
</script>
```

## Component Composables

### useFocusTrap Composable

```typescript
// composables/useFocusTrap.ts
import { ref, nextTick } from 'vue';

interface FocusTrapOptions {
  initialFocus?: string | HTMLElement;
  fallbackFocus?: string | HTMLElement;
}

export function useFocusTrap(options: FocusTrapOptions = {}) {
  const isActive = ref(false);
  let previousActiveElement: HTMLElement | null = null;
  let focusableElements: HTMLElement[] = [];

  const getFocusableElements = (container: HTMLElement = document.body): HTMLElement[] => {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll(selector));
  };

  const enableFocusTrap = async (container?: HTMLElement) => {
    if (isActive.value) return;

    previousActiveElement = document.activeElement as HTMLElement;
    await nextTick();

    const trapContainer = container || document.body;
    focusableElements = getFocusableElements(trapContainer);

    if (focusableElements.length === 0) return;

    isActive.value = true;

    // Focus initial element
    const initialElement = options.initialFocus
      ? typeof options.initialFocus === 'string'
        ? (document.querySelector(options.initialFocus) as HTMLElement)
        : options.initialFocus
      : focusableElements[0];

    initialElement?.focus();

    document.addEventListener('keydown', handleKeydown);
  };

  const disableFocusTrap = () => {
    if (!isActive.value) return;

    isActive.value = false;
    document.removeEventListener('keydown', handleKeydown);

    // Restore focus
    if (previousActiveElement) {
      previousActiveElement.focus();
      previousActiveElement = null;
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (!isActive.value || event.key !== 'Tab') return;

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  return {
    isActive: readonly(isActive),
    enableFocusTrap,
    disableFocusTrap,
  };
}
```

## Component Testing Standards

### Unit Test Example

```typescript
// Button.test.ts
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from './Button.vue';
import { ButtonVariant, ButtonSize } from './Button.types';

describe('Button', () => {
  it('renders with default props', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me',
      },
    });

    expect(wrapper.classes()).toContain('button');
    expect(wrapper.classes()).toContain('button--primary');
    expect(wrapper.classes()).toContain('button--medium');
    expect(wrapper.text()).toBe('Click me');
  });

  it('applies variant class correctly', () => {
    const wrapper = mount(Button, {
      props: {
        variant: ButtonVariant.Secondary,
      },
    });

    expect(wrapper.classes()).toContain('button--secondary');
    expect(wrapper.classes()).not.toContain('button--primary');
  });

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button);

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true,
      },
    });

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('shows spinner when loading', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true,
      },
    });

    expect(wrapper.find('.button__spinner').exists()).toBe(true);
    expect(wrapper.classes()).toContain('button--loading');
  });

  it('supports custom tag', () => {
    const wrapper = mount(Button, {
      props: {
        tag: 'a',
      },
    });

    expect(wrapper.element.tagName).toBe('A');
  });
});
```

## Accessibility Standards

### ARIA Implementation

1. **Semantic HTML**: Use appropriate HTML elements
2. **ARIA Labels**: Provide descriptive labels for screen readers
3. **ARIA States**: Communicate component states (disabled, loading, etc.)
4. **Focus Management**: Proper focus order and visibility
5. **Keyboard Navigation**: Support for all keyboard interactions
6. **Color Contrast**: Meet WCAG AA contrast requirements

### Accessibility Checklist

- [ ] Semantic HTML elements used where appropriate
- [ ] ARIA labels provided for complex interactions
- [ ] Focus indicators visible and accessible
- [ ] Keyboard navigation implemented
- [ ] Screen reader announcements for state changes
- [ ] Color contrast meets WCAG AA standards
- [ ] Component works without JavaScript
- [ ] Error states communicated to assistive technologies

This specification ensures all Vue components follow consistent patterns, maintain high
accessibility standards, and integrate seamlessly with the BEM naming system and SCSS architecture.
