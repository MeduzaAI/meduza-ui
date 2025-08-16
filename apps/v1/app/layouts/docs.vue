<script setup lang="ts">
import { ref } from 'vue'
import { useClassName } from '@/lib/utils'

const { b, e } = useClassName('docs-layout')

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// Close sidebar when clicking outside on mobile
const handleBackdropClick = () => {
  if (sidebarOpen.value) {
    closeSidebar()
  }
}
</script>

<template>
  <div :class="b()">
    <NuxtLayout name="default">

    <div :class="e('container')">
      <!-- Mobile backdrop -->
      <div
        v-if="sidebarOpen"
        :class="e('backdrop')"
        @click="handleBackdropClick"
      />

      <DocsNavigation
        :class="[
          e('sidebar'),
          { [`${e('sidebar')}--open`]: sidebarOpen }
        ]"
      />

      <!-- Main content area -->
      <main :class="e('main')">
        <div :class="e('content')">
          <slot />
        </div>
      </main>
    </div>
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
@use '@/assets/styles/mixins' as *;

.docs-layout {
  min-height: 100vh;
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;

  &__header {
    flex-shrink: 0;
  }

  &__container {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  &__backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: calc(var(--z-modal) - 1);

    @media (min-width: 769px) {
      display: none;
    }
  }

  &__sidebar {
    flex-shrink: 0;

    @media (max-width: 768px) {
      position: fixed;
      top: 64px; // Header height
      left: 0;
      height: calc(100vh - 64px);
      z-index: var(--z-modal);
      transform: translateX(-100%);
      transition: transform var(--transition-base);

      &--open {
        transform: translateX(0);
      }
    }
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; // Prevents flex item from overflowing
    overflow: hidden;
  }

  &__content {
    flex: 1;
    padding: var(--spacing-10) var(--spacing-8);
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    overflow-y: auto;

    @media (max-width: 768px) {
      padding: var(--spacing-6) var(--spacing-4);
      max-width: 100%;
    }

    @media (max-width: 480px) {
      padding: var(--spacing-4) var(--spacing-3);
    }
  }
}
</style>
