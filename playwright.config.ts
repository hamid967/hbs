import { defineConfig, devices } from "@playwright/test";

const e2ePort = Number(process.env.E2E_PORT ?? 4173);
const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  reporter: isCi ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${e2ePort}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `E2E_PORT=${e2ePort} PORT=${e2ePort} pnpm dev`,
    url: `http://127.0.0.1:${e2ePort}`,
    reuseExistingServer: !isCi,
    timeout: 120_000,
    env: {
      VITE_OAUTH_PORTAL_URL: "https://oauth.test",
      VITE_APP_ID: "e2e-test-app",
      VITE_ANALYTICS_ENDPOINT: "",
      VITE_ANALYTICS_WEBSITE_ID: "",
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: isCi ? {} : { executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] },
      },
    },
  ],
});
