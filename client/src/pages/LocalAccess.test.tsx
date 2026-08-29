// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mutations = vi.hoisted(() => {
  const make = () => ({ mutate: vi.fn(), mutateAsync: vi.fn().mockResolvedValue(undefined), isPending: false, isSuccess: false, error: undefined as { message: string; data?: { code: string } } | undefined, data: undefined as unknown });
  return {
    login: make(), requestSubscription: make(), activateInvitation: make(),
    register: make(), verifyEmail: make(), resendVerification: make(),
    requestPasswordReset: make(), resetPassword: make(),
    googleLogin: make(),
  };
});

vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ auth: { me: { invalidate: vi.fn() } } }),
    localAccess: Object.fromEntries(Object.entries(mutations).map(([name, state]) => [name, { useMutation: () => state }])),
  },
}));

import { ActivateInvitation, ForgotPassword, LocalLogin, RegisterCompany, ResetPassword, SubscriptionRequest, VerifyEmail } from "./LocalAccess";

function reset() {
  for (const state of Object.values(mutations)) {
    state.mutate.mockReset();
    state.mutateAsync.mockReset().mockResolvedValue(undefined);
    state.isPending = false;
    state.isSuccess = false;
    state.error = undefined;
    state.data = undefined;
  }
}

beforeEach(reset);
afterEach(cleanup);

describe("صفحات الوصول العامة", () => {
  it("تعرض الدخول ومسارَي الاستعادة والتسجيل دون جلسة", () => {
    render(<LocalLogin />);
    expect(screen.getByRole("heading", { name: "الدخول بالبريد" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "تسجيل الدخول" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "نسيت كلمة المرور؟" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "أنشئ حساب منشأة جديد" })).toBeTruthy();
    expect(document.querySelector(".auth-spatial-scene")).toBeTruthy();
  });

  it("تعرض زر إعادة إرسال التأكيد فقط حين يكون سبب الرفض عدم التأكيد", () => {
    mutations.login.error = { message: "لم يُؤكَّد بريدك بعد.", data: { code: "FORBIDDEN" } };
    const { unmount } = render(<LocalLogin />);
    expect(screen.getByRole("button", { name: "أرسل رابط تأكيد جديد" })).toBeTruthy();
    unmount();
    mutations.login.error = { message: "بيانات الدخول غير صحيحة أو الحساب غير متاح", data: { code: "UNAUTHORIZED" } };
    render(<LocalLogin />);
    expect(screen.queryByRole("button", { name: "أرسل رابط تأكيد جديد" })).toBeNull();
    expect(screen.getByRole("alert").textContent).toContain("بيانات الدخول غير صحيحة");
  });

  it("تمنع إرسال التسجيل حين لا تتطابق كلمتا المرور", async () => {
    render(<RegisterCompany />);
    await userEvent.type(screen.getByLabelText(/الاسم الكامل/), "هدى");
    await userEvent.type(screen.getByLabelText(/بريد العمل/), "huda@example.test");
    await userEvent.type(screen.getByLabelText(/اسم المنشأة/), "منشأة الأفق");
    await userEvent.type(screen.getByLabelText(/^كلمة المرور/), "Rakiza-9x-Falak");
    await userEvent.type(screen.getByLabelText(/تأكيد كلمة المرور/), "Rakiza-9x-Falakk");
    expect(screen.getByRole("alert").textContent).toContain("غير متطابقتين");
    await userEvent.click(screen.getByRole("button", { name: "أنشئ الحساب" }));
    expect(mutations.register.mutateAsync).not.toHaveBeenCalled();
  });

  it("تخبر المستخدم صراحةً حين لم يُرسَل بريد التأكيد", () => {
    mutations.register.isSuccess = true;
    mutations.register.data = { registered: true, email: "huda@example.test", mailDelivered: false };
    const { unmount } = render(<RegisterCompany />);
    expect(screen.getByRole("note").textContent).toContain("ناقل البريد غير مهيّأ");
    unmount();
    mutations.register.data = { registered: true, email: "huda@example.test", mailDelivered: true };
    render(<RegisterCompany />);
    expect(screen.queryByRole("note")).toBeNull();
    expect(screen.getByText(/huda@example.test/)).toBeTruthy();
  });

  it("ترفض التأكيد حين ينقص الرمز من الرابط", () => {
    window.history.replaceState({}, "", "/verify-email");
    render(<VerifyEmail />);
    expect(screen.getByRole("alert").textContent).toContain("رابط التأكيد غير مكتمل");
    expect(screen.getByRole("button", { name: "أكّد بريدي" }).hasAttribute("disabled")).toBe(true);
  });

  it("تعرض شاشة الترحيب بعد نجاح التأكيد", () => {
    window.history.replaceState({}, "", "/verify-email?token=abc");
    mutations.verifyEmail.isSuccess = true;
    render(<VerifyEmail />);
    expect(screen.getByRole("heading", { name: "حسابك جاهز" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "ابدأ الإعداد" })).toBeTruthy();
  });

  it("تعطي رداً محايداً بعد طلب الاستعادة فلا تكشف تسجيل البريد", () => {
    mutations.requestPasswordReset.isSuccess = true;
    render(<ForgotPassword />);
    expect(screen.getByText(/إن كان هذا البريد مرتبطاً بحساب فعّال/)).toBeTruthy();
  });

  it("تطلب الدخول يدوياً بعد ضبط كلمة مرور جديدة", () => {
    window.history.replaceState({}, "", "/reset-password?token=abc");
    mutations.resetPassword.isSuccess = true;
    render(<ResetPassword />);
    expect(screen.getByRole("heading", { name: "ضُبطت كلمة المرور" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "تسجيل الدخول" })).toBeTruthy();
  });

  it("تبقي مسار الاشتراك المُدار ومسار الدعوة يعملان", () => {
    const { unmount } = render(<SubscriptionRequest />);
    expect(screen.getByRole("heading", { name: "اطلب اشتراك المنشأة" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "إرسال طلب الاشتراك" })).toBeTruthy();
    unmount();
    window.history.replaceState({}, "", "/activate");
    render(<ActivateInvitation />);
    expect(screen.getByRole("alert").textContent).toContain("رابط الدعوة غير مكتمل");
  });
});
