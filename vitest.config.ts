import inspector from 'node:inspector';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**'],
      exclude: ['**/*.browser.ts'],
    },
    // https://stackoverflow.com/a/67445850
    // if we are debugging tests, we don't want to timeout
    // else we want the default timeout
    testTimeout: inspector.url() ? 0 : undefined,
  },
});
