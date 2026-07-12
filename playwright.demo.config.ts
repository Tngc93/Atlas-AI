import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3200";

export default defineConfig({
  testDir: "./e2e-demo",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [["list"]],
  use: { baseURL, trace: "on-first-retry" },
  workers: 1,
  webServer: {
    command: "node scripts/demo-e2e-webserver.mjs",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [{ name: "chromium-demo", use: { ...devices["Desktop Chrome"] } }],
});
