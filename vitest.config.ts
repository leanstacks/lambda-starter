import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/cdk.out/**'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['json', 'json-summary', 'lcov', 'text', 'clover'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**', '**/dist/**', '**/cdk.out/**', '**/*.config.ts'],
    },
  },
});
