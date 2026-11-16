import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const apiDb = path.resolve('tests/.data/api.db');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    projects: [
      {
        resolve: {
          alias: { '@': path.resolve(__dirname) },
        },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        resolve: {
          alias: { '@': path.resolve(__dirname) },
        },
        test: {
          name: 'api',
          environment: 'node',
          include: ['tests/api/**/*.test.ts'],
          env: { DATABASE_URL: apiDb },
          globalSetup: ['./tests/api/global-setup.ts'],
        },
      },
      {
        plugins: [react()],
        resolve: {
          alias: { '@': path.resolve(__dirname) },
        },
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: ['tests/ui/**/*.test.tsx'],
          setupFiles: ['./tests/ui/setup.ts'],
        },
      },
    ],
  },
});
