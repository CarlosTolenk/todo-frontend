/// <reference types="vitest" />

// @ts-ignore
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

// @ts-ignore
export default defineConfig(({ mode }) => ({
  plugins: [angular()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage/atomchat-tasks',
      include: ['src/app/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/test-setup.ts'],
    },
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
