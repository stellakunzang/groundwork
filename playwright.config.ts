import path from 'path';
import { defineConfig, devices } from '@playwright/test';

const dbFile = path.resolve('e2e/.data/groundwork.db');

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3210',
    viewport: { width: 1280, height: 800 },
    video: 'off',
  },
  webServer: {
    command: 'npx tsx e2e/prepare-db.ts && npx next dev -p 3210',
    url: 'http://localhost:3210',
    reuseExistingServer: false,
    timeout: 120_000,
    env: { DATABASE_URL: dbFile },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
