# 05 - Documentation & Markdown Support

## Overview
Build a comprehensive documentation system with Markdown support, component demos, and a beautiful UI. This creates the foundation for documenting all components with examples, API references, and usage guides.

## Goals
- Create documentation site architecture with layout components
- Set up Markdown processing for component documentation
- Build component demo system with live previews
- Design documentation navigation and structure
- Implement responsive documentation layout
- Create Button component documentation as the first example

## Documentation Architecture

### 1. Base Layout Components

#### Main Layout (`apps/v1/layouts/docs.vue`)
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useClassName } from '@/lib/utils'

const { b, e } = useClassName('docs-layout')

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div :class="b()">
    <DocsHeader 
      :class="e('header')"
      @toggle-sidebar="toggleSidebar"
    />
    
    <div :class="e('container')">
      <DocsSidebar 
        :class="[e('sidebar'), { [e('sidebar').m(['open'])]: sidebarOpen }]"
        @close="sidebarOpen = false"
      />
      
      <main :class="e('main')">
        <div :class="e('content')">
          <slot />
        </div>
        
        <DocsFooter :class="e('footer')" />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.docs-layout {
  min-height: 100vh;
  background-color: var(--background-color);
  
  &__header {
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
    border-bottom: 1px solid var(--border-color);
    background-color: var(--background-color);
  }
  
  &__container {
    display: flex;
    max-width: 1400px;
    margin: 0 auto;
    min-height: calc(100vh - 64px); // header height
  }
  
  &__sidebar {
    width: 280px;
    background-color: var(--background-color);
    border-right: 1px solid var(--border-color);
    overflow-y: auto;
    
    @media (max-width: 768px) {
      position: fixed;
      top: 64px; // header height
      left: 0;
      bottom: 0;
      z-index: var(--z-modal);
      transform: translateX(-100%);
      transition: transform var(--transition-base);
      box-shadow: var(--shadow-lg);
      
      &--open {
        transform: translateX(0);
      }
    }
  }
  
  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  &__content {
    flex: 1;
    padding: var(--spacing-8);
    max-width: 900px;
    
    @media (max-width: 768px) {
      padding: var(--spacing-4);
    }
  }
  
  &__footer {
    border-top: 1px solid var(--border-color);
    padding: var(--spacing-6) var(--spacing-8);
    
    @media (max-width: 768px) {
      padding: var(--spacing-4);
    }
  }
}
</style>
```

#### Documentation Header (`apps/v1/components/docs/DocsHeader.vue`)
```vue
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
      <button 
        :class="e('menu-button')"
        @click="$emit('toggleSidebar')"
        aria-label="Toggle sidebar"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      <NuxtLink to="/" :class="e('logo')">
        <h1>Meduza UI</h1>
      </NuxtLink>
      
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
      </nav>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.docs-header {
  height: 64px;
  
  &__container {
    height: 100%;
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
    
    &:hover {
      background-color: var(--muted-color);
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
    
    h1 {
      @include text('text-lg-semibold');
      margin: 0;
    }
  }
  
  &__nav {
    margin-left: auto;
    display: flex;
    gap: var(--spacing-6);
    
    @media (max-width: 768px) {
      display: none;
    }
  }
  
  &__nav-link {
    @include text('text-sm-medium');
    text-decoration: none;
    color: var(--muted-foreground-color);
    transition: var(--transition-fast);
    
    &:hover {
      color: var(--foreground-color);
    }
    
    &.router-link-active {
      color: var(--primary-color);
    }
  }
}
</style>
```

#### Documentation Sidebar (`apps/v1/components/docs/DocsSidebar.vue`)
```vue
<script setup lang="ts">
import { useClassName } from '@/lib/utils'

const { b, e } = useClassName('docs-sidebar')

defineEmits<{
  close: []
}>()

const navigation = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Quick Start', href: '/docs/quick-start' },
    ]
  },
  {
    title: 'Components',
    items: [
      { title: 'Overview', href: '/docs/components' },
      { title: 'Button', href: '/docs/components/button' },
    ]
  }
]
</script>

<template>
  <aside :class="b()">
    <div :class="e('content')">
      <nav :class="e('nav')">
        <div 
          v-for="section in navigation" 
          :key="section.title"
          :class="e('section')"
        >
          <h3 :class="e('section-title')">
            {{ section.title }}
          </h3>
          
          <ul :class="e('section-list')">
            <li 
              v-for="item in section.items"
              :key="item.href"
            >
              <NuxtLink 
                :to="item.href"
                :class="e('link')"
                @click="$emit('close')"
              >
                {{ item.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.docs-sidebar {
  height: 100%;
  
  &__content {
    padding: var(--spacing-6) 0;
    height: 100%;
    overflow-y: auto;
  }
  
  &__nav {
    padding: 0 var(--spacing-6);
  }
  
  &__section {
    margin-bottom: var(--spacing-6);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  &__section-title {
    @include text('text-sm-semibold');
    color: var(--foreground-color);
    margin: 0 0 var(--spacing-3) 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  &__section-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  &__link {
    @include text('text-sm-regular');
    display: block;
    padding: var(--spacing-1) var(--spacing-3);
    color: var(--muted-foreground-color);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: var(--transition-fast);
    
    &:hover {
      color: var(--foreground-color);
      background-color: var(--muted-color);
    }
    
    &.router-link-active {
      color: var(--primary-color);
      background-color: var(--accent-color);
    }
  }
}
</style>
```

### 2. Component Demo System

#### Component Demo Container (`apps/v1/components/docs/ComponentDemo.vue`)
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useClassName } from '@/lib/utils'

interface ComponentDemoProps {
  title?: string
  description?: string
  code?: string
  showCode?: boolean
}

const props = withDefaults(defineProps<ComponentDemoProps>(), {
  showCode: false
})

const { b, e } = useClassName('component-demo')

const codeVisible = ref(props.showCode)

const toggleCode = () => {
  codeVisible.value = !codeVisible.value
}
</script>

<template>
  <div :class="b()">
    <div v-if="title || description" :class="e('header')">
      <h3 v-if="title" :class="e('title')">{{ title }}</h3>
      <p v-if="description" :class="e('description')">{{ description }}</p>
    </div>
    
    <div :class="e('preview')">
      <slot />
    </div>
    
    <div v-if="code" :class="e('actions')">
      <button 
        :class="e('code-toggle')"
        @click="toggleCode"
      >
        {{ codeVisible ? 'Hide' : 'Show' }} Code
      </button>
    </div>
    
    <div 
      v-if="code && codeVisible" 
      :class="e('code')"
    >
      <pre><code>{{ code }}</code></pre>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.component-demo {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-6);
  overflow: hidden;
  
  &__header {
    padding: var(--spacing-4) var(--spacing-6);
    border-bottom: 1px solid var(--border-color);
    background-color: var(--muted-color);
  }
  
  &__title {
    @include text('text-lg-semibold');
    margin: 0 0 var(--spacing-1) 0;
    color: var(--foreground-color);
  }
  
  &__description {
    @include text('text-sm-regular');
    margin: 0;
    color: var(--muted-foreground-color);
  }
  
  &__preview {
    padding: var(--spacing-8);
    background-color: var(--background-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-4);
    flex-wrap: wrap;
    min-height: 120px;
  }
  
  &__actions {
    padding: var(--spacing-3) var(--spacing-6);
    border-top: 1px solid var(--border-color);
    background-color: var(--muted-color);
    display: flex;
    justify-content: flex-end;
  }
  
  &__code-toggle {
    @include text('text-sm-medium');
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    padding: var(--spacing-1) 0;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  &__code {
    background-color: var(--muted-color);
    border-top: 1px solid var(--border-color);
    
    pre {
      margin: 0;
      padding: var(--spacing-4) var(--spacing-6);
      overflow-x: auto;
      
      code {
        @include text('text-sm-regular');
        font-family: var(--font-mono);
        color: var(--foreground-color);
      }
    }
  }
}
</style>
```

### 3. Markdown Content Processing

#### Nuxt Content Configuration (`apps/v1/nuxt.config.ts`)
```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Add auto-import for UI components
  components: [
    '~/components',
    {
      path: '~/components/ui',
      prefix: ''
    },
    {
      path: '~/components/docs',
      prefix: 'Docs'
    }
  ],
  
  // CSS configuration
  css: [
    '~/assets/styles/_variables.scss',
    '~/assets/styles/_mixins.scss'
  ],
  
  // SCSS configuration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "~/assets/styles/_variables.scss";
            @import "~/assets/styles/_mixins.scss";
          `
        }
      }
    }
  },
  
  // Content module for documentation
  modules: ['@nuxt/content'],
  
  content: {
    documentDriven: false,
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark'
      },
      langs: ['vue', 'typescript', 'scss', 'bash', 'json']
    }
  }
})
```

### 4. Button Documentation

#### Button Documentation Markdown (`apps/v1/content/docs/components/button.md`)
```markdown
---
title: Button
description: A flexible button component with multiple variants and sizes.
---

# Button

A flexible button component with multiple variants, sizes, and states. Built with accessibility and usability in mind.

## Installation

```bash
npx meduza-ui add button
```

## Usage

```vue
<template>
  <Button>Click me</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
</template>

<script setup>
import Button from '@/components/ui/button.vue'
</script>
```

## Examples

### Variants

::component-demo{title="Button Variants" description="Different visual styles for various use cases"}
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
::

### Sizes

::component-demo{title="Button Sizes" description="Three different sizes to fit your design needs"}
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
::

### States

::component-demo{title="Button States" description="Disabled state handling"}
<Button>Default</Button>
<Button disabled>Disabled</Button>
::

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive'` | `'primary'` | The visual style variant of the button |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | The size of the button |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | The HTML button type |

## Accessibility

- Supports keyboard navigation with Enter and Space keys
- Includes focus indicators for keyboard users
- Proper disabled state handling
- Semantic HTML button element
- Screen reader friendly with proper text content

## Examples with Code

### Primary Button

::component-demo{title="Primary Button" code="<Button variant=\"primary\">Primary Button</Button>"}
<Button variant="primary">Primary Button</Button>
::

### Secondary Button

::component-demo{title="Secondary Button" code="<Button variant=\"secondary\">Secondary Button</Button>"}
<Button variant="secondary">Secondary Button</Button>
::
```

#### Component Documentation Page (`apps/v1/pages/docs/components/button.vue`)
```vue
<script setup lang="ts">
import { useClassName } from '@/lib/utils'

const { b } = useClassName('component-page')

// Use Nuxt Content
const { data: page } = await useAsyncData('button-docs', () => 
  queryContent('/docs/components/button').findOne()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

definePageMeta({
  layout: 'docs',
  title: 'Button - Meduza UI',
  description: 'A flexible button component with multiple variants and sizes.'
})
</script>

<template>
  <div :class="b()">
    <ContentRenderer :value="page" />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.component-page {
  // Markdown content styling
  :deep() {
    h1 {
      @include text('display-bold');
      margin-bottom: var(--spacing-4);
      color: var(--foreground-color);
    }
    
    h2 {
      @include text('heading-semibold');
      margin: var(--spacing-8) 0 var(--spacing-4) 0;
      color: var(--foreground-color);
      
      &:first-child {
        margin-top: 0;
      }
    }
    
    h3 {
      @include text('subhead-medium');
      margin: var(--spacing-6) 0 var(--spacing-3) 0;
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
        margin-bottom: var(--spacing-1);
      }
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: var(--spacing-6);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
      
      th, td {
        text-align: left;
        padding: var(--spacing-3) var(--spacing-4);
        border-bottom: 1px solid var(--border-color);
      }
      
      th {
        background-color: var(--muted-color);
        @include text('text-sm-semibold');
        color: var(--foreground-color);
      }
      
      td {
        @include text('text-sm-regular');
        color: var(--foreground-color);
        
        code {
          background-color: var(--muted-color);
          padding: var(--spacing-0-5) var(--spacing-1);
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          @include text('text-xs-regular');
        }
      }
      
      tbody tr:last-child td {
        border-bottom: none;
      }
    }
    
    code {
      background-color: var(--muted-color);
      padding: var(--spacing-0-5) var(--spacing-1);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      @include text('text-sm-regular');
    }
    
    pre {
      background-color: var(--muted-color);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: var(--spacing-4);
      margin-bottom: var(--spacing-4);
      overflow-x: auto;
      
      code {
        background: none;
        padding: 0;
        border-radius: 0;
        @include text('text-sm-regular');
        color: var(--foreground-color);
      }
    }
  }
}
</style>
```

### 5. Custom Nuxt Content Components

#### Component Demo Content Component (`apps/v1/components/content/ComponentDemo.vue`)
```vue
<script setup lang="ts">
interface ComponentDemoProps {
  title?: string
  description?: string
  code?: string
  showCode?: boolean
}

const props = withDefaults(defineProps<ComponentDemoProps>(), {
  showCode: false
})
</script>

<template>
  <ComponentDemo 
    :title="title"
    :description="description" 
    :code="code"
    :show-code="showCode"
  >
    <slot />
  </ComponentDemo>
</template>
```

## Package Dependencies

### Required Dependencies (`apps/v1/package.json`)
```json
{
  "dependencies": {
    "@nuxt/content": "^2.x",
    "@vueuse/core": "^10.x",
    "sass": "^1.x"
  },
  "devDependencies": {
    "@nuxt/devtools": "latest",
    "typescript": "^5.x",
    "tsx": "^4.x"
  }
}
```

## Deliverables

1. **Complete documentation layout** with responsive sidebar and header
2. **Component demo system** with live previews and code examples
3. **Markdown processing** with syntax highlighting and custom components
4. **Button documentation** as the first complete example
5. **Navigation structure** ready for additional components
6. **Responsive design** that works on mobile and desktop

## Testing

- [ ] Documentation layout renders correctly on all screen sizes
- [ ] Sidebar navigation works with proper active states
- [ ] Mobile menu toggles correctly
- [ ] Component demos display properly with show/hide code functionality
- [ ] Markdown content renders with proper styling
- [ ] Code syntax highlighting works
- [ ] Button documentation displays all examples correctly
- [ ] Navigation between documentation pages works
- [ ] All documentation components follow BEM naming convention

## Next Steps

After this spec is complete:
1. Build CLI init and add commands that consume registry endpoints (Spec 06)
2. Test the complete MVP workflow from init to component installation
3. Add more component documentation following the established patterns
