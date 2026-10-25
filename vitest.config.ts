import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default defineConfig((configEnv) => mergeConfig(
  viteConfig(configEnv),
  {
    define: {
      APP_REVISION: JSON.stringify('vitest-test'),
      APP_VERSION: JSON.stringify('0.0.1'),
    },
    test: {
      environment: 'jsdom',
      // jsdom 21+ defaults localStorage quota to 0, breaking eink tests
      environmentOptions: {
        jsdom: {
          storageQuota: 10_000_000,
        },
      },
      exclude: [
        ...configDefaults.exclude,
        'tests/playwright/**',
      ],
      setupFiles: ['./tests/init.ts'],
    },
  },
));
