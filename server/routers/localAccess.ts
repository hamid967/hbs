import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { sdk } from "../_core/sdk";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { activateLocalInvitation, approveSubscriptionRequest, clearLocalLoginFailures, createSubscriptionRequest, getLocalCredentialByEmail, listProvisionableCompanies, listSubscriptionRequests, recordLocalLoginFailure, rejectSubscriptionRequest } from "../db";
import { createInvitationToken, hashInvitationToken, hashLocalPassword, normalizeLocalEmail, verifyLocalPassword } from "../localCredentials";
import { consumeLocalAccessRateLimit } from "../localAccessRateLimit";
import type { UserRole } from "../requestPolicy";

const roleSchema = z.enum(["user", "hr", "government", "manager", "admin"]);
const passwordSchema = z.string().min(12, "يجب أن تحتوي كلمة المرور على 12 حرفاً على الأقل").max(128);

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
    if (!consumeLocalAccessRateLimit(`login:${clientAddress(ctx.req)}:${email}`, 10, 15 * 60 * 1000)) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "بيانات الدخول غير صحيحة أو الحساب غير متاح" });
    const candidate = await getLocalCredentialByEmail(email);
    if (!candidate || candidate.user.accountStatus !== "active" || (candidate.credential.lockedUntil && candidate.credential.lockedUntil.getTime() > Date.now())) throw new TRPCError({ code: "UNAUTHORIZED", message: "بيانات الدخول غير صحيحة أو الحساب غير متاح" });
    const { credential, user } = candidate;
    if (!(await verifyLocalPassword(input.password, candidate.credential.passwordHash))) {
      await recordLocalLoginFailure(credential.id, credential.failedAttempts + 1);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "بيانات الدخول غير صحيحة أو الحساب غير متاح" });
    }
    await clearLocalLoginFailures(credential.id);
    const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "مستخدم" });
    createSessionCookie(ctx, sessionToken);
    return { success: true } as const;
  }),
});
