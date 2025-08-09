import { defineConfig } from 'eslint-config-fans';

export default defineConfig(
  {
    typescript: true,
    vue: true,
    prettier: true,
    test: true,
    perfectionist: true,
    strict: true,
    ignores: [
      'dist/**',
      'build/**',
      '.output/**',
      '.nuxt/**',
      '.next/**',
      'coverage/**',
      'templates/**',
      '*.d.ts',
      'auto-imports.d.ts',
      'components.d.ts',
    ],
  },
  {
    rules: {
      quotes: [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
      curly: 'off',
    },
  }
);
