import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/test/**',
        '**/*.config.*',
        '**/node_modules/**'
      ],
      thresholds: {
        statements: 55,
        branches: 40,
        functions: 50,
        lines: 55
      }
    },
    testTimeout: 10000,
    retry: 0
  }
});
