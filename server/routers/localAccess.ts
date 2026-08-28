import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { sdk } from "../_core/sdk";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { activateLocalInvitation, approveSubscriptionRequest, clearLocalLoginFailures, createEmailVerificationToken, createPasswordResetToken, createSubscriptionRequest, getLocalCredentialByEmail, listProvisionableCompanies, listSubscriptionRequests, recordLocalLoginFailure, registerLocalAccount, rejectSubscriptionRequest, resetPasswordWithToken, verifyEmailWithToken } from "../db";
import { createInvitationToken, hashInvitationToken, hashLocalPassword, normalizeLocalEmail, verifyLocalPassword } from "../localCredentials";
import { consumeLocalAccessRateLimit } from "../localAccessRateLimit";
import { authMessages } from "../authMessages";
import { evaluatePassword } from "@shared/passwordPolicy";
import { sendMail } from "../mail";
import type { UserRole } from "../requestPolicy";

const roleSchema = z.enum(["user", "hr", "government", "manager", "admin"]);
const passwordSchema = z.string().max(128).superRefine((value, ctx) => {
  const verdict = evaluatePassword(value);
  if (verdict.ok) return;
  ctx.addIssue({ code: "custom", message: verdict.reason === "too_short" ? authMessages.passwordTooShort : authMessages.passwordTooWeak });
});

function requirePlatformOwner(user: { openId: string }) {
  if (!ENV.ownerOpenId || user.openId !== ENV.ownerOpenId) throw new TRPCError({ code: "FORBIDDEN", message: "هذه المراجعة مخصصة لمسؤول المنصة" });
}

function createSessionCookie(ctx: { req: Parameters<typeof getSessionCookieOptions>[0]; res: { cookie: (name: string, value: string, options: object) => void } }, token: string) {
  ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function safeOrigin(origin: string, requestOrigin: string | undefined) {
  const parsed = new URL(origin);
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) throw new TRPCError({ code: "BAD_REQUEST", message: "رابط الدعوة يحتاج أصلاً آمناً" });
  if (!requestOrigin || parsed.origin !== requestOrigin || !ENV.localAccessAllowedOrigins.includes(parsed.origin)) throw new TRPCError({ code: "BAD_REQUEST", message: "أصل رابط الدعوة غير معتمد" });
  return parsed.origin;
}

/**
 * يحدّد الأصل الذي تُبنى عليه روابط التأكيد والاستعادة.
 *
 * الأصل يأتي من ترويسة الطلب لا من جسمه، فلا يستطيع مُرسِل الطلب توجيه الرابط
 * إلى نطاق يملكه. ويُقبل فقط إن كان ضمن `LOCAL_ACCESS_ALLOWED_ORIGINS`؛ وحين
 * تكون القائمة فارغة يُسمح بالتطوير المحلي وحده حتى لا تتعطّل بيئة المطوّر.
 */
function resolveAuthOrigin(requestOrigin: string | undefined) {
  if (!requestOrigin) throw new TRPCError({ code: "BAD_REQUEST", message: authMessages.originRejected });
  let parsed: URL;
  try { parsed = new URL(requestOrigin); } catch { throw new TRPCError({ code: "BAD_REQUEST", message: authMessages.originRejected }); }
  const isLocal = parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname);
  if (ENV.localAccessAllowedOrigins.length > 0) {
    if (!ENV.localAccessAllowedOrigins.includes(parsed.origin)) throw new TRPCError({ code: "BAD_REQUEST", message: authMessages.originRejected });
    return parsed.origin;
  }
  if (ENV.isProduction || !isLocal) throw new TRPCError({ code: "BAD_REQUEST", message: authMessages.originRejected });
  return parsed.origin;
}

function requestOriginOf(req: { headers: Record<string, string | string[] | undefined> }) {
  return typeof req.headers.origin === "string" ? req.headers.origin : undefined;
}

function clientAddress(req: { ip?: string; headers: Record<string, string | string[] | undefined> }) {
  const forwarded = req.headers["x-forwarded-for"];
  return req.ip || (typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : undefined) || "unknown";
}

export const localAccessRouter = router({
  requestSubscription: publicProcedure.input(z.object({ fullName: z.string().trim().min(2).max(160), email: z.string().trim().email().max(320), companyName: z.string().trim().min(2).max(160), notes: z.string().trim().max(2000).optional() })).mutation(async ({ input }) => {
    const email = normalizeLocalEmail(input.email);
    if (!consumeLocalAccessRateLimit(`subscribe:${email}`, 4, 60 * 60 * 1000)) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "تعذر استلام الطلب حالياً، حاول لاحقاً" });
    await createSubscriptionRequest({ ...input, email });
    return { accepted: true } as const;
  }),
  listSubscriptionRequests: protectedProcedure.query(async ({ ctx }) => {
    requirePlatformOwner(ctx.user);
    return listSubscriptionRequests();
  }),
  listProvisionableCompanies: protectedProcedure.query(async ({ ctx }) => {
    requirePlatformOwner(ctx.user);
    return listProvisionableCompanies();
  }),
  reviewSubscriptionRequest: protectedProcedure.input(z.object({ requestId: z.number().int().positive(), decision: z.enum(["approved", "rejected"]), assignedRole: roleSchema, companyId: z.number().int().positive().optional(), companyName: z.string().trim().min(2).max(160).optional(), reviewNote: z.string().trim().max(1000).optional(), origin: z.string().url().optional() }).refine(value => value.decision === "rejected" || Boolean(value.companyId || value.companyName), { message: "اختر شركة قائمة أو اسماً فريداً لمنشأة جديدة" })).mutation(async ({ ctx, input }) => {
    requirePlatformOwner(ctx.user);
    if (input.decision === "rejected") return rejectSubscriptionRequest({ requestId: input.requestId, actorId: ctx.user.id, reviewNote: input.reviewNote });
    if (!input.origin) throw new TRPCError({ code: "BAD_REQUEST", message: "أصل صفحة التفعيل مطلوب" });
    const origin = safeOrigin(input.origin, typeof ctx.req.headers.origin === "string" ? ctx.req.headers.origin : undefined);
    const token = createInvitationToken();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const invitation = await approveSubscriptionRequest({ requestId: input.requestId, actorId: ctx.user.id, assignedRole: input.assignedRole as UserRole, companyId: input.companyId, companyName: input.companyName, reviewNote: input.reviewNote, tokenHash: hashInvitationToken(token), expiresAt });
    return { success: true as const, delivery: "draft" as const, recipient: invitation.request.email, activationUrl: `${origin}/activate?token=${encodeURIComponent(token)}`, expiresAt };
  }),
  activateInvitation: publicProcedure.input(z.object({ token: z.string().min(32).max(256), password: passwordSchema })).mutation(async ({ ctx, input }) => {
    let user;
    try { user = await activateLocalInvitation({ tokenHash: hashInvitationToken(input.token), passwordHash: await hashLocalPassword(input.password) }); }
    catch { throw new TRPCError({ code: "BAD_REQUEST", message: "رابط الدعوة غير صالح أو منتهٍ" }); }
    const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "مستخدم" });
    createSessionCookie(ctx, sessionToken);
    return { success: true } as const;
  }),
  login: publicProcedure.input(z.object({ email: z.string().trim().email().max(320), password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
    const email = normalizeLocalEmail(input.email);
    if (!consumeLocalAccessRateLimit(`login:${clientAddress(ctx.req)}:${email}`, 10, 15 * 60 * 1000)) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: authMessages.tooManyAttempts });
    const candidate = await getLocalCredentialByEmail(email);
    const locked = Boolean(candidate?.credential.lockedUntil && candidate.credential.lockedUntil.getTime() > Date.now());
    if (!candidate || locked) throw new TRPCError({ code: "UNAUTHORIZED", message: authMessages.loginRejected });
    const { credential, user } = candidate;
    if (!(await verifyLocalPassword(input.password, credential.passwordHash))) {
      await recordLocalLoginFailure(credential.id, credential.failedAttempts + 1);
      throw new TRPCError({ code: "UNAUTHORIZED", message: authMessages.loginRejected });
    }
    // بعد إثبات معرفة كلمة المرور فقط يجوز الإفصاح عن سبب المنع: من يعرف الكلمة
    // ليس مُعدِّداً للحسابات، وإخفاء السبب عنه يتركه عالقاً بلا مخرج.
    if (!user.emailVerifiedAt && user.accountStatus === "pending") {
      await clearLocalLoginFailures(credential.id);
      throw new TRPCError({ code: "FORBIDDEN", message: authMessages.loginUnverified });
    }
    if (user.accountStatus !== "active") throw new TRPCError({ code: "UNAUTHORIZED", message: authMessages.loginRejected });
    await clearLocalLoginFailures(credential.id);
    const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "مستخدم" });
    createSessionCookie(ctx, sessionToken);
    return { success: true } as const;
  }),

  /**
   * التسجيل الذاتي لمنشأة جديدة — بوابة المرحلة الثانية: مسار كامل بلا تدخل أدمن.
   *
   * ملاحظة أمنية مقبولة بوعي: الرد يفصح أن البريد أو اسم المنشأة مستخدم مسبقاً،
   * وهو مسار تعداد نظرياً. البديل (رد عام دائماً) يترك المستخدم عالقاً بلا تفسير
   * في منتج B2B تُستخدم فيه بُرد العمل، فاخترنا الإفصاح مع تحديد صارم للمعدّل
   * بحسب عنوان الشبكة يقيّد أي تعداد عملي.
   */
  register: publicProcedure.input(z.object({
    fullName: z.string().trim().min(2).max(160),
    email: z.string().trim().email().max(320),
    companyName: z.string().trim().min(2).max(160),
    password: passwordSchema,
  })).mutation(async ({ ctx, input }) => {
    const email = normalizeLocalEmail(input.email);
    const origin = resolveAuthOrigin(requestOriginOf(ctx.req));
    if (!consumeLocalAccessRateLimit(`register:${clientAddress(ctx.req)}`, 5, 60 * 60 * 1000)) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: authMessages.tooManyAttempts });
    const token = createInvitationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    let created;
    try {
      created = await registerLocalAccount({ fullName: input.fullName, email, companyName: input.companyName, passwordHash: await hashLocalPassword(input.password), tokenHash: hashInvitationToken(token), expiresAt });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("البريد")) throw new TRPCError({ code: "CONFLICT", message: authMessages.emailTaken });
      if (message.includes("المنشأة")) throw new TRPCError({ code: "CONFLICT", message: authMessages.companyTaken });
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذّر إنشاء الحساب حالياً" });
    }
    const delivery = await sendMail({
      to: email,
      subject: "أكّد بريدك لتفعيل حساب HR HBS",
      body: `مرحباً ${created.user.name ?? ""}

أكمل تفعيل حساب منشأة «${created.company.name}» بفتح الرابط التالي خلال 24 ساعة:

${origin}/verify-email?token=${encodeURIComponent(token)}

إن لم تطلب هذا الحساب فتجاهل الرسالة.`,
      tag: "email_verification",
    });
    return { registered: true as const, email, mailDelivered: delivery.delivered };
  }),

  /** يؤكّد ملكية البريد فيفعّل الحساب ويفتح جلسة مباشرة. */
  verifyEmail: publicProcedure.input(z.object({ token: z.string().min(32).max(256) })).mutation(async ({ ctx, input }) => {
    let user;
    try { user = await verifyEmailWithToken({ tokenHash: hashInvitationToken(input.token) }); }
    catch { throw new TRPCError({ code: "BAD_REQUEST", message: authMessages.verificationInvalid }); }
    const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "مستخدم" });
    createSessionCookie(ctx, sessionToken);
    return { success: true as const, name: user.name };
  }),

  /** يعيد إصدار رابط التأكيد. الرد عام دائماً حتى لا يكشف الحسابات المسجّلة. */
  resendVerification: publicProcedure.input(z.object({ email: z.string().trim().email().max(320) })).mutation(async ({ ctx, input }) => {
    const email = normalizeLocalEmail(input.email);
    const origin = resolveAuthOrigin(requestOriginOf(ctx.req));
    if (!consumeLocalAccessRateLimit(`resend:${email}`, 3, 60 * 60 * 1000)) return { accepted: true } as const;
    const token = createInvitationToken();
    const issued = await createEmailVerificationToken({ email, tokenHash: hashInvitationToken(token), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
    if (issued) {
      await sendMail({ to: email, subject: "رابط تأكيد جديد لحساب HR HBS", body: `افتح الرابط التالي خلال 24 ساعة لتأكيد بريدك:

${origin}/verify-email?token=${encodeURIComponent(token)}`, tag: "email_verification" });
    }
    return { accepted: true } as const;
  }),

  /** يطلب استعادة كلمة المرور. الرد واحد سواء وُجد الحساب أم لا. */
  requestPasswordReset: publicProcedure.input(z.object({ email: z.string().trim().email().max(320) })).mutation(async ({ ctx, input }) => {
    const email = normalizeLocalEmail(input.email);
    const origin = resolveAuthOrigin(requestOriginOf(ctx.req));
    if (!consumeLocalAccessRateLimit(`reset:${email}`, 3, 60 * 60 * 1000)) return { accepted: true } as const;
    const token = createInvitationToken();
    const issued = await createPasswordResetToken({ email, tokenHash: hashInvitationToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
    if (issued) {
      await sendMail({ to: email, subject: "استعادة كلمة مرور HR HBS", body: `وصلنا طلب لاستعادة كلمة مرور حسابك. افتح الرابط التالي خلال ساعة:

${origin}/reset-password?token=${encodeURIComponent(token)}

إن لم تطلب ذلك فتجاهل الرسالة؛ كلمتك الحالية تبقى كما هي.`, tag: "password_reset" });
    }
    return { accepted: true } as const;
  }),

  /**
   * يضبط كلمة مرور جديدة برمز صالح.
   * لا تُفتح جلسة تلقائياً: الرابط قد يكون وصل إلى جهاز مشترك، وإلزام الدخول
   * بالكلمة الجديدة يثبت أن من يكمل المسار هو من يعرفها.
   */
  resetPassword: publicProcedure.input(z.object({ token: z.string().min(32).max(256), password: passwordSchema })).mutation(async ({ input }) => {
    try { await resetPasswordWithToken({ tokenHash: hashInvitationToken(input.token), passwordHash: await hashLocalPassword(input.password) }); }
    catch { throw new TRPCError({ code: "BAD_REQUEST", message: authMessages.resetInvalid }); }
    return { success: true } as const;
  }),
});
