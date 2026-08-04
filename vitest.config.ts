import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    // These suites talk to a real Postgres — they exist to prove tenant
    // isolation, and a mocked database would prove nothing about it.
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Tenant tests share one seeded dataset; running them in parallel would
    // let one file's writes race another's assertions.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
