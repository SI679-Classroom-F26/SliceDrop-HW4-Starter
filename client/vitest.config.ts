import { defineConfig } from 'vitest/config';

// GIVEN: the tests run in Node, not a browser. src/api/__tests__/setup.ts
// gives them the one browser piece they need (sessionStorage), and every
// test fakes fetch -- no server needs to be running.
export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['src/api/__tests__/setup.ts'],
    // What import.meta.env.VITE_API_URL is in the tests. Not a real server:
    // nothing ever connects to it.
    env: { VITE_API_URL: 'http://slicedrop-server.test' }
  }
});
