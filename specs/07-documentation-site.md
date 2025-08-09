# Documentation Site Specification

## Overview

Comprehensive documentation site for meduza-ui using VitePress, featuring component demos,
interactive examples, and complete API documentation.

## Technology Stack

- **VitePress**: Static site generator optimized for Vue documentation
- **Vue 3**: For interactive component demos
- **TypeScript**: Full type safety
- **SCSS**: Consistent styling with the component library
- **Algolia DocSearch**: Powerful search functionality
- **Netlify/Vercel**: Deployment and hosting

## Site Structure

```
apps/docs/
├── .vitepress/
│   ├── config.ts                 # VitePress configuration
│   ├── theme/
│   │   ├── index.ts              # Custom theme
│   │   ├── Layout.vue            # Custom layout
│   │   ├── components/           # Theme components
│   │   │   ├── ComponentDemo.vue
│   │   │   ├── PropsTable.vue
│   │   │   ├── CodeBlock.vue
│   │   │   └── ...
│   │   └── styles/
│   │       ├── main.scss
│   │       ├── _variables.scss
│   │       └── components/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
├── docs/
│   ├── index.md                  # Homepage
│   ├── guide/
│   │   ├── getting-started.md
│   │   ├── installation.md
│   │   ├── theming.md
│   │   └── bem-methodology.md
│   ├── components/
│   │   ├── button.md
│   │   ├── input.md
│   │   ├── modal.md
│   │   └── ...
│   ├── blocks/
│   │   ├── header.md
│   │   ├── navigation.md
│   │   └── ...
│   ├── examples/
│   │   ├── dashboard.md
│   │   ├── forms.md
│   │   └── ...
│   └── api/
│       ├── cli.md
│       └── configuration.md
├── components/                   # Demo components
│   ├── demos/
│   │   ├── ButtonDemo.vue
│   │   ├── InputDemo.vue
│   │   └── ...
│   └── examples/
│       ├── DashboardExample.vue
│       └── ...
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## VitePress Configuration

### Main Configuration

```typescript
// .vitepress/config.ts
import { defineConfig } from 'vitepress';
import { createRequire } from 'module';
import { fileURLToPath, URL } from 'node:url';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

export default defineConfig({
  title: 'Meduza UI',
  description: 'Vue 3 component library with BEM methodology and SCSS',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        rel: 'stylesheet',
      },
    ],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Meduza UI | Vue 3 Component Library' }],
    ['meta', { property: 'og:site_name', content: 'Meduza UI' }],
    ['meta', { property: 'og:image', content: 'https://meduza-ui.dev/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://meduza-ui.dev/' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/components/button' },
      { text: 'Blocks', link: '/blocks/header' },
      { text: 'Examples', link: '/examples/dashboard' },
      {
        text: `v${pkg.version}`,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/meduzaai/meduza-ui/blob/main/CHANGELOG.md',
          },
          {
            text: 'Contributing',
            link: 'https://github.com/meduzaai/meduza-ui/blob/main/CONTRIBUTING.md',
          },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'CLI Usage', link: '/guide/cli' },
          ],
        },
        {
          text: 'Concepts',
          items: [
            { text: 'BEM Methodology', link: '/guide/bem-methodology' },
            { text: 'Theming', link: '/guide/theming' },
            { text: 'Spacing System', link: '/guide/spacing' },
            { text: 'Accessibility', link: '/guide/accessibility' },
          ],
        },
        {
          text: 'Customization',
          items: [
            { text: 'SCSS Variables', link: '/guide/scss-variables' },
            { text: 'Custom Components', link: '/guide/custom-components' },
            { text: 'Framework Integration', link: '/guide/framework-integration' },
          ],
        },
      ],

      '/components/': [
        {
          text: 'Form Controls',
          items: [
            { text: 'Button', link: '/components/button' },
            { text: 'Input', link: '/components/input' },
            { text: 'Textarea', link: '/components/textarea' },
            { text: 'Select', link: '/components/select' },
            { text: 'Checkbox', link: '/components/checkbox' },
            { text: 'Radio', link: '/components/radio' },
            { text: 'Switch', link: '/components/switch' },
          ],
        },
        {
          text: 'Display',
          items: [
            { text: 'Avatar', link: '/components/avatar' },
            { text: 'Badge', link: '/components/badge' },
            { text: 'Card', link: '/components/card' },
            { text: 'Tag', link: '/components/tag' },
            { text: 'Tooltip', link: '/components/tooltip' },
          ],
        },
        {
          text: 'Feedback',
          items: [
            { text: 'Alert', link: '/components/alert' },
            { text: 'Modal', link: '/components/modal' },
            { text: 'Toast', link: '/components/toast' },
            { text: 'Progress', link: '/components/progress' },
            { text: 'Spinner', link: '/components/spinner' },
          ],
        },
        {
          text: 'Navigation',
          items: [
            { text: 'Breadcrumb', link: '/components/breadcrumb' },
            { text: 'Dropdown', link: '/components/dropdown' },
            { text: 'Pagination', link: '/components/pagination' },
            { text: 'Tabs', link: '/components/tabs' },
            { text: 'Stepper', link: '/components/stepper' },
          ],
        },
      ],

      '/blocks/': [
        {
          text: 'Layout Blocks',
          items: [
            { text: 'Header', link: '/blocks/header' },
            { text: 'Navigation', link: '/blocks/navigation' },
            { text: 'Sidebar', link: '/blocks/sidebar' },
            { text: 'Footer', link: '/blocks/footer' },
          ],
        },
        {
          text: 'Content Blocks',
          items: [
            { text: 'Hero Section', link: '/blocks/hero-section' },
            { text: 'Feature Grid', link: '/blocks/feature-grid' },
            { text: 'Testimonial Card', link: '/blocks/testimonial-card' },
            { text: 'Pricing Table', link: '/blocks/pricing-table' },
          ],
        },
        {
          text: 'Interactive Blocks',
          items: [
            { text: 'Contact Form', link: '/blocks/contact-form' },
            { text: 'Search Bar', link: '/blocks/search-bar' },
            { text: 'Data Table', link: '/blocks/data-table' },
            { text: 'Dashboard Card', link: '/blocks/dashboard-card' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/meduzaai/meduza-ui' },
      { icon: 'twitter', link: 'https://twitter.com/meduzaai' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 MeduzaAI',
    },

    search: {
      provider: 'algolia',
      options: {
        appId: 'MEDUZA_UI_APP_ID',
        apiKey: 'MEDUZA_UI_SEARCH_KEY',
        indexName: 'meduza-ui',
        placeholder: 'Search components...',
        translations: {
          button: {
            buttonText: 'Search',
            buttonAriaLabel: 'Search components',
          },
        },
      },
    },

    editLink: {
      pattern: 'https://github.com/meduzaai/meduza-ui/edit/main/apps/docs/docs/:path',
      text: 'Edit this page on GitHub',
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
  },

  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/CustomNavBar.vue', import.meta.url)
          ),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/styles/_functions.scss";
            @import "@/styles/_mixins.scss";
            @import "@/styles/_tokens.scss";
          `,
        },
      },
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    config: md => {
      // Custom markdown plugins
      md.use(require('./plugins/component-demo'));
      md.use(require('./plugins/props-table'));
    },
  },
});
```

## Custom Theme Components

### Component Demo Component

```vue
<!-- .vitepress/theme/components/ComponentDemo.vue -->
<template>
  <div class="component-demo">
    <!-- Demo header -->
    <div class="demo-header">
      <h3 v-if="title" class="demo-title">{{ title }}</h3>
      <p v-if="description" class="demo-description">{{ description }}</p>
    </div>

    <!-- Demo preview -->
    <div class="demo-preview">
      <div class="demo-canvas" :class="{ 'dark-theme': isDark }">
        <component :is="component" v-bind="componentProps" />
      </div>

      <!-- Controls -->
      <div v-if="hasControls" class="demo-controls">
        <div class="control-group">
          <label class="control-label">Theme:</label>
          <button class="control-button" :class="{ active: !isDark }" @click="isDark = false">
            Light
          </button>
          <button class="control-button" :class="{ active: isDark }" @click="isDark = true">
            Dark
          </button>
        </div>

        <slot name="controls" :props="componentProps" :update-prop="updateProp" />
      </div>
    </div>

    <!-- Code examples -->
    <div class="demo-code">
      <div class="code-tabs">
        <button
          v-for="tab in codeTabs"
          :key="tab.name"
          class="code-tab"
          :class="{ active: activeTab === tab.name }"
          @click="activeTab = tab.name"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="code-content">
        <pre v-for="tab in codeTabs" v-show="activeTab === tab.name" :key="tab.name">
          <code v-html="highlightCode(tab.code, tab.language)"></code>
        </pre>
      </div>

      <button class="copy-button" @click="copyCode">
        <Icon name="copy" />
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useClipboard } from '@vueuse/core';
import { highlightCode } from '../utils/highlight';

interface Props {
  title?: string;
  description?: string;
  component: any;
  props?: Record<string, any>;
  hasControls?: boolean;
  codeExamples: {
    vue: string;
    script?: string;
    style?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  hasControls: false,
  props: () => ({}),
});

const isDark = ref(false);
const activeTab = ref('vue');
const componentProps = ref({ ...props.props });

const codeTabs = computed(() => {
  const tabs = [{ name: 'vue', label: 'Template', code: props.codeExamples.vue, language: 'vue' }];

  if (props.codeExamples.script) {
    tabs.push({
      name: 'script',
      label: 'Script',
      code: props.codeExamples.script,
      language: 'typescript',
    });
  }

  if (props.codeExamples.style) {
    tabs.push({ name: 'style', label: 'Style', code: props.codeExamples.style, language: 'scss' });
  }

  return tabs;
});

const { copy, copied } = useClipboard();

const updateProp = (key: string, value: any) => {
  componentProps.value[key] = value;
};

const copyCode = () => {
  const activeTabData = codeTabs.value.find(tab => tab.name === activeTab.value);
  if (activeTabData) {
    copy(activeTabData.code);
  }
};
</script>

<style lang="scss" scoped>
.component-demo {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  margin: 24px 0;
  overflow: hidden;
}

.demo-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
}

.demo-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.demo-description {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.demo-preview {
  position: relative;
}

.demo-canvas {
  padding: 32px 20px;
  background: var(--vp-c-bg);

  &.dark-theme {
    background: #0f172a;
    color: #f1f5f9;
  }
}

.demo-controls {
  padding: 16px 20px;
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-border);
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.control-button {
  padding: 4px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--vp-c-bg-soft);
  }

  &.active {
    background: var(--vp-c-brand);
    color: white;
    border-color: var(--vp-c-brand);
  }
}

.demo-code {
  position: relative;
  background: var(--vp-code-bg);
}

.code-tabs {
  display: flex;
  border-bottom: 1px solid var(--vp-c-border);
}

.code-tab {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--vp-c-text-1);
  }

  &.active {
    color: var(--vp-c-brand);
    background: var(--vp-code-bg);
  }
}

.code-content {
  position: relative;
  max-height: 400px;
  overflow: auto;

  pre {
    margin: 0;
    padding: 20px;
    background: transparent;
  }

  code {
    font-family: var(--vp-font-family-mono);
    font-size: 14px;
    line-height: 1.5;
  }
}

.copy-button {
  position: absolute;
  top: 52px;
  right: 12px;
  padding: 6px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: var(--vp-c-bg-soft);
  }
}
</style>
```

### Props Table Component

```vue
<!-- .vitepress/theme/components/PropsTable.vue -->
<template>
  <div class="props-table">
    <h3>Props</h3>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prop in props" :key="prop.name">
            <td class="prop-name">
              <code>{{ prop.name }}</code>
            </td>
            <td class="prop-type">
              <code>{{ prop.type }}</code>
            </td>
            <td class="prop-default">
              <code v-if="prop.default">{{ prop.default }}</code>
              <span v-else class="no-default">—</span>
            </td>
            <td class="prop-required">
              <span :class="prop.required ? 'required' : 'optional'">
                {{ prop.required ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="prop-description">
              {{ prop.description }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="slots.length" class="slots-section">
      <h3>Slots</h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Props</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in slots" :key="slot.name">
              <td class="slot-name">
                <code>{{ slot.name }}</code>
              </td>
              <td class="slot-props">
                <code v-if="slot.props">{{ slot.props }}</code>
                <span v-else class="no-props">—</span>
              </td>
              <td class="slot-description">
                {{ slot.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="events.length" class="events-section">
      <h3>Events</h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Payload</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in events" :key="event.name">
              <td class="event-name">
                <code>{{ event.name }}</code>
              </td>
              <td class="event-payload">
                <code v-if="event.payload">{{ event.payload }}</code>
                <span v-else class="no-payload">—</span>
              </td>
              <td class="event-description">
                {{ event.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PropDefinition {
  name: string;
  type: string;
  default?: string;
  required: boolean;
  description: string;
}

interface SlotDefinition {
  name: string;
  props?: string;
  description: string;
}

interface EventDefinition {
  name: string;
  payload?: string;
  description: string;
}

interface Props {
  props: PropDefinition[];
  slots?: SlotDefinition[];
  events?: EventDefinition[];
}

const props = withDefaults(defineProps<Props>(), {
  slots: () => [],
  events: () => [],
});
</script>

<style lang="scss" scoped>
.props-table {
  margin: 24px 0;

  h3 {
    margin: 24px 0 16px 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--vp-c-text-1);
  }
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-1);
    font-weight: 600;
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--vp-c-border);

    &:not(:last-child) {
      border-right: 1px solid var(--vp-c-border);
    }
  }

  td {
    padding: 12px;
    border-bottom: 1px solid var(--vp-c-border);

    &:not(:last-child) {
      border-right: 1px solid var(--vp-c-border);
    }

    &:last-child {
      border-right: none;
    }
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
}

.prop-name,
.slot-name,
.event-name {
  font-weight: 500;

  code {
    color: var(--vp-c-brand);
    background: var(--vp-c-bg-soft);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }
}

.prop-type {
  code {
    color: var(--vp-c-text-2);
    background: var(--vp-c-bg-soft);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }
}

.prop-default,
.slot-props,
.event-payload {
  code {
    color: var(--vp-c-text-3);
    background: var(--vp-c-bg-soft);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }
}

.no-default,
.no-props,
.no-payload {
  color: var(--vp-c-text-3);
  font-style: italic;
}

.required {
  color: var(--vp-c-danger);
  font-weight: 500;
}

.optional {
  color: var(--vp-c-text-3);
}

.slots-section,
.events-section {
  margin-top: 32px;
}
</style>
```

## Markdown Content Structure

### Component Documentation Template

````markdown
## <!-- docs/components/button.md -->

title: Button description: Interactive button component with multiple variants and states

---

# Button

Interactive button component with multiple variants and states. Supports loading states, icons, and
custom styling through BEM classes.

## Installation

```bash
npx @meduza-ui/cli add button
```
````

## Basic Usage

<ComponentDemo
  title="Basic Button"
  description="Default button with primary variant"
  :component="ButtonDemo"
  :code-examples="{
    vue: `<Button>Click me</Button>`,
    script: `import { Button } from '@/components/ui'`
  }"
/>

## Variants

<ComponentDemo title="Button Variants" description="Different visual styles for various contexts"
:component="ButtonVariantsDemo" :code-examples="{ vue:
`<Button variant="primary">Primary</Button> <Button variant="secondary">Secondary</Button> <Button variant="outline">Outline</Button> <Button variant="ghost">Ghost</Button> <Button variant="danger">Danger</Button>`
}" />

## Sizes

<ComponentDemo title="Button Sizes" description="Three size variants: small, medium, and large"
:component="ButtonSizesDemo" :code-examples="{ vue:
`<Button size="small">Small</Button> <Button size="medium">Medium</Button> <Button size="large">Large</Button>`
}" />

## With Icons

<ComponentDemo title="Button with Icons" description="Buttons with icons on left or right side"
:component="ButtonIconsDemo" :code-examples="{ vue:
`<Button icon="plus" icon-position="left">Add Item</Button> <Button icon="arrow-right" icon-position="right">Continue</Button>`
}" />

## States

<ComponentDemo title="Button States" description="Loading and disabled states"
:component="ButtonStatesDemo" :code-examples="{ vue:
`<Button :loading="true">Loading...</Button> <Button :disabled="true">Disabled</Button>` }" />

## API Reference

<PropsTable
  :props="[
    {
      name: 'variant',
      type: 'ButtonVariant',
      default: 'ButtonVariant.Primary',
      required: false,
      description: 'Visual style variant of the button'
    },
    {
      name: 'size',
      type: 'ButtonSize',
      default: 'ButtonSize.Medium',
      required: false,
      description: 'Size variant of the button'
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      required: false,
      description: 'Whether the button is disabled'
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      required: false,
      description: 'Whether the button is in loading state'
    },
    {
      name: 'icon',
      type: 'string',
      required: false,
      description: 'Icon name to display'
    },
    {
      name: 'iconPosition',
      type: 'IconPosition',
      default: 'IconPosition.Left',
      required: false,
      description: 'Position of the icon relative to text'
    }
  ]"
  :slots="[
    {
      name: 'default',
      description: 'Button content'
    },
    {
      name: 'icon',
      props: '{ position: IconPosition }',
      description: 'Custom icon slot'
    }
  ]"
  :events="[
    {
      name: 'click',
      payload: 'MouseEvent',
      description: 'Emitted when button is clicked'
    }
  ]"
/>

## SCSS Variables

You can customize the button appearance by overriding these SCSS variables:

```scss
:root {
  --button-padding-x: 16px;
  --button-padding-y: 8px;
  --button-border-radius: 4px;
  --button-font-weight: 500;
  --button-transition: all 150ms ease;
}
```

## BEM Classes

The button component uses these BEM classes:

- `.button` - Root block
- `.button__text` - Text content element
- `.button__icon` - Icon element
- `.button__spinner` - Loading spinner element
- `.button--{variant}` - Variant modifiers
- `.button--{size}` - Size modifiers
- `.button--disabled` - Disabled state modifier
- `.button--loading` - Loading state modifier

## Accessibility

The button component includes these accessibility features:

- Proper ARIA attributes for states
- Keyboard navigation support
- Screen reader announcements
- Focus management
- Color contrast compliance

## Examples

### Form Submit Button

```vue
<template>
  <form @submit="handleSubmit">
    <Input v-model="email" placeholder="Email" />
    <Button type="submit" :loading="isSubmitting" variant="primary">
      {{ isSubmitting ? 'Submitting...' : 'Submit' }}
    </Button>
  </form>
</template>
```

### Action Buttons

```vue
<template>
  <div class="action-buttons">
    <Button variant="outline" @click="cancel"> Cancel </Button>
    <Button variant="danger" @click="deleteItem"> Delete </Button>
    <Button variant="primary" @click="save"> Save Changes </Button>
  </div>
</template>
```

````

## Homepage Content

```markdown
<!-- docs/index.md -->
---
layout: home

hero:
  name: "Meduza UI"
  text: "Vue 3 Component Library"
  tagline: "Beautiful, accessible components with BEM methodology and SCSS"
  image:
    src: /logo.svg
    alt: Meduza UI
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View Components
      link: /components/button
    - theme: alt
      text: View on GitHub
      link: https://github.com/meduzaai/meduza-ui

features:
  - icon: ⚡
    title: Vue 3 & Composition API
    details: Built exclusively for Vue 3 with Composition API, TypeScript support, and modern development practices.

  - icon: 🎨
    title: BEM Methodology
    details: Consistent, maintainable CSS with Block-Element-Modifier naming convention and powerful useClassName utility.

  - icon: 📐
    title: 4px Spacing System
    details: Pixel-perfect design with a systematic 4px spacing grid for consistent layouts and spacing.

  - icon: 🔧
    title: CLI Tool
    details: Powerful CLI for installing components, managing dependencies, and customizing your setup.

  - icon: ♿
    title: Accessibility First
    details: WCAG compliant components with proper ARIA attributes, keyboard navigation, and screen reader support.

  - icon: 🌙
    title: Dark Mode Ready
    details: Built-in theme support with CSS custom properties for seamless light and dark mode switching.

footer:
  message: Released under the MIT License.
  copyright: Copyright © 2024 MeduzaAI
---

## Quick Start

Install the CLI and add your first component in seconds:

```bash
# Install CLI
npm install -g @meduza-ui/cli

# Initialize your project
meduza-ui init

# Add components
meduza-ui add button input modal
````

## Example Usage

```vue
<template>
  <div class="app">
    <Button variant="primary" size="large" :loading="isLoading" @click="handleClick">
      Get Started
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui';
import { ButtonVariant, ButtonSize } from '@/types/Button';

const isLoading = ref(false);

const handleClick = () => {
  isLoading.value = true;
  // Handle action
};
</script>
```

<style scoped>
.app {
  padding: 2rem;
}
</style>

````

## Build and Deployment

### Package.json

```json
{
  "name": "meduza-ui-docs",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vitepress dev docs",
    "build": "vitepress build docs",
    "preview": "vitepress preview docs",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@meduza-ui/core": "workspace:*",
    "@vueuse/core": "^10.0.0",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "sass": "^1.70.0",
    "typescript": "^5.3.0",
    "vitepress": "^1.0.0",
    "vue-tsc": "^1.8.0"
  }
}
````

### Deployment Configuration

```yaml
# .github/workflows/deploy-docs.yml
name: Deploy Documentation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build documentation
        run: pnpm run build
        working-directory: apps/docs

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './apps/docs/.vitepress/dist'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

This comprehensive documentation specification provides a professional, user-friendly experience for
developers using your meduza-ui library, with interactive demos, comprehensive API documentation,
and excellent developer experience.

<function_calls> <invoke name="todo_write"> <parameter name="merge">true
