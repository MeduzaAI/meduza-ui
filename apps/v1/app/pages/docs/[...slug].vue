<script setup lang="ts">

definePageMeta({
  layout: 'docs'
})

const slug = useRoute().params.slug
const { data: page } = await useAsyncData(`docs-${slug}`, () => {
  return queryCollection('docs').path(`/docs/${slug}`).first()
})

</script>

<template>
  <ContentRenderer :value="page" v-if="page" />
</template>

<style lang="scss">
@use '@/assets/styles/mixins' as *;

h1 {
  @include text('display-bold');
  margin-bottom: var(--spacing-6);
  color: var(--foreground-color);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--border-color);
}

h2 {
  @include text('heading-semibold');
  margin: var(--spacing-10) 0 var(--spacing-4) 0;
  color: var(--foreground-color);

  &:first-child {
    margin-top: 0;
  }
}

h3 {
  @include text('subhead-semibold');
  margin: var(--spacing-8) 0 var(--spacing-3) 0;
  color: var(--foreground-color);
}

h4 {
  @include text('text-lg-semibold');
  margin: var(--spacing-6) 0 var(--spacing-2) 0;
  color: var(--foreground-color);
}

p {
  @include text('text-base-regular');
  color: var(--foreground-color);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--spacing-4);
}

ul, ol {
  margin-bottom: var(--spacing-4);
  padding-left: var(--spacing-6);

  li {
    @include text('text-base-regular');
    color: var(--foreground-color);
    margin-bottom: var(--spacing-2);
    line-height: var(--leading-relaxed);

    &::marker {
      color: var(--muted-foreground-color);
    }
  }
}

ul li {
  list-style-type: disc;
}

ol li {
  list-style-type: decimal;
}

strong {
  font-weight: var(--font-semibold);
  color: var(--foreground-color);
}

em {
  font-style: italic;
  color: var(--muted-foreground-color);
}

code:not(pre code) {
  @include text('text-sm-medium');
  background-color: var(--muted-color);
  color: var(--foreground-color);
  padding: var(--spacing-0-5) var(--spacing-1);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  border: 1px solid var(--border-color);
}

pre {
  background-color: var(--muted-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin: var(--spacing-4) 0;
  overflow-x: auto;

  code {
    @include text('text-sm-regular');
    background: none;
    padding: 0;
    border-radius: 0;
    border: none;
    font-family: var(--font-mono);
    color: var(--foreground-color);
  }
}

blockquote {
  border-left: 4px solid var(--border-color);
  padding-left: var(--spacing-4);
  margin: var(--spacing-4) 0;
  font-style: italic;
  color: var(--muted-foreground-color);
}

a {
  color: var(--primary-color);
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color var(--transition-fast);

  &:hover {
    text-decoration-color: var(--primary-color);
  }
}

hr {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: var(--spacing-8) 0;
}
</style>
