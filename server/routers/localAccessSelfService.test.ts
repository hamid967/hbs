import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  registerLocalAccount: vi.fn(),
  verifyEmailWithToken: vi.fn(),
  createEmailVerificationToken: vi.fn(),
  createPasswordResetToken: vi.fn(),
  resetPasswordWithToken: vi.fn(),
  getLocalCredentialByEmail: vi.fn(),
  recordLocalLoginFailure: vi.fn(),
  clearLocalLoginFailures: vi.fn(),
  activateLocalInvitation: vi.fn(),
  approveSubscriptionRequest: vi.fn(),
  createSubscriptionRequest: vi.fn(),
  listProvisionableCompanies: vi.fn(),
  listSubscriptionRequests: vi.fn(),
  rejectSubscriptionRequest: vi.fn(),
}));
const mailMocks = vi.hoisted(() => ({ sendMail: vi.fn().mockResolvedValue({ delivered: true, transport: "http" }) }));
const credentialMocks = vi.hoisted(() => ({
  createInvitationToken: vi.fn().mockReturnValue("t".repeat(43)),
  hashInvitationToken: vi.fn(value => `hash:${value}`),
  hashLocalPassword: vi.fn().mockResolvedValue("password-hash"),
  normalizeLocalEmail: vi.fn(value => value.trim().toLowerCase()),
  verifyLocalPassword: vi.fn().mockResolvedValue(true),
}));

vi.mock("../db", () => dbMocks);
vi.mock("../mail", () => mailMocks);
vi.mock("../localCredentials", () => credentialMocks);
vi.mock("../_core/env", () => ({ ENV: { ownerOpenId: "platform-owner", localAccessAllowedOrigins: ["https://hr.example.test"], isProduction: false } }));
vi.mock("../_core/sdk", () => ({ sdk: { createSessionToken: vi.fn().mockResolvedValue("session-token") } }));
vi.mock("../_core/cookies", () => ({ getSessionCookieOptions: vi.fn().mockReturnValue({ httpOnly: true, path: "/", sameSite: "none", secure: true }) }));

import type { TrpcContext } from "../_core/context";
import { clearLocalAccessRateLimitsForTests } from "../localAccessRateLimit";
import { localAccessRouter } from "./localAccess";

/** `null` يعني طلباً بلا ترويسة أصل — وهو مختلف عن حذف الوسيط الذي يأخذ الافتراضي. */
function publicContext(origin: string | null = "https://hr.example.test"): TrpcContext {
  return {
    user: null as unknown as TrpcContext["user"],
    req: { ip: "203.0.113.9", headers: origin === null ? {} : { origin } } as TrpcContext["req"],
    res: { cookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const validPassword = "Rakiza-9x-Falak";
const registration = { fullName: "هدى الحربي", email: " Huda@Example.Test ", companyName: "منشأة الأفق", password: validPassword };

beforeEach(() => {
  vi.clearAllMocks();
  clearLocalAccessRateLimitsForTests();
  mailMocks.sendMail.mockResolvedValue({ delivered: true, transport: "http" });
  credentialMocks.createInvitationToken.mockReturnValue("t".repeat(43));
  credentialMocks.hashInvitationToken.mockImplementation(value => `hash:${value}`);
  credentialMocks.verifyLocalPassword.mockResolvedValue(true);
  dbMocks.registerLocalAccount.mockResolvedValue({ user: { id: 21, openId: "local:new", name: "هدى الحربي" }, company: { id: 5, name: "منشأة الأفق" } });
});

describe("التسجيل الذاتي", () => {
  it("ينشئ الحساب وينظّف البريد ويرسل رابط تأكيد على أصل الطلب", async () => {
    const result = await localAccessRouter.createCaller(publicContext()).register(registration);
    expect(result).toEqual({ registered: true, email: "huda@example.test", mailDelivered: true });
    expect(dbMocks.registerLocalAccount).toHaveBeenCalledWith(expect.objectContaining({ email: "huda@example.test", companyName: "منشأة الأفق", passwordHash: "password-hash" }));
    const sent = mailMocks.sendMail.mock.calls[0][0];
    expect(sent.to).toBe("huda@example.test");
    expect(sent.tag).toBe("email_verification");
    expect(sent.body).toContain("https://hr.example.test/verify-email?token=");
  });

  it("لا يفتح جلسة عند التسجيل — التفعيل يأتي بتأكيد البريد وحده", async () => {
    const ctx = publicContext();
    await localAccessRouter.createCaller(ctx).register(registration);
    expect(ctx.res.cookie).not.toHaveBeenCalled();
  });

  it("يرفض كلمة مرور لا تجتاز السياسة قبل لمس قاعدة البيانات", async () => {
    await expect(localAccessRouter.createCaller(publicContext()).register({ ...registration, password: "password1234" })).rejects.toThrow();
    expect(dbMocks.registerLocalAccount).not.toHaveBeenCalled();
    expect(mailMocks.sendMail).not.toHaveBeenCalled();
  });

  it("يترجم تعارض البريد واسم المنشأة إلى رسالتين مختلفتين", async () => {
    dbMocks.registerLocalAccount.mockRejectedValueOnce(new Error("يوجد حساب مرتبط بهذا البريد بالفعل"));
    await expect(localAccessRouter.createCaller(publicContext()).register(registration)).rejects.toMatchObject({ code: "CONFLICT", message: expect.stringContaining("البريد") });
    clearLocalAccessRateLimitsForTests();
    dbMocks.registerLocalAccount.mockRejectedValueOnce(new Error("اسم المنشأة مسجّل مسبقاً. اطلب دعوة من مسؤول منشأتك للانضمام إليها."));
    await expect(localAccessRouter.createCaller(publicContext()).register(registration)).rejects.toMatchObject({ code: "CONFLICT", message: expect.stringContaining("المنشأة") });
  });

  it("يبني الرابط من ترويسة الطلب لا من جسمه، ويرفض أصلاً خارج القائمة", async () => {
    await expect(localAccessRouter.createCaller(publicContext("https://attacker.example.test")).register(registration)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(localAccessRouter.createCaller(publicContext(null)).register(registration)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(dbMocks.registerLocalAccount).not.toHaveBeenCalled();
  });

  it("يوقف التسجيل المتكرر من العنوان نفسه", async () => {
    const caller = localAccessRouter.createCaller(publicContext());
    dbMocks.registerLocalAccount.mockRejectedValue(new Error("يوجد حساب مرتبط بهذا البريد بالفعل"));
    for (let attempt = 0; attempt < 5; attempt += 1) await caller.register(registration).catch(() => undefined);
    await expect(caller.register(registration)).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });

  it("يبلّغ الواجهة حين تعذّر إرسال البريد بدل الادعاء بالنجاح", async () => {
    mailMocks.sendMail.mockResolvedValue({ delivered: false, transport: "draft", reason: "unconfigured" });
    await expect(localAccessRouter.createCaller(publicContext()).register(registration)).resolves.toMatchObject({ mailDelivered: false });
  });
});

describe("تأكيد البريد", () => {
  it("يفعّل الحساب ويفتح جلسة برمز صالح", async () => {
    dbMocks.verifyEmailWithToken.mockResolvedValue({ openId: "local:new", name: "هدى الحربي" });
    const ctx = publicContext();
    await expect(localAccessRouter.createCaller(ctx).verifyEmail({ token: "t".repeat(43) })).resolves.toMatchObject({ success: true });
    expect(dbMocks.verifyEmailWithToken).toHaveBeenCalledWith({ tokenHash: `hash:${"t".repeat(43)}` });
    expect(ctx.res.cookie).toHaveBeenCalled();
  });

  it("يعطي رسالة واحدة لكل أسباب فشل الرمز", async () => {
    dbMocks.verifyEmailWithToken.mockRejectedValue(new Error("رابط التأكيد غير صالح أو منتهٍ"));
    const ctx = publicContext();
    await expect(localAccessRouter.createCaller(ctx).verifyEmail({ token: "t".repeat(43) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(ctx.res.cookie).not.toHaveBeenCalled();
  });

  it("يردّ رداً عاماً عند إعادة الإرسال سواء وُجد الحساب أم لا", async () => {
    dbMocks.createEmailVerificationToken.mockResolvedValue(undefined);
    await expect(localAccessRouter.createCaller(publicContext()).resendVerification({ email: "ghost@example.test" })).resolves.toEqual({ accepted: true });
    expect(mailMocks.sendMail).not.toHaveBeenCalled();
    dbMocks.createEmailVerificationToken.mockResolvedValue({ user: { id: 21 } });
    await expect(localAccessRouter.createCaller(publicContext()).resendVerification({ email: "huda@example.test" })).resolves.toEqual({ accepted: true });
    expect(mailMocks.sendMail).toHaveBeenCalledOnce();
  });
});

describe("استعادة كلمة المرور", () => {
  it("يخفي وجود الحساب من عدمه", async () => {
    dbMocks.createPasswordResetToken.mockResolvedValue(undefined);
    const missing = await localAccessRouter.createCaller(publicContext()).requestPasswordReset({ email: "ghost@example.test" });
    dbMocks.createPasswordResetToken.mockResolvedValue({ user: { id: 21 } });
    const present = await localAccessRouter.createCaller(publicContext()).requestPasswordReset({ email: "huda@example.test" });
    expect(missing).toEqual(present);
    expect(mailMocks.sendMail).toHaveBeenCalledOnce();
    expect(mailMocks.sendMail.mock.calls[0][0].tag).toBe("password_reset");
  });

  it("يبتلع تجاوز المعدّل بردّ عام بدل خطأ يكشف المحاولة", async () => {
    dbMocks.createPasswordResetToken.mockResolvedValue({ user: { id: 21 } });
    const caller = localAccessRouter.createCaller(publicContext());
    for (let attempt = 0; attempt < 3; attempt += 1) await caller.requestPasswordReset({ email: "huda@example.test" });
    await expect(caller.requestPasswordReset({ email: "huda@example.test" })).resolves.toEqual({ accepted: true });
    expect(mailMocks.sendMail).toHaveBeenCalledTimes(3);
  });

  it("يضبط كلمة جديدة دون فتح جلسة تلقائية", async () => {
    dbMocks.resetPasswordWithToken.mockResolvedValue({ id: 21, openId: "local:new" });
    const ctx = publicContext();
    await expect(localAccessRouter.createCaller(ctx).resetPassword({ token: "t".repeat(43), password: validPassword })).resolves.toEqual({ success: true });
    expect(ctx.res.cookie).not.toHaveBeenCalled();
  });

  it("يفرض سياسة كلمة المرور على الاستعادة أيضاً", async () => {
    await expect(localAccessRouter.createCaller(publicContext()).resetPassword({ token: "t".repeat(43), password: "aaaaaaaaaaaaaa" })).rejects.toThrow();
    expect(dbMocks.resetPasswordWithToken).not.toHaveBeenCalled();
  });
});

describe("الدخول بعد إضافة تأكيد البريد", () => {
  function credential(overrides: Record<string, unknown> = {}) {
    return { credential: { id: 8, passwordHash: "password-hash", failedAttempts: 0, lockedUntil: null }, user: { id: 12, openId: "local:user", name: "عميل", accountStatus: "active", emailVerifiedAt: new Date(), ...overrides } };
  }

  it("يفصح عن عدم التأكيد فقط بعد إثبات معرفة كلمة المرور", async () => {
    dbMocks.getLocalCredentialByEmail.mockResolvedValue(credential({ accountStatus: "pending", emailVerifiedAt: null }));
    const ctx = publicContext();
    await expect(localAccessRouter.createCaller(ctx).login({ email: "huda@example.test", password: validPassword })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(ctx.res.cookie).not.toHaveBeenCalled();
  });

  it("يعطي الرسالة العامة حين تكون كلمة المرور خاطئة ولو كان الحساب غير مؤكَّد", async () => {
    dbMocks.getLocalCredentialByEmail.mockResolvedValue(credential({ accountStatus: "pending", emailVerifiedAt: null }));
    credentialMocks.verifyLocalPassword.mockResolvedValue(false);
    await expect(localAccessRouter.createCaller(publicContext()).login({ email: "huda@example.test", password: "wrong-password-here" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(dbMocks.recordLocalLoginFailure).toHaveBeenCalledWith(8, 1);
  });

  it("يبقي حسابات الدعوة القديمة تعمل رغم أن بريدها غير موسوم بالتأكيد", async () => {
    dbMocks.getLocalCredentialByEmail.mockResolvedValue(credential({ emailVerifiedAt: null, accountStatus: "active" }));
    const ctx = publicContext();
    await expect(localAccessRouter.createCaller(ctx).login({ email: "old@example.test", password: validPassword })).resolves.toMatchObject({ success: true, token: "session-token" });
    expect(ctx.res.cookie).toHaveBeenCalled();
  });

  it("يرفض الحساب الموقوف بالرسالة العامة", async () => {
    dbMocks.getLocalCredentialByEmail.mockResolvedValue(credential({ accountStatus: "suspended" }));
    await expect(localAccessRouter.createCaller(publicContext()).login({ email: "huda@example.test", password: validPassword })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("يرفض المحاولة أثناء الإغلاق دون حساب كلمة المرور", async () => {
    dbMocks.getLocalCredentialByEmail.mockResolvedValue({ credential: { id: 8, passwordHash: "password-hash", failedAttempts: 5, lockedUntil: new Date(Date.now() + 60_000) }, user: { id: 12, openId: "local:user", accountStatus: "active", emailVerifiedAt: new Date() } });
    await expect(localAccessRouter.createCaller(publicContext()).login({ email: "huda@example.test", password: validPassword })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(credentialMocks.verifyLocalPassword).not.toHaveBeenCalled();
  });
});
