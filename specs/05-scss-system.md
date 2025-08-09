# SCSS System Specification

## Overview

Comprehensive SCSS architecture for meduza-ui, implementing BEM methodology with pixel-based
spacing, design tokens, and 4px-based spacing system.

## Architecture Principles

1. **Pixel-based Design**: All measurements in pixels, no rem/em units
2. **4px Spacing Grid**: All spacing values must be multiples of 4px
3. **BEM Methodology**: Block-Element-Modifier naming convention
4. **Design Tokens**: CSS custom properties for theming
5. **Component Isolation**: Scoped component styles with global utilities
6. **Performance**: Optimized CSS output with minimal specificity

## Directory Structure

```
styles/
├── _settings.scss              # Global configuration
├── _tokens.scss                # Design tokens (CSS custom properties)
├── _functions.scss             # SCSS functions
├── _mixins.scss                # SCSS mixins
├── _reset.scss                 # CSS reset/normalize
├── _utilities.scss             # Utility classes
├── _layout.scss                # Layout utilities
├── components/                 # Component-specific styles
│   ├── _button.scss
│   ├── _input.scss
│   ├── _modal.scss
│   └── ...
├── themes/                     # Theme variations
│   ├── _default.scss
│   ├── _dark.scss
│   └── _custom.scss
└── main.scss                   # Main entry point
```

## Design Tokens System

### Core Tokens

```scss
// _tokens.scss
:root {
  // === SPACING SYSTEM (4px grid) ===
  --spacing-1: 4px; // 1 unit
  --spacing-2: 8px; // 2 units
  --spacing-3: 12px; // 3 units
  --spacing-4: 16px; // 4 units
  --spacing-5: 20px; // 5 units
  --spacing-6: 24px; // 6 units
  --spacing-8: 32px; // 8 units
  --spacing-10: 40px; // 10 units
  --spacing-12: 48px; // 12 units
  --spacing-16: 64px; // 16 units
  --spacing-20: 80px; // 20 units
  --spacing-24: 96px; // 24 units
  --spacing-32: 128px; // 32 units

  // === COLOR SYSTEM ===
  // Primary colors
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  // Semantic colors
  --color-background: #ffffff;
  --color-foreground: #0f172a;
  --color-muted: #f1f5f9;
  --color-muted-foreground: #64748b;
  --color-border: #e2e8f0;
  --color-input: #ffffff;
  --color-ring: #3b82f6;

  // State colors
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #06b6d4;

  // === TYPOGRAPHY ===
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 30px;
  --font-size-4xl: 36px;

  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  // === SIZING ===
  --border-radius-none: 0px;
  --border-radius-sm: 2px;
  --border-radius: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 8px;
  --border-radius-xl: 12px;
  --border-radius-full: 9999px;

  --border-width: 1px;
  --border-width-2: 2px;
  --border-width-4: 4px;

  // === SHADOWS ===
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  // === TRANSITIONS ===
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;

  // === Z-INDEX ===
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;
}

// Dark theme
:root[data-theme='dark'] {
  --color-background: #0f172a;
  --color-foreground: #f1f5f9;
  --color-muted: #1e293b;
  --color-muted-foreground: #94a3b8;
  --color-border: #334155;
  --color-input: #1e293b;
}
```

### Component-Specific Tokens

```scss
// Component tokens extend base tokens
:root {
  // Button component tokens
  --button-padding-x: var(--spacing-4);
  --button-padding-y: var(--spacing-2);
  --button-padding-x-sm: var(--spacing-3);
  --button-padding-y-sm: var(--spacing-1);
  --button-padding-x-lg: var(--spacing-6);
  --button-padding-y-lg: var(--spacing-3);
  --button-border-radius: var(--border-radius);
  --button-font-weight: var(--font-weight-medium);
  --button-transition: var(--transition-fast);

  // Input component tokens
  --input-padding-x: var(--spacing-3);
  --input-padding-y: var(--spacing-2);
  --input-border-radius: var(--border-radius);
  --input-border-width: var(--border-width);
  --input-height: var(--spacing-10);
  --input-height-sm: var(--spacing-8);
  --input-height-lg: var(--spacing-12);

  // Modal component tokens
  --modal-backdrop-color: rgba(0, 0, 0, 0.5);
  --modal-border-radius: var(--border-radius-lg);
  --modal-padding: var(--spacing-6);
  --modal-max-width: 512px;
}
```

## SCSS Functions

```scss
// _functions.scss

// Spacing function - enforces 4px grid
@function spacing($multiplier) {
  @if type-of($multiplier) != number {
    @error "spacing() function expects a number, got #{type-of($multiplier)}";
  }

  @if $multiplier < 0 {
    @error "spacing() function expects a positive number, got #{$multiplier}";
  }

  @return $multiplier * 4px;
}

// BEM selector functions
@function bem-block($block, $prefix: '') {
  @if $prefix != '' {
    @return '.#{$prefix}-#{$block}';
  }
  @return '.#{$block}';
}

@function bem-element($block, $element, $prefix: '') {
  @return '#{bem-block($block, $prefix)}__#{$element}';
}

@function bem-modifier($block, $modifier, $prefix: '') {
  @return '#{bem-block($block, $prefix)}--#{$modifier}';
}

// Color contrast function
@function get-contrast-color($background) {
  @if lightness($background) > 50% {
    @return var(--color-foreground);
  } @else {
    @return var(--color-background);
  }
}

// Fluid typography function
@function fluid-size($min-size, $max-size, $min-vw: 375px, $max-vw: 1200px) {
  @return clamp(
    #{$min-size},
    #{$min-size} + (#{$max-size} - #{$min-size}) *
      ((100vw - #{$min-vw}) / (#{$max-vw} - #{$min-vw})),
    #{$max-size}
  );
}
```

## SCSS Mixins

```scss
// _mixins.scss

// === BEM MIXINS ===
@mixin bem-block($block, $prefix: '') {
  #{bem-block($block, $prefix)} {
    @content;
  }
}

@mixin bem-element($element) {
  &__#{$element} {
    @content;
  }
}

@mixin bem-modifier($modifier) {
  &--#{$modifier} {
    @content;
  }
}

// === UTILITY MIXINS ===
@mixin reset-button {
  appearance: none;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  text-align: inherit;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

@mixin reset-input {
  appearance: none;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  font: inherit;
  color: inherit;

  &:focus {
    outline: none;
  }
}

@mixin focus-ring($color: var(--color-ring), $width: 2px, $offset: 2px) {
  &:focus-visible {
    outline: #{$width} solid #{$color};
    outline-offset: #{$offset};
  }
}

@mixin visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

// === LAYOUT MIXINS ===
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin container($max-width: 1200px, $padding: var(--spacing-4)) {
  width: 100%;
  max-width: #{$max-width};
  margin: 0 auto;
  padding-left: #{$padding};
  padding-right: #{$padding};
}

// === RESPONSIVE MIXINS ===
@mixin mobile-only {
  @media (max-width: 767px) {
    @content;
  }
}

@mixin tablet-up {
  @media (min-width: 768px) {
    @content;
  }
}

@mixin desktop-up {
  @media (min-width: 1024px) {
    @content;
  }
}

@mixin large-desktop-up {
  @media (min-width: 1200px) {
    @content;
  }
}

// === ANIMATION MIXINS ===
@mixin fade-in($duration: var(--transition-normal)) {
  animation: fade-in #{$duration} ease forwards;
}

@mixin slide-up($duration: var(--transition-normal), $distance: var(--spacing-4)) {
  animation: slide-up #{$duration} ease forwards;

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(#{$distance});
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

@mixin bounce-in($duration: var(--transition-slow)) {
  animation: bounce-in #{$duration} cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;

  @keyframes bounce-in {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
}

// === STATE MIXINS ===
@mixin disabled-state {
  &:disabled,
  &[aria-disabled='true'],
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

@mixin loading-state {
  &--loading {
    cursor: wait;
    pointer-events: none;

    * {
      opacity: 0.7;
    }
  }
}

// === INTERACTION MIXINS ===
@mixin hover-lift($distance: 2px, $shadow: var(--shadow-md)) {
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);

  &:hover {
    transform: translateY(-#{$distance});
    box-shadow: #{$shadow};
  }
}

@mixin button-press {
  &:active {
    transform: scale(0.98);
  }
}
```

## Component Style Structure

### Button Component Example

```scss
// components/_button.scss
@include bem-block('button') {
  @include reset-button;
  @include focus-ring;
  @include disabled-state;
  @include loading-state;
  @include button-press;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);

  font-family: var(--font-family-sans);
  font-weight: var(--button-font-weight);
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;

  border: var(--border-width) solid transparent;
  border-radius: var(--button-border-radius);
  cursor: pointer;
  transition: var(--button-transition);

  // === SIZE MODIFIERS ===
  @include bem-modifier('small') {
    padding: var(--button-padding-y-sm) var(--button-padding-x-sm);
    font-size: var(--font-size-sm);
    min-height: spacing(8); // 32px
  }

  @include bem-modifier('medium') {
    padding: var(--button-padding-y) var(--button-padding-x);
    font-size: var(--font-size-base);
    min-height: spacing(10); // 40px
  }

  @include bem-modifier('large') {
    padding: var(--button-padding-y-lg) var(--button-padding-x-lg);
    font-size: var(--font-size-lg);
    min-height: spacing(12); // 48px
  }

  // === VARIANT MODIFIERS ===
  @include bem-modifier('primary') {
    background-color: var(--color-primary-600);
    color: white;

    &:hover:not(:disabled) {
      background-color: var(--color-primary-700);
    }

    &:active:not(:disabled) {
      background-color: var(--color-primary-800);
    }
  }

  @include bem-modifier('secondary') {
    background-color: var(--color-muted);
    color: var(--color-foreground);

    &:hover:not(:disabled) {
      background-color: var(--color-muted-foreground);
      color: var(--color-background);
    }
  }

  @include bem-modifier('outline') {
    background-color: transparent;
    color: var(--color-primary-600);
    border-color: var(--color-primary-600);

    &:hover:not(:disabled) {
      background-color: var(--color-primary-600);
      color: white;
    }
  }

  @include bem-modifier('ghost') {
    background-color: transparent;
    color: var(--color-foreground);

    &:hover:not(:disabled) {
      background-color: var(--color-muted);
    }
  }

  @include bem-modifier('danger') {
    background-color: var(--color-danger);
    color: white;

    &:hover:not(:disabled) {
      background-color: darken(var(--color-danger), 10%);
    }
  }

  // === ELEMENTS ===
  @include bem-element('text') {
    display: inline-flex;
    align-items: center;
  }

  @include bem-element('icon') {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;

    @include bem-modifier('left') {
      order: -1;
    }

    @include bem-modifier('right') {
      order: 1;
    }
  }

  @include bem-element('spinner') {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
```

## Utility Classes

```scss
// _utilities.scss

// === SPACING UTILITIES ===
@each $key,
  $value
    in (
      '1': var(--spacing-1),
      '2': var(--spacing-2),
      '3': var(--spacing-3),
      '4': var(--spacing-4),
      '5': var(--spacing-5),
      '6': var(--spacing-6),
      '8': var(--spacing-8),
      '10': var(--spacing-10),
      '12': var(--spacing-12),
      '16': var(--spacing-16),
      '20': var(--spacing-20),
      '24': var(--spacing-24),
      '32': var(--spacing-32)
    )
{
  .m-#{$key} {
    margin: #{$value} !important;
  }
  .mt-#{$key} {
    margin-top: #{$value} !important;
  }
  .mr-#{$key} {
    margin-right: #{$value} !important;
  }
  .mb-#{$key} {
    margin-bottom: #{$value} !important;
  }
  .ml-#{$key} {
    margin-left: #{$value} !important;
  }
  .mx-#{$key} {
    margin-left: #{$value} !important;
    margin-right: #{$value} !important;
  }
  .my-#{$key} {
    margin-top: #{$value} !important;
    margin-bottom: #{$value} !important;
  }

  .p-#{$key} {
    padding: #{$value} !important;
  }
  .pt-#{$key} {
    padding-top: #{$value} !important;
  }
  .pr-#{$key} {
    padding-right: #{$value} !important;
  }
  .pb-#{$key} {
    padding-bottom: #{$value} !important;
  }
  .pl-#{$key} {
    padding-left: #{$value} !important;
  }
  .px-#{$key} {
    padding-left: #{$value} !important;
    padding-right: #{$value} !important;
  }
  .py-#{$key} {
    padding-top: #{$value} !important;
    padding-bottom: #{$value} !important;
  }

  .gap-#{$key} {
    gap: #{$value} !important;
  }
}

// === TYPOGRAPHY UTILITIES ===
.text-xs {
  font-size: var(--font-size-xs) !important;
}
.text-sm {
  font-size: var(--font-size-sm) !important;
}
.text-base {
  font-size: var(--font-size-base) !important;
}
.text-lg {
  font-size: var(--font-size-lg) !important;
}
.text-xl {
  font-size: var(--font-size-xl) !important;
}
.text-2xl {
  font-size: var(--font-size-2xl) !important;
}

.font-light {
  font-weight: var(--font-weight-light) !important;
}
.font-normal {
  font-weight: var(--font-weight-normal) !important;
}
.font-medium {
  font-weight: var(--font-weight-medium) !important;
}
.font-semibold {
  font-weight: var(--font-weight-semibold) !important;
}
.font-bold {
  font-weight: var(--font-weight-bold) !important;
}

// === FLEXBOX UTILITIES ===
.flex {
  display: flex !important;
}
.inline-flex {
  display: inline-flex !important;
}
.flex-col {
  flex-direction: column !important;
}
.flex-row {
  flex-direction: row !important;
}
.flex-wrap {
  flex-wrap: wrap !important;
}
.flex-nowrap {
  flex-wrap: nowrap !important;
}

.items-start {
  align-items: flex-start !important;
}
.items-center {
  align-items: center !important;
}
.items-end {
  align-items: flex-end !important;
}
.items-stretch {
  align-items: stretch !important;
}

.justify-start {
  justify-content: flex-start !important;
}
.justify-center {
  justify-content: center !important;
}
.justify-end {
  justify-content: flex-end !important;
}
.justify-between {
  justify-content: space-between !important;
}
.justify-around {
  justify-content: space-around !important;
}

// === ACCESSIBILITY UTILITIES ===
.sr-only {
  @include visually-hidden;
}

.focus-ring {
  @include focus-ring;
}
```

## Build Configuration

### Main SCSS Entry Point

```scss
// main.scss
// Settings and configuration
@import 'settings';

// Functions and mixins (no output)
@import 'functions';
@import 'mixins';

// Base styles
@import 'tokens';
@import 'reset';

// Layout and utilities
@import 'layout';
@import 'utilities';

// Components
@import 'components/button';
@import 'components/input';
@import 'components/modal';
// ... other components

// Themes (conditional)
@import 'themes/default';

[data-theme='dark'] {
  @import 'themes/dark';
}
```

### Build Tools Integration

```javascript
// vite.config.js - Vite configuration
export default {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/_functions.scss";
          @import "@/styles/_mixins.scss";
          @import "@/styles/_tokens.scss";
        `
      }
    }
  }
}

// nuxt.config.ts - Nuxt configuration
export default defineNuxtConfig({
  css: ['@/styles/main.scss'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/styles/_functions.scss";
            @import "@/styles/_mixins.scss";
            @import "@/styles/_tokens.scss";
          `
        }
      }
    }
  }
})
```

## Performance Optimization

1. **Critical CSS**: Extract component styles for above-the-fold content
2. **Tree Shaking**: Remove unused utility classes
3. **Compression**: Minify CSS output
4. **Caching**: Version CSS files for long-term caching
5. **Lazy Loading**: Load component styles on demand

## Validation and Linting

```json
// .stylelintrc.json
{
  "extends": ["stylelint-config-standard-scss", "stylelint-config-recess-order"],
  "rules": {
    "unit-allowed-list": ["px", "%", "deg", "s", "ms", "vh", "vw"],
    "declaration-property-value-allowed-list": {
      "/^margin/": ["/^\\d+px$/", "0", "auto"],
      "/^padding/": ["/^\\d+px$/", "0"],
      "/^gap/": ["/^\\d+px$/", "0"]
    },
    "custom-property-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$"
  }
}
```

This SCSS system provides a robust foundation for building consistent, maintainable, and performant
stylesheets following BEM methodology with the 4px spacing system.
