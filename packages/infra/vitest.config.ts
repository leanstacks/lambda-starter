import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config.js';

export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    test: {
      testTimeout: 30000, // CDK operations can take longer
      coverage: {
        include: ['**/*.ts'],
        exclude: ['app.ts'],
      },
    },
  }),
);
