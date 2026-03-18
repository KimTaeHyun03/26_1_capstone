import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: { headless: false, slowMo: 3000, launchOptions: { args: ['--start-maximized'] } },
});
