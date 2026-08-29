import { defineConfig, devices } from '@playwright/test';

const nodeExecutable = `"${process.execPath}"`;
const nextCommand = `${nodeExecutable} node_modules/next/dist/bin/next`;
const firebaseCommand = `${nodeExecutable} node_modules/firebase-tools/lib/bin/firebase.js`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `${firebaseCommand} emulators:exec --project vasco-e2e --only auth "${nextCommand} build && ${nextCommand} start"`,
    env: {
      ...process.env,
      FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
      FIREBASE_ADMIN_PROJECT_ID: 'vasco-e2e',
    },
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
