import { expect, test } from "@playwright/test";

test("يعيد /app المستخدم غير الموثق إلى بوابة OAuth من دون أخطاء Hook", async ({ page }) => {
  const hookErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/Invalid hook call|useMemo/.test(text)) hookErrors.push(text);
  });

  await page.route("**/app-auth**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>OAuth gate intercepted</title><main>OAuth gate intercepted</main>",
    });
  });

  await page.goto("/app");

  const loginButton = page.getByRole("button", { name: "تسجيل الدخول للمنصة" });
  await expect(loginButton).toBeVisible();
  await loginButton.click();

  await expect(page).toHaveTitle("OAuth gate intercepted");
  expect(hookErrors).toEqual([]);
});
