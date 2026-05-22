import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    // Multiple test files patch the same shared fixture (tests/fixtures/claude-os/clients.yaml).
    // Running files in parallel causes race conditions on that shared file.
    // Sequential file execution ensures each file's beforeEach/afterEach pair is
    // atomic with respect to the shared fixture on disk.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
