<script setup lang="ts">
import { useClassName } from "@/lib/utils";

const cn = useClassName('layout-default')
</script>

<template>
  <div :class="cn.b()">
    <DocsHeader />

    <main :class="cn.e('main')">
      <slot />
    </main>
  </div>
</template>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
}

.layout-default {
  font-family: var(--font-body);
  min-height: 100vh;
}
</style>
