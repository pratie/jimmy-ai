import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Load .env.local here rather than relying on `node --env-file` in the npm
// script, so `npx vitest` and IDE test runners work identically. A suite that
// only passes when launched one specific way is a suite people stop running.
try {
  process.loadEnvFile('.env.local')
} catch {
  // Already loaded, or running in CI where the env is injected directly.
}

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
      // `server-only` throws the moment it is imported outside a React Server
      // Component, which is exactly right in the app and useless here: these
      // tests ARE the server. Stubbing it lets us exercise the real
      // `src/lib/widget/resolve.ts` instead of a copy of its logic.
      'server-only': fileURLToPath(new URL('./tests/helpers/server-only-stub.ts', import.meta.url)),
    },
  },
})
