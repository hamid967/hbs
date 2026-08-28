import { expect, test } from "@playwright/test";

test("يعرض /app بوابة HR HBS المحلية ولا يوجه إلى OAuth Manus", async ({ page }) => {
  const hookErrors: string[] = [];
  const manusNavigations: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/Invalid hook call|useMemo/.test(text)) hookErrors.push(text);
  });

  page.on("framenavigated", frame => { if (frame === page.mainFrame() && frame.url().includes("manus.im/app-auth")) manusNavigations.push(frame.url()); });

  await page.goto("/app");

  const loginButton = page.getByRole("button", { name: "الدخول بالبريد" });
  await expect(loginButton).toBeVisible();
  await loginButton.click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "الدخول بالبريد" })).toBeVisible();
  await expect(page.getByRole("button", { name: "تسجيل الدخول" })).toBeVisible();
  await expect(page.locator(".auth-spatial-scene")).toBeVisible();
  await page.goto("/subscribe");
  await expect(page.getByRole("heading", { name: "اطلب اشتراك المنشأة" })).toBeVisible();
  await page.goto("/activate");
  await expect(page.getByRole("alert")).toContainText("رابط الدعوة غير مكتمل");
  expect(hookErrors).toEqual([]);
  expect(manusNavigations).toEqual([]);
});

test("تظل بوابة التسجيل ثلاثية الأبعاد قابلة للاستخدام على الهاتف", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "الدخول بالبريد" })).toBeVisible();
  await expect(page.locator(".auth-spatial-scene")).toBeVisible();
  await expect(page.getByLabel("بريد العمل")).toBeVisible();
  await expect(page.getByLabel("كلمة المرور")).toBeVisible();
  expect(await page.locator("body").evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: "test-results/local-access-3d-mobile.png", fullPage: true });
});
