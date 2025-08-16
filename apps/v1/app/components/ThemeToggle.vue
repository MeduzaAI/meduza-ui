<script setup lang="ts">
import { useClassName } from '@/lib/utils'

const { b, e } = useClassName('theme-toggle')
const { theme, toggleTheme } = useTheme()
</script>

<template>
  <button
    :class="b()"
    @click="toggleTheme"
    :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`"
    :title="`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`"
  >
    <!-- Sun icon for light mode -->
    <svg
      v-if="theme === 'light'"
      :class="e('icon')"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>

    <!-- Moon icon for dark mode -->
    <svg
      v-else
      :class="e('icon')"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  </button>
</template>

<style scoped lang="scss">
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: var(--radius-md);
  color: var(--muted-foreground-color);
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--muted-color);
    color: var(--foreground-color);
  }

  &:focus-visible {
    outline: 2px solid var(--ring-color);
    outline-offset: 2px;
  }

  &__icon {
    transition: transform var(--transition-fast);
  }

  &:hover &__icon {
    transform: scale(1.1);
  }
}
</style>
