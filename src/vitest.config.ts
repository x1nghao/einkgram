import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default defineConfig((configEnv) => mergeConfig(
  viteConfig(configEnv),
  {
    define: {
      APP_REVISION: JSON.stringify('vitest-test'),
      APP_VERSION: JSON.stringify('0.0.1'),
    },
    test: {
      environment: 'jsdom',
      exclude: [
        ...configDefaults.exclude,
        'tests/playwright/**',
      ],
      setupFiles: ['./tests/init.ts'],
      // Einkgram: explicit localStorage quota.
      //
      // jsdom 21+ defaults `storageQuota` to 0, which causes
      // `localStorage.clear()` to throw or silently no-op on
      // some platforms. Set it to a real number (10 MB) so
      // our panels.test.ts can clear the store reliably.
      //
      // (See review note: tests passing 73/73 in our env but
      // failing on fresh checkouts without this.)
      environmentOptions: {
        jsdom: {
          storageQuota: 10_000_000,
        },
      },
    },
  },
));
