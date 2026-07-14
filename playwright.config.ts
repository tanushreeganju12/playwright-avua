import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  retries: 1,
  reporter: process.env.CI ? [
    ['github'],
    ['./utils/githubSummaryReporter.ts'],
    ['html'],
    ['./utils/jiraReporter.ts']
  ] : [
    ['list'],
    ['html'],
    ['./utils/jiraReporter.ts']
  ],
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  use: {
    baseURL: 'https://demo.avua.online',
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    viewport: null,
    launchOptions: {
      args: ['--start-maximized']
    },
  },
});
