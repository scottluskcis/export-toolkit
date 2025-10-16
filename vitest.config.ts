import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,

    // Environment for tests
    environment: 'node',

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 50,
        statements: 80,
      },
    },

    // Test file patterns
    include: ['src/**/*.{test,spec}.ts'],

    // Watch mode options
    watchExclude: ['**/node_modules/**', '**/dist/**'],

    // Timeout
    testTimeout: 10000,
  },
});
