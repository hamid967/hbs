import { expect, test } from "@playwright/test";

// المسارات العامة تُفتح بـ domcontentloaded: التطبيق تطبيق صفحة واحدة، وانتظار
// حدث load يعلّق الاختبار في البيئات التي تُحجب فيها الموارد الخارجية.
const open = (path: string) => ({ path, waitUntil: "domcontentloaded" as const });

test("يقدّم مسار تسجيل ذاتي كاملاً من الدخول دون تدخل أدمن", async ({ page }) => {
  const options = open("/login");
  await page.goto(options.path, { waitUntil: options.waitUntil });

  // الدخول يعرض المدخلين إلى التسجيل الذاتي واستعادة كلمة المرور
  await expect(page.getByRole("heading", { name: "الدخول بالبريد" })).toBeVisible();
  await page.getByRole("button", { name: "أنشئ حساب منشأة جديد" }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("heading", { name: "سجّل منشأتك" })).toBeVisible();

  // كل حقول التسجيل مرتبطة بتسمياتها ارتباطاً برمجياً
  await expect(page.getByLabel(/الاسم الكامل/)).toBeVisible();
  await expect(page.getByLabel(/بريد العمل/)).toBeVisible();
  await expect(page.getByLabel(/اسم المنشأة/)).toBeVisible();
  await expect(page.getByLabel(/^كلمة المرور/)).toBeVisible();

  // مؤشر قوة كلمة المرور يستجيب للإدخال
  await page.getByLabel(/^كلمة المرور/).fill("Rakiza-9x-Falak");
  await expect(page.getByText(/قوة كلمة المرور/)).toBeVisible();

  // عدم التطابق يُمنع في الواجهة قبل أي نداء للخادم
  await page.getByLabel(/تأكيد كلمة المرور/).fill("Rakiza-9x-Falakk");
  await expect(page.getByRole("alert").filter({ hasText: "غير متطابقتين" })).toBeVisible();
});

// اختبار لكل صفحة: كل تنقّل في هذه المسارات يبني حزمته عند الطلب، وجمعها في
// اختبار واحد يستهلك مهلته قبل أن تُفحص الصفحة الأخيرة.
test("تعرض صفحة الاستعادة نموذج طلب الرابط", async ({ page }) => {
  await page.goto("/forgot-password", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "نسيت كلمة المرور" })).toBeVisible();
  await expect(page.getByRole("button", { name: "أرسل رابط الاستعادة" })).toBeVisible();
});

test("تعلن صفحة التأكيد نقص الرمز وتعطّل الإجراء", async ({ page }) => {
  await page.goto("/verify-email", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("alert")).toContainText("رابط التأكيد غير مكتمل");
  await expect(page.getByRole("button", { name: "أكّد بريدي" })).toBeDisabled();
});

test("تعلن صفحة ضبط كلمة المرور نقص الرمز", async ({ page }) => {
  await page.goto("/reset-password", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("alert")).toContainText("رابط الاستعادة غير مكتمل");
  await expect(page.getByRole("button", { name: "احفظ كلمة المرور" })).toBeDisabled();
});
