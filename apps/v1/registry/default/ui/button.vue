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
