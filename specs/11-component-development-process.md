# 09 - Component Development Process

## Overview
Establish a systematic process for developing, documenting, and releasing new Vue.js components for Meduza UI. This process ensures consistency, quality, and maintainability across all components while providing clear guidelines for contributors.

## Goals
- Define standardized component development workflow
- Establish quality gates and review processes
- Create templates and tooling for efficient development
- Set up automated testing and validation pipelines
- Document component API patterns and conventions
- Implement release and versioning strategies

## Development Workflow

### 1. Component Planning and Design

#### Component Specification Template (`templates/component-spec.md`)
```markdown
# Component Name: [ComponentName]

## Overview
Brief description of the component's purpose and use cases.

## Design Requirements
- Visual design specifications
- Interaction patterns
- Accessibility requirements
- Responsive behavior

## API Design
### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'default' | Visual style variant |
| size | string | 'md' | Component size |
| disabled | boolean | false | Disabled state |

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| click | MouseEvent | Emitted on click |
| change | value | Emitted on value change |

### Slots
| Slot | Description |
|------|-------------|
| default | Main content |
| icon | Icon slot |

## Dependencies
- NPM packages required
- Registry dependencies
- SCSS variables needed

## Accessibility
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management

## Examples
Code examples showing common usage patterns.

## Implementation Notes
Technical considerations and constraints.
```

#### Component Checklist
```markdown
## Pre-Development
- [ ] Component specification approved
- [ ] Design review completed
- [ ] API design validated
- [ ] Accessibility requirements defined
- [ ] Dependencies identified

## Development
- [ ] Component implementation follows Vue SFC order (script, template, style)
- [ ] Uses BEM naming with useClassName utility
- [ ] Props use TypeScript enums for string values
- [ ] Follows established SCSS patterns
- [ ] Includes proper TypeScript types
- [ ] Handles all specified props and events
- [ ] Implements required accessibility features

## Testing
- [ ] Unit tests cover all props and events
- [ ] Accessibility testing completed
- [ ] Visual regression tests added
- [ ] Documentation examples tested
- [ ] Cross-browser compatibility verified

## Documentation
- [ ] Component documentation written
- [ ] Interactive examples created
- [ ] API reference complete
- [ ] Usage guidelines documented
- [ ] Migration guide (if replacing existing component)

## Registry
- [ ] Registry metadata created
- [ ] Build script generates correct JSON
- [ ] Dependencies properly listed
- [ ] SCSS variables documented
- [ ] CLI installation tested

## Release
- [ ] Code review approved
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Registry updated
- [ ] Changelog updated
- [ ] Version bumped appropriately
```

### 2. Component Implementation

#### File Structure Convention
```
apps/v1/registry/default/
├── ui/
│   └── [component-name].vue          # Main component file
├── lib/
│   └── [utility-name].ts             # Utility functions (if needed)
└── styles/
    ├── _[component-name].scss        # Component-specific SCSS (if needed)
    └── _variables-[component].scss   # Component variables (if needed)

apps/v1/registry/
├── registry-ui.ts                    # Component metadata
└── index.ts                          # Registry aggregation

apps/v1/content/docs/components/
└── [component-name].md               # Component documentation
```

#### Component Template (`templates/component.vue`)
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useClassName } from '@/lib/utils'

// Enums for type safety
enum ComponentVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  // Add more variants
}

enum ComponentSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

interface ComponentProps {
  variant?: ComponentVariant
  size?: ComponentSize
  disabled?: boolean
  // Add more props
}

const props = withDefaults(defineProps<ComponentProps>(), {
  variant: ComponentVariant.Primary,
  size: ComponentSize.Medium,
  disabled: false,
})

// Events
const emit = defineEmits<{
  click: [event: MouseEvent]
  // Add more events
}>()

// Root class using component name in kebab-case
const { b } = useClassName('[component-name]')

const componentClasses = computed(() => {
  return b([
    props.variant,
    props.size,
    { disabled: props.disabled }
  ])
})

// Event handlers
const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <div
    :class="componentClasses"
    @click="handleClick"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.[component-name] {
  // Base styles
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: var(--transition-base);
  cursor: pointer;
  border: 1px solid transparent;
  
  @include text('text-sm-medium');
  @include focus-ring;
  
  // Variants
  &--primary {
    background-color: var(--primary-color);
    color: var(--primary-foreground-color);
    
    &:hover:not(.[component-name]--disabled) {
      opacity: 0.9;
    }
  }
  
  &--secondary {
    background-color: var(--secondary-color);
    color: var(--secondary-foreground-color);
    
    &:hover:not(.[component-name]--disabled) {
      opacity: 0.8;
    }
  }
  
  // Sizes
  &--sm {
    height: 32px;
    padding: 0 var(--spacing-3);
    @include text('text-sm-medium');
  }
  
  &--md {
    height: 40px;
    padding: 0 var(--spacing-4);
    @include text('text-sm-medium');
  }
  
  &--lg {
    height: 48px;
    padding: 0 var(--spacing-6);
    @include text('text-base-medium');
  }
  
  // States
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
```

#### Registry Metadata Template
```typescript
// apps/v1/registry/registry-ui.ts

{
  name: "[component-name]",
  type: "registry:ui",
  description: "Brief description of the component",
  dependencies: [
    // NPM packages if needed
  ],
  registryDependencies: [
    // Other components this depends on
    "utils"
  ],
  files: [
    {
      path: "ui/[component-name].vue",
      type: "registry:ui",
    },
  ],
  scssVars: {
    // Component-specific SCSS variables if needed
  },
},
```

### 3. Testing Standards

#### Unit Testing Template (`tests/components/[component-name].test.ts`)
```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ComponentName from '@/registry/default/ui/[component-name].vue'

describe('ComponentName', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ComponentName)
    expect(wrapper.classes()).toContain('[component-name]')
    expect(wrapper.classes()).toContain('[component-name]--primary')
    expect(wrapper.classes()).toContain('[component-name]--md')
  })

  it('applies variant classes correctly', () => {
    const wrapper = mount(ComponentName, {
      props: { variant: 'secondary' }
    })
    expect(wrapper.classes()).toContain('[component-name]--secondary')
  })

  it('applies size classes correctly', () => {
    const wrapper = mount(ComponentName, {
      props: { size: 'lg' }
    })
    expect(wrapper.classes()).toContain('[component-name]--lg')
  })

  it('handles disabled state', () => {
    const wrapper = mount(ComponentName, {
      props: { disabled: true }
    })
    expect(wrapper.classes()).toContain('[component-name]--disabled')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(ComponentName)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(ComponentName, {
      props: { disabled: true }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('renders slot content', () => {
    const wrapper = mount(ComponentName, {
      slots: {
        default: 'Test content'
      }
    })
    expect(wrapper.text()).toBe('Test content')
  })
})
```

#### Visual Testing Setup (`tests/visual/[component-name].stories.ts`)
```typescript
import type { Meta, StoryObj } from '@storybook/vue3'
import ComponentName from '@/registry/default/ui/[component-name].vue'

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    docs: {
      description: {
        component: 'Component description and usage guidelines.'
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary']
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false
  },
  render: (args) => ({
    components: { ComponentName },
    setup() {
      return { args }
    },
    template: '<ComponentName v-bind="args">Click me</ComponentName>'
  })
}

export const Variants: Story = {
  render: () => ({
    components: { ComponentName },
    template: `
      <div style="display: flex; gap: 1rem;">
        <ComponentName variant="primary">Primary</ComponentName>
        <ComponentName variant="secondary">Secondary</ComponentName>
      </div>
    `
  })
}

export const Sizes: Story = {
  render: () => ({
    components: { ComponentName },
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <ComponentName size="sm">Small</ComponentName>
        <ComponentName size="md">Medium</ComponentName>
        <ComponentName size="lg">Large</ComponentName>
      </div>
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { ComponentName },
    template: `
      <div style="display: flex; gap: 1rem;">
        <ComponentName>Enabled</ComponentName>
        <ComponentName disabled>Disabled</ComponentName>
      </div>
    `
  })
}
```

### 4. Documentation Standards

#### Component Documentation Template (`apps/v1/content/docs/components/[component-name].md`)
```markdown
---
title: ComponentName
description: Brief description of the component and its purpose.
---

# ComponentName

Detailed description of the component, its use cases, and when to use it.

## Installation

```bash
npx meduza-ui add [component-name]
```

## Usage

```vue
<template>
  <ComponentName>Click me</ComponentName>
  <ComponentName variant="secondary">Secondary</ComponentName>
  <ComponentName size="lg">Large</ComponentName>
</template>

<script setup>
import ComponentName from '@/components/ui/[component-name].vue'
</script>
```

## Examples

### Variants

::component-demo{title="Component Variants" description="Different visual styles"}
<ComponentName variant="primary">Primary</ComponentName>
<ComponentName variant="secondary">Secondary</ComponentName>
::

### Sizes

::component-demo{title="Component Sizes" description="Available size options"}
<ComponentName size="sm">Small</ComponentName>
<ComponentName size="md">Medium</ComponentName>
<ComponentName size="lg">Large</ComponentName>
::

### States

::component-demo{title="Component States" description="Different component states"}
<ComponentName>Default</ComponentName>
<ComponentName disabled>Disabled</ComponentName>
::

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `disabled` | `boolean` | `false` | Whether the component is disabled |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `MouseEvent` | Emitted when the component is clicked |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Main content of the component |

## Accessibility

- Supports keyboard navigation
- Includes proper ARIA attributes
- Focus indicators for keyboard users
- Screen reader compatible
- Semantic HTML structure

## Styling

The component uses CSS custom properties for theming:

```scss
// Customizable properties
--primary-color
--primary-foreground-color
--secondary-color
--secondary-foreground-color
--radius-md
--spacing-3
--spacing-4
--spacing-6
--text-sm-medium
--text-base-medium
--transition-base
```

## Examples with Code

### Basic Usage

::component-demo{title="Basic Usage" code="<ComponentName>Hello World</ComponentName>"}
<ComponentName>Hello World</ComponentName>
::

### With Event Handling

::component-demo{title="Event Handling" code="<ComponentName @click=\"handleClick\">Click me</ComponentName>"}
<ComponentName @click="() => alert('Clicked!')">Click me</ComponentName>
::
```

### 5. Automation and Tooling

#### Development Scripts (`apps/v1/scripts/dev-component.ts`)
```typescript
#!/usr/bin/env tsx

import { Command } from 'commander'
import * as fs from 'fs-extra'
import * as path from 'path'
import prompts from 'prompts'
import kleur from 'kleur'

const program = new Command()

program
  .name('dev-component')
  .description('Development utilities for Meduza UI components')

program
  .command('create')
  .description('Create a new component with all necessary files')
  .action(async () => {
    const answers = await prompts([
      {
        type: 'text',
        name: 'name',
        message: 'Component name (kebab-case):',
        validate: (value) => /^[a-z][a-z0-9-]*[a-z0-9]$/.test(value) || 'Invalid component name'
      },
      {
        type: 'text',
        name: 'description',
        message: 'Component description:',
      },
      {
        type: 'multiselect',
        name: 'variants',
        message: 'Select variants:',
        choices: [
          { title: 'Primary', value: 'primary', selected: true },
          { title: 'Secondary', value: 'secondary', selected: true },
          { title: 'Outline', value: 'outline' },
          { title: 'Ghost', value: 'ghost' },
          { title: 'Destructive', value: 'destructive' },
        ]
      },
      {
        type: 'multiselect',
        name: 'sizes',
        message: 'Select sizes:',
        choices: [
          { title: 'Small', value: 'sm', selected: true },
          { title: 'Medium', value: 'md', selected: true },
          { title: 'Large', value: 'lg', selected: true },
        ]
      },
    ])

    await createComponent(answers)
  })

program
  .command('validate')
  .description('Validate component implementation')
  .argument('<name>', 'component name')
  .action(async (name) => {
    await validateComponent(name)
  })

async function createComponent(config: any) {
  const { name, description, variants, sizes } = config
  
  console.log(`\n${kleur.blue('Creating component:')} ${kleur.cyan(name)}`)
  
  // Create component file
  const componentPath = `registry/default/ui/${name}.vue`
  const componentContent = generateComponentTemplate(name, description, variants, sizes)
  await fs.writeFile(componentPath, componentContent)
  console.log(`${kleur.green('✓')} Created ${componentPath}`)
  
  // Create test file
  const testPath = `tests/components/${name}.test.ts`
  const testContent = generateTestTemplate(name, variants, sizes)
  await fs.ensureDir(path.dirname(testPath))
  await fs.writeFile(testPath, testContent)
  console.log(`${kleur.green('✓')} Created ${testPath}`)
  
  // Create story file
  const storyPath = `tests/visual/${name}.stories.ts`
  const storyContent = generateStoryTemplate(name, variants, sizes)
  await fs.ensureDir(path.dirname(storyPath))
  await fs.writeFile(storyPath, storyContent)
  console.log(`${kleur.green('✓')} Created ${storyPath}`)
  
  // Create documentation
  const docPath = `content/docs/components/${name}.md`
  const docContent = generateDocTemplate(name, description, variants, sizes)
  await fs.ensureDir(path.dirname(docPath))
  await fs.writeFile(docPath, docContent)
  console.log(`${kleur.green('✓')} Created ${docPath}`)
  
  // Update registry
  await updateRegistry(name, description)
  console.log(`${kleur.green('✓')} Updated registry`)
  
  console.log(`\n${kleur.green('Component created successfully!')}`)
  console.log(`Next steps:`)
  console.log(`1. Implement the component logic in ${kleur.cyan(componentPath)}`)
  console.log(`2. Run tests: ${kleur.cyan('npm test')}`)
  console.log(`3. Build registry: ${kleur.cyan('npm run build:registry')}`)
  console.log(`4. Test installation: ${kleur.cyan(`npx meduza-ui add ${name}`)}`)
}

async function validateComponent(name: string) {
  console.log(`\n${kleur.blue('Validating component:')} ${kleur.cyan(name)}`)
  
  const errors: string[] = []
  
  // Check if component file exists
  const componentPath = `registry/default/ui/${name}.vue`
  if (!await fs.pathExists(componentPath)) {
    errors.push(`Component file not found: ${componentPath}`)
  }
  
  // Check if test file exists
  const testPath = `tests/components/${name}.test.ts`
  if (!await fs.pathExists(testPath)) {
    errors.push(`Test file not found: ${testPath}`)
  }
  
  // Check if documentation exists
  const docPath = `content/docs/components/${name}.md`
  if (!await fs.pathExists(docPath)) {
    errors.push(`Documentation not found: ${docPath}`)
  }
  
  // Check registry
  const registryPath = 'registry/registry-ui.ts'
  const registryContent = await fs.readFile(registryPath, 'utf8')
  if (!registryContent.includes(`name: "${name}"`)) {
    errors.push(`Component not found in registry: ${registryPath}`)
  }
  
  if (errors.length > 0) {
    console.log(`\n${kleur.red('Validation failed:')}`)
    errors.forEach(error => {
      console.log(`${kleur.red('✖')} ${error}`)
    })
    process.exit(1)
  }
  
  console.log(`\n${kleur.green('✓ Component validation passed!')}`)
}

// Template generation functions would be implemented here...
function generateComponentTemplate(name: string, description: string, variants: string[], sizes: string[]): string {
  // Implementation for component template generation
  return `<!-- Generated component template -->`
}

function generateTestTemplate(name: string, variants: string[], sizes: string[]): string {
  // Implementation for test template generation
  return `// Generated test template`
}

function generateStoryTemplate(name: string, variants: string[], sizes: string[]): string {
  // Implementation for story template generation
  return `// Generated story template`
}

function generateDocTemplate(name: string, description: string, variants: string[], sizes: string[]): string {
  // Implementation for documentation template generation
  return `<!-- Generated documentation template -->`
}

async function updateRegistry(name: string, description: string) {
  // Implementation for updating registry
}

program.parse()
```

#### Validation Scripts (`apps/v1/scripts/validate-components.ts`)
```typescript
#!/usr/bin/env tsx

import * as fs from 'fs-extra'
import * as path from 'path'
import { glob } from 'fast-glob'
import kleur from 'kleur'

interface ValidationResult {
  component: string
  errors: string[]
  warnings: string[]
}

async function validateAllComponents(): Promise<ValidationResult[]> {
  const componentFiles = await glob('registry/default/ui/*.vue')
  const results: ValidationResult[] = []
  
  for (const file of componentFiles) {
    const componentName = path.basename(file, '.vue')
    const result = await validateSingleComponent(componentName)
    results.push(result)
  }
  
  return results
}

async function validateSingleComponent(name: string): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validate component file
  const componentPath = `registry/default/ui/${name}.vue`
  if (await fs.pathExists(componentPath)) {
    const content = await fs.readFile(componentPath, 'utf8')
    
    // Check SFC order
    const scriptIndex = content.indexOf('<script')
    const templateIndex = content.indexOf('<template')
    const styleIndex = content.indexOf('<style')
    
    if (scriptIndex > templateIndex) {
      errors.push('Script block should come before template block')
    }
    if (templateIndex > styleIndex) {
      errors.push('Template block should come before style block')
    }
    
    // Check useClassName usage
    if (!content.includes('useClassName')) {
      warnings.push('Component should use useClassName utility')
    }
    
    // Check BEM root class
    const rootClassRegex = new RegExp(`\\.${name}\\s*{`)
    if (!rootClassRegex.test(content)) {
      errors.push(`Component should have root class .${name}`)
    }
    
    // Check TypeScript enums for props
    if (content.includes('variant') && !content.includes('enum')) {
      warnings.push('String props should use TypeScript enums')
    }
  } else {
    errors.push('Component file not found')
  }
  
  // Validate test file
  const testPath = `tests/components/${name}.test.ts`
  if (!await fs.pathExists(testPath)) {
    errors.push('Test file not found')
  }
  
  // Validate documentation
  const docPath = `content/docs/components/${name}.md`
  if (!await fs.pathExists(docPath)) {
    errors.push('Documentation not found')
  }
  
  // Validate registry entry
  const registryPath = 'registry/registry-ui.ts'
  const registryContent = await fs.readFile(registryPath, 'utf8')
  if (!registryContent.includes(`name: "${name}"`)) {
    errors.push('Component not found in registry')
  }
  
  return { component: name, errors, warnings }
}

async function main() {
  console.log(`${kleur.blue('Validating all components...')}\n`)
  
  const results = await validateAllComponents()
  let totalErrors = 0
  let totalWarnings = 0
  
  for (const result of results) {
    const { component, errors, warnings } = result
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log(`${kleur.green('✓')} ${component}`)
    } else {
      console.log(`${kleur.yellow('⚠')} ${component}`)
      
      errors.forEach(error => {
        console.log(`  ${kleur.red('✖')} ${error}`)
        totalErrors++
      })
      
      warnings.forEach(warning => {
        console.log(`  ${kleur.yellow('⚠')} ${warning}`)
        totalWarnings++
      })
    }
  }
  
  console.log(`\n${kleur.blue('Summary:')}`)
  console.log(`Components: ${results.length}`)
  console.log(`Errors: ${kleur.red(totalErrors)}`)
  console.log(`Warnings: ${kleur.yellow(totalWarnings)}`)
  
  if (totalErrors > 0) {
    process.exit(1)
  }
}

main().catch(console.error)
```

### 6. Release Process

#### Versioning Strategy
```markdown
# Semantic Versioning for Meduza UI

## Version Format: MAJOR.MINOR.PATCH

### MAJOR (Breaking Changes)
- API changes that break existing functionality
- Removal of deprecated components
- Major design system overhauls
- Changes requiring user migration

### MINOR (New Features)
- New components added
- New component variants or props
- New utility functions
- Backward-compatible API enhancements

### PATCH (Bug Fixes)
- Bug fixes in existing components
- Documentation updates
- SCSS variable corrections
- Registry metadata fixes

## Release Checklist
- [ ] All tests passing
- [ ] Component validation successful
- [ ] Documentation updated
- [ ] Registry built and validated
- [ ] CLI tested against new components
- [ ] Breaking changes documented
- [ ] Migration guide updated (if needed)
- [ ] Changelog updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Registry deployed
- [ ] CLI package published

## Quality Gates

### 1. Code Review Requirements
- [ ] Component follows established patterns
- [ ] TypeScript types are properly defined
- [ ] SCSS follows BEM conventions
- [ ] Accessibility requirements met
- [ ] Performance considerations addressed
- [ ] Documentation is complete and accurate

### 2. Automated Checks
- [ ] Unit tests pass (minimum 80% coverage)
- [ ] Visual regression tests pass
- [ ] Component validation passes
- [ ] Registry builds successfully
- [ ] CLI installation works
- [ ] Documentation builds without errors

### 3. Manual Testing
- [ ] Component works in all supported browsers
- [ ] Responsive behavior verified
- [ ] Keyboard navigation tested
- [ ] Screen reader compatibility confirmed
- [ ] Design review approved

## Deliverables

1. **Standardized component templates** for consistent development
2. **Automated tooling** for component creation and validation
3. **Testing standards** with unit, visual, and accessibility tests
4. **Documentation templates** with interactive examples
5. **Quality gates** and review processes
6. **Release automation** with versioning and deployment
7. **Validation scripts** for maintaining code quality
8. **Development workflow** documentation for contributors

## Benefits

- **Consistency** across all components
- **Quality assurance** through automated testing
- **Developer efficiency** with templates and tooling
- **Maintainability** through standardized patterns
- **Documentation quality** with automated generation
- **Release reliability** with systematic processes

This component development process ensures that Meduza UI maintains high quality standards while scaling efficiently as new components are added to the library.
