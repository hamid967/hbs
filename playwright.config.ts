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
  // wrangler dev يقدّم أصولاً مبنية مسبقاً من dist/public، لا خادم Vite تطويرياً
  // حياً — لذا متغيّرات VITE_* يجب أن تُخبَز وقت vite build نفسه (تُقرأ من
  // process.env عبر import.meta.env)، لا أن تُمرَّر لعملية wrangler dev التي لا
  // تُعيد بناء العميل ولا تراها أصلاً. wrangler لا يقرأ PORT عاماً؛ يحتاج --port.
  webServer: {
    command: `VITE_OAUTH_PORTAL_URL=https://oauth.test VITE_APP_ID=e2e-test-app VITE_ANALYTICS_ENDPOINT= VITE_ANALYTICS_WEBSITE_ID= pnpm build && pnpm exec wrangler dev --port ${e2ePort}`,
    url: `http://127.0.0.1:${e2ePort}`,
    reuseExistingServer: !isCi,
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: isCi
          ? {}
          : { executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] },
      },
    },
  ],
});
