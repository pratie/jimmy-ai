/**
 * Stands in for the `server-only` package under Vitest.
 *
 * The real module exists to blow up if server code is pulled into a client
 * bundle. The test runner is neither, so importing it would fail every suite
 * that touches a `import 'server-only'` file — see the alias in
 * `vitest.config.ts`.
 */
export {}
