<script setup lang="ts">

import { useClassName} from "@/lib/utils";

const cn = useClassName('button')

console.log(cn)
</script>

<template>
  <div>
    <h1>Welcome to Meduza UI</h1>
    <p>A Vue.js component library with SCSS styling.</p>
  </div>
</template>
