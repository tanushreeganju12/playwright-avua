import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: !process.env.RENDER,
  workers: process.env.RENDER ? 1 : undefined,
  timeout: 60000,
  retries: 1,
  reporter: [
    ['html'],
    ['./utils/jiraReporter.ts']
  ],
  use: {
    baseURL: 'https://demo.avua.online',
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    viewport: null,
    launchOptions: {
      args: ['--start-maximized']
    },
  },
});
