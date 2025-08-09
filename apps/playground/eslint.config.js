import { defineConfig } from 'eslint-config-fans';

export default defineConfig(
  {
    typescript: true,
    strict: true,
    ignores: ['dist/**', 'build/**'],
  },
  {
    rules: {
      quotes: [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
    },
    curly: 'off',
  }
);
