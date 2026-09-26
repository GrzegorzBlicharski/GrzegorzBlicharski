import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 180_000,
  use: {
    baseURL: 'http://localhost:4173',
    actionTimeout: 10_000,
    viewport: { width: 1440, height: 900 },
    launchOptions: { executablePath: process.env.PW_CHROMIUM ?? undefined },
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: true,
  },
});
