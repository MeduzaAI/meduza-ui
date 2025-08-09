<template>
  <div class="app">
    <header class="header">
      <h1>Meduza UI</h1>
    </header>
    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
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
