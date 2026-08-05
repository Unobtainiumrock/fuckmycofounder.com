import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4317";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: true,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "line",
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: "pnpm build && pnpm serve:test",
          reuseExistingServer: false,
          timeout: 120_000,
          url: baseURL,
        },
      }),
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    ...(process.env.CI ? {} : { channel: "chrome" }),
    colorScheme: "light",
    trace: "retain-on-failure",
    viewport: { width: 1440, height: 900 },
  },
});
