# Testing Strategy Specification

## Overview

Comprehensive testing strategy for meduza-ui covering unit tests, integration tests, visual
regression tests, and accessibility testing.

## Testing Stack

### Core Testing Tools

- **Vitest**: Fast unit test runner with Vue support
- **Vue Test Utils**: Vue component testing utilities
- **Testing Library**: User-centric testing approach
- **Playwright**: End-to-end and visual regression testing
- **Axe**: Accessibility testing
- **Storybook**: Component development and testing
- **Chromatic**: Visual regression testing service

### Testing Types

1. **Unit Tests**: Individual component and utility testing
2. **Integration Tests**: Component interaction testing
3. **Visual Regression Tests**: UI consistency verification
4. **Accessibility Tests**: WCAG compliance validation
5. **E2E Tests**: Complete user flow testing
6. **Performance Tests**: Component performance metrics

## Test Configuration

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test-setup.ts'],
    include: ['**/*.{test,spec}.{js,ts,vue}'],
    exclude: ['node_modules', 'dist', '.vitepress'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/*.stories.ts'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
    },
  },
});
```

### Test Setup

```typescript
// test-setup.ts
import { config } from '@vue/test-utils';
import { vi } from 'vitest';

// Global test configuration
config.global.stubs = {
  // Stub out components that don't need to be tested
  transition: false,
  'router-link': false,
};

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock CSS custom properties
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop: string) => {
      // Return mock values for CSS custom properties
      const mockValues: Record<string, string> = {
        '--color-primary': '#3b82f6',
        '--spacing-4': '16px',
        '--border-radius': '4px',
      };
      return mockValues[prop] || '';
    },
  }),
});
```

## Component Testing

### Unit Test Example - Button Component

```typescript
// components/ui/Button/Button.test.ts
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Button from './Button.vue';
import { ButtonVariant, ButtonSize } from './Button.types';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Click me',
        },
      });

      expect(wrapper.classes()).toContain('button');
      expect(wrapper.classes()).toContain('button--primary');
      expect(wrapper.classes()).toContain('button--medium');
      expect(wrapper.text()).toBe('Click me');
      expect(wrapper.attributes('type')).toBe('button');
    });

    it('renders with custom variant', () => {
      const wrapper = mount(Button, {
        props: {
          variant: ButtonVariant.Secondary,
        },
      });

      expect(wrapper.classes()).toContain('button--secondary');
      expect(wrapper.classes()).not.toContain('button--primary');
    });

    it('renders with custom size', () => {
      const wrapper = mount(Button, {
        props: {
          size: ButtonSize.Large,
        },
      });

      expect(wrapper.classes()).toContain('button--large');
    });

    it('renders as different HTML element', () => {
      const wrapper = mount(Button, {
        props: {
          tag: 'a',
        },
      });

      expect(wrapper.element.tagName).toBe('A');
    });
  });

  describe('States', () => {
    it('applies disabled state correctly', () => {
      const wrapper = mount(Button, {
        props: {
          disabled: true,
        },
      });

      expect(wrapper.classes()).toContain('button--disabled');
      expect(wrapper.attributes('disabled')).toBeDefined();
      expect(wrapper.attributes('aria-disabled')).toBe('true');
    });

    it('applies loading state correctly', async () => {
      const wrapper = mount(Button, {
        props: {
          loading: true,
        },
      });

      await nextTick();

      expect(wrapper.classes()).toContain('button--loading');
      expect(wrapper.find('.button__spinner').exists()).toBe(true);
      expect(wrapper.attributes('aria-disabled')).toBe('true');
    });
  });

  describe('Icons', () => {
    it('renders left icon', () => {
      const wrapper = mount(Button, {
        props: {
          icon: 'plus',
          iconPosition: 'left',
        },
        slots: {
          default: 'Add Item',
        },
      });

      const iconElement = wrapper.find('.button__icon--left');
      expect(iconElement.exists()).toBe(true);
    });

    it('renders right icon', () => {
      const wrapper = mount(Button, {
        props: {
          icon: 'arrow-right',
          iconPosition: 'right',
        },
      });

      const iconElement = wrapper.find('.button__icon--right');
      expect(iconElement.exists()).toBe(true);
    });

    it('hides icon when loading', async () => {
      const wrapper = mount(Button, {
        props: {
          icon: 'plus',
          loading: true,
        },
      });

      await nextTick();

      expect(wrapper.find('.button__icon').exists()).toBe(false);
      expect(wrapper.find('.button__spinner').exists()).toBe(true);
    });
  });

  describe('Events', () => {
    it('emits click event when clicked', async () => {
      const wrapper = mount(Button);

      await wrapper.trigger('click');

      expect(wrapper.emitted('click')).toHaveLength(1);
      expect(wrapper.emitted('click')?.[0]).toEqual([expect.any(MouseEvent)]);
    });

    it('does not emit click when disabled', async () => {
      const wrapper = mount(Button, {
        props: {
          disabled: true,
        },
      });

      await wrapper.trigger('click');

      expect(wrapper.emitted('click')).toBeUndefined();
    });

    it('does not emit click when loading', async () => {
      const wrapper = mount(Button, {
        props: {
          loading: true,
        },
      });

      await wrapper.trigger('click');

      expect(wrapper.emitted('click')).toBeUndefined();
    });

    it('handles keyboard events for custom tags', async () => {
      const wrapper = mount(Button, {
        props: {
          tag: 'div',
        },
      });

      await wrapper.trigger('keydown.enter');
      expect(wrapper.emitted('click')).toHaveLength(1);

      await wrapper.trigger('keydown.space');
      expect(wrapper.emitted('click')).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const wrapper = mount(Button, {
        props: {
          ariaLabel: 'Save document',
        },
      });

      expect(wrapper.attributes('aria-label')).toBe('Save document');
    });

    it('sets aria-disabled when disabled', () => {
      const wrapper = mount(Button, {
        props: {
          disabled: true,
        },
      });

      expect(wrapper.attributes('aria-disabled')).toBe('true');
    });

    it('sets aria-disabled when loading', () => {
      const wrapper = mount(Button, {
        props: {
          loading: true,
        },
      });

      expect(wrapper.attributes('aria-disabled')).toBe('true');
    });
  });

  describe('BEM Classes', () => {
    it('uses useClassName utility correctly', () => {
      const wrapper = mount(Button, {
        props: {
          variant: ButtonVariant.Primary,
          size: ButtonSize.Large,
          disabled: true,
        },
      });

      // Test BEM class structure
      expect(wrapper.classes()).toContain('button');
      expect(wrapper.classes()).toContain('button--primary');
      expect(wrapper.classes()).toContain('button--large');
      expect(wrapper.classes()).toContain('button--disabled');
    });
  });
});
```

### Integration Test Example

```typescript
// components/ui/Modal/Modal.integration.test.ts
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Modal from './Modal.vue';
import Button from '../Button/Button.vue';

describe('Modal Integration', () => {
  it('integrates with Button component', async () => {
    const wrapper = mount({
      components: { Modal, Button },
      template: `
        <div>
          <Button @click="showModal = true">Open Modal</Button>
          <Modal v-model="showModal" title="Test Modal">
            <p>Modal content</p>
            <template #footer>
              <Button @click="showModal = false">Close</Button>
            </template>
          </Modal>
        </div>
      `,
      data() {
        return {
          showModal: false,
        };
      },
    });

    // Initially modal should be hidden
    expect(wrapper.find('.modal').exists()).toBe(false);

    // Click button to open modal
    await wrapper.findComponent(Button).trigger('click');
    await nextTick();

    // Modal should be visible
    expect(wrapper.find('.modal').exists()).toBe(true);
    expect(wrapper.find('.modal__title').text()).toBe('Test Modal');

    // Click close button
    const closeButton = wrapper.findAllComponents(Button)[1];
    await closeButton.trigger('click');
    await nextTick();

    // Modal should be hidden
    expect(wrapper.find('.modal').exists()).toBe(false);
  });
});
```

## Utility Testing

### BEM ClassName Utility Tests

```typescript
// utils/useClassName.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { useClassName } from './useClassName';

describe('useClassName', () => {
  it('generates basic block class', () => {
    const { cn } = useClassName('button');
    expect(cn.b()).toBe('button');
  });

  it('generates element classes', () => {
    const { cn } = useClassName('button');
    expect(cn.e('text')).toBe('button__text');
    expect(cn.e('icon')).toBe('button__icon');
  });

  it('generates modifier classes', () => {
    const { cn } = useClassName('button');
    expect(cn.m('primary')).toBe('button button--primary');
    expect(cn.m(['primary', 'large'])).toBe('button button--primary button--large');
  });

  it('handles conditional modifiers', () => {
    const { cn } = useClassName('button');
    const result = cn.b({ primary: true, disabled: false, loading: true });

    expect(result).toContain('button');
    expect(result).toContain('button--primary');
    expect(result).toContain('button--loading');
    expect(result).not.toContain('button--disabled');
  });

  it('supports custom prefix', () => {
    const { cn } = useClassName('button', { prefix: 'ui' });
    expect(cn.b()).toBe('ui-button');
    expect(cn.e('text')).toBe('ui-button__text');
  });

  it('works with element modifiers', () => {
    const { cn } = useClassName('button');
    expect(cn.e('icon').m('right')).toBe('button__icon button__icon--right');
  });
});
```

## Visual Regression Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:6006', // Storybook URL
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Visual Test Example

```typescript
// tests/visual/button.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Button Visual Tests', () => {
  test('button variants', async ({ page }) => {
    await page.goto('/story/components-button--variants');

    // Wait for components to load
    await page.waitForSelector('.button');

    // Take screenshot of all variants
    await expect(page.locator('[data-testid="button-variants"]')).toHaveScreenshot(
      'button-variants.png'
    );
  });

  test('button sizes', async ({ page }) => {
    await page.goto('/story/components-button--sizes');

    await expect(page.locator('[data-testid="button-sizes"]')).toHaveScreenshot('button-sizes.png');
  });

  test('button states', async ({ page }) => {
    await page.goto('/story/components-button--states');

    // Test hover state
    await page.hover('.button--primary');
    await expect(page.locator('[data-testid="button-states"]')).toHaveScreenshot(
      'button-states-hover.png'
    );

    // Test focus state
    await page.focus('.button--primary');
    await expect(page.locator('[data-testid="button-states"]')).toHaveScreenshot(
      'button-states-focus.png'
    );
  });

  test('dark theme', async ({ page }) => {
    await page.goto('/story/components-button--variants');

    // Switch to dark theme
    await page.click('[title="Change the theme of the preview"]');
    await page.click('text=dark');

    await expect(page.locator('[data-testid="button-variants"]')).toHaveScreenshot(
      'button-variants-dark.png'
    );
  });
});
```

## Accessibility Testing

### Axe Integration

```typescript
// tests/accessibility/button.a11y.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from '@/components/ui/Button/Button.vue';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('has no accessibility violations', async () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me',
      },
    });

    const results = await axe(wrapper.element);
    expect(results).toHaveNoViolations();
  });

  it('is accessible when disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true,
      },
      slots: {
        default: 'Disabled button',
      },
    });

    const results = await axe(wrapper.element);
    expect(results).toHaveNoViolations();
  });

  it('is accessible with custom aria-label', async () => {
    const wrapper = mount(Button, {
      props: {
        ariaLabel: 'Save document',
      },
      slots: {
        default: 'Save',
      },
    });

    const results = await axe(wrapper.element);
    expect(results).toHaveNoViolations();
  });
});
```

### Keyboard Navigation Tests

```typescript
// tests/accessibility/keyboard-navigation.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '@/components/ui/Button/Button.vue';

describe('Keyboard Navigation', () => {
  it('supports Enter key activation', async () => {
    const wrapper = mount(Button, {
      props: {
        tag: 'div', // Non-button element
      },
    });

    await wrapper.trigger('keydown.enter');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('supports Space key activation', async () => {
    const wrapper = mount(Button, {
      props: {
        tag: 'div',
      },
    });

    await wrapper.trigger('keydown.space');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('prevents default for Space key', async () => {
    const wrapper = mount(Button, {
      props: {
        tag: 'div',
      },
    });

    const event = new KeyboardEvent('keydown', { key: ' ' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    wrapper.element.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
```

## Performance Testing

### Component Performance Tests

```typescript
// tests/performance/button.perf.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { performance } from 'perf_hooks';
import Button from '@/components/ui/Button/Button.vue';

describe('Button Performance', () => {
  it('renders within performance budget', () => {
    const start = performance.now();

    // Mount 100 buttons
    const wrappers = Array.from({ length: 100 }, () =>
      mount(Button, {
        slots: { default: 'Test Button' },
      })
    );

    const end = performance.now();
    const duration = end - start;

    // Should render 100 buttons in under 100ms
    expect(duration).toBeLessThan(100);

    // Cleanup
    wrappers.forEach(wrapper => wrapper.unmount());
  });

  it('updates props efficiently', async () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary',
      },
    });

    const start = performance.now();

    // Update props multiple times
    for (let i = 0; i < 100; i++) {
      await wrapper.setProps({
        variant: i % 2 === 0 ? 'primary' : 'secondary',
      });
    }

    const end = performance.now();
    const duration = end - start;

    // Should update props efficiently
    expect(duration).toBeLessThan(50);
  });
});
```

## E2E Testing

### End-to-End Test Example

```typescript
// tests/e2e/component-installation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Component Installation Flow', () => {
  test('installs button component via CLI', async ({ page }) => {
    // This would test the actual CLI in a real project
    await page.goto('/playground');

    // Test that installed button works correctly
    await page.click('[data-testid="install-button"]');
    await page.waitForSelector('.button');

    // Test button functionality
    await page.click('.button--primary');
    await expect(page.locator('[data-testid="click-count"]')).toHaveText('1');
  });

  test('customizes button theme', async ({ page }) => {
    await page.goto('/playground/theming');

    // Change theme variables
    await page.fill('[data-testid="primary-color"]', '#ff0000');
    await page.click('[data-testid="apply-theme"]');

    // Verify button color changed
    const button = page.locator('.button--primary');
    const bgColor = await button.evaluate(el => getComputedStyle(el).backgroundColor);

    expect(bgColor).toBe('rgb(255, 0, 0)');
  });
});
```

## Test Organization

### Test File Structure

```
tests/
├── unit/                     # Unit tests
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button/
│   │   │   │   ├── Button.test.ts
│   │   │   │   └── Button.types.test.ts
│   │   │   └── Input/
│   │   └── blocks/
│   └── utils/
│       ├── useClassName.test.ts
│       └── spacing.test.ts
├── integration/              # Integration tests
│   ├── component-interactions.test.ts
│   └── form-workflows.test.ts
├── visual/                   # Visual regression tests
│   ├── button.spec.ts
│   ├── modal.spec.ts
│   └── theme-switching.spec.ts
├── accessibility/            # A11y tests
│   ├── button.a11y.test.ts
│   ├── modal.a11y.test.ts
│   └── keyboard-navigation.test.ts
├── performance/              # Performance tests
│   ├── button.perf.test.ts
│   └── large-lists.perf.test.ts
└── e2e/                     # End-to-end tests
    ├── cli-workflow.spec.ts
    ├── component-installation.spec.ts
    └── theming.spec.ts
```

### Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:dev": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:visual": "playwright test",
    "test:a11y": "vitest run tests/accessibility",
    "test:perf": "vitest run tests/performance",
    "test:e2e": "playwright test tests/e2e",
    "test:all": "pnpm test && pnpm test:visual && pnpm test:e2e"
  }
}
```

## CI Testing Pipeline

### Test Matrix

```yaml
# .github/workflows/test.yml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [18, 20]
    browser: [chromium, firefox, webkit]

steps:
  - name: Run unit tests
    run: pnpm test:coverage

  - name: Run visual tests
    run: pnpm test:visual --project=${{ matrix.browser }}

  - name: Run accessibility tests
    run: pnpm test:a11y

  - name: Run performance tests
    run: pnpm test:perf
```

This comprehensive testing strategy ensures high quality, accessibility, and performance across all
components in the meduza-ui library.
