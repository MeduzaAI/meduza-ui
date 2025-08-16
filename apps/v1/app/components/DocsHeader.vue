<script setup lang="ts">
import { useClassName } from '@/lib/utils'

const { b, e } = useClassName('docs-header')

defineEmits<{
  toggleSidebar: []
}>()
</script>

<template>
  <header :class="b()">
    <div :class="e('container')">
      <!-- Mobile menu button -->
      <button
        :class="e('menu-button')"
        @click="$emit('toggleSidebar')"
        aria-label="Toggle navigation sidebar"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <!-- Logo/Brand -->
      <NuxtLink to="/" :class="e('logo')">
        <span :class="e('logo-text')">Meduza UI</span>
      </NuxtLink>

      <!-- Desktop navigation -->
      <nav :class="e('nav')">
        <NuxtLink to="/docs" :class="e('nav-link')">
          Documentation
        </NuxtLink>
        <NuxtLink to="/docs/components" :class="e('nav-link')">
          Components
        </NuxtLink>
        <a
          href="https://github.com/your-org/meduza-ui"
          :class="e('nav-link')"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>

        <!-- Theme toggle -->
        <ThemeToggle />
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use 'assets/styles/mixins' as *;

.docs-header {
  height: 64px;
  background-color: var(--background-color);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  font-family: var(--font-body);

  &__container {
    height: 100%;
    max-width: 100%;
    padding: 0 var(--spacing-6);
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
  }

  &__menu-button {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--foreground-color);
    padding: var(--spacing-2);
    border-radius: var(--radius-md);
    transition: background-color var(--transition-fast);

    &:hover {
      background-color: var(--muted-color);
    }

    &:focus-visible {
      @include focus-ring;
    }

    @media (max-width: 768px) {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__logo {
    text-decoration: none;
    color: var(--foreground-color);
    transition: color var(--transition-fast);

    &:hover {
      color: var(--primary-color);
    }

    &:focus-visible {
      @include focus-ring;
    }
  }

  &__logo-text {
    @include text('text-lg-semibold');
    color: var(--foreground-color);
    font-weight: var(--font-bold);
    font-size: 18px;
  }

  &__nav {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--spacing-6);

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__nav-link {
    @include text('text-sm-medium');
    text-decoration: none;
    color: var(--muted-foreground-color);
    transition: color var(--transition-fast);
    padding: var(--spacing-1) var(--spacing-2);
    border-radius: var(--radius-md);

    &:hover {
      color: var(--foreground-color);
    }

    &:focus-visible {
      @include focus-ring;
    }

    &.router-link-active {
      color: var(--primary-color);
    }
  }
}
</style>
