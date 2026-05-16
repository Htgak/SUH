import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**']
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'tests/**/*.js', 'e2e/**/*.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  {
    files: ['tests/**/*.js', 'e2e/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
