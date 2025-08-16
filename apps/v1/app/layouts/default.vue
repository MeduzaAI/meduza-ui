<script setup lang="ts">
import { Index } from "@@/registry/__index__"

const Button = Index.button.component
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Meduza UI</h1>
    </header>
    <main class="main">
      <slot />

      <component :is="Button">Test Button</component>
    </main>
  </div>
</template>

<style lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.main {
  flex: 1;
  padding: 1rem;
}
</style>
