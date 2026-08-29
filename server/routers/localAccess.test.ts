import { beforeEach, describe, expect, it, vi } from "vitest";
const dbMocks = vi.hoisted(() => ({ activateLocalInvitation: vi.fn(), approveSubscriptionRequest: vi.fn(), clearLocalLoginFailures: vi.fn(), createSubscriptionRequest: vi.fn(), getLocalCredentialByEmail: vi.fn(), getUserByOpenId: vi.fn(), listProvisionableCompanies: vi.fn(), listSubscriptionRequests: vi.fn(), recordLocalLoginFailure: vi.fn(), rejectSubscriptionRequest: vi.fn(), upsertUser: vi.fn() }));
vi.mock("../db", () => dbMocks);
vi.mock("../_core/env", () => ({ ENV: { ownerOpenId: "platform-owner", localAccessAllowedOrigins: ["https://hr.example.test"] } }));
vi.mock("../_core/sdk", () => ({ sdk: { createSessionToken: vi.fn().mockResolvedValue("session-token") } }));
vi.mock("../_core/cookies", () => ({ getSessionCookieOptions: vi.fn().mockReturnValue({ httpOnly: true, path: "/", sameSite: "none", secure: true }) }));
const firebaseAuthMocks = vi.hoisted(() => ({ verifyGoogleIdToken: vi.fn() }));
vi.mock("../_core/firebaseAuth", () => firebaseAuthMocks);
vi.mock("../localCredentials", () => ({ createInvitationToken: vi.fn().mockReturnValue("x".repeat(43)), hashInvitationToken: vi.fn().mockReturnValue("token-hash"), hashLocalPassword: vi.fn().mockResolvedValue("password-hash"), normalizeLocalEmail: vi.fn(value => value.trim().toLowerCase()), verifyLocalPassword: vi.fn().mockResolvedValue(true) }));
import { localAccessRouter } from "./localAccess";
import type { TrpcContext } from "../_core/context";

function context(openId = "platform-owner"): TrpcContext {
  return { user: { id: 7, openId, name: "Platform Admin", email: "admin@example.test", loginMethod: "oauth", companyId: 1, role: "admin", accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { headers: { origin: "https://hr.example.test" } } as TrpcContext["req"], res: { cookie: vi.fn() } as unknown as TrpcContext["res"] };
}

describe("local access router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.createSubscriptionRequest.mockResolvedValue({ accepted: true }); dbMocks.listSubscriptionRequests.mockResolvedValue([]); dbMocks.approveSubscriptionRequest.mockResolvedValue({ request: { email: "client@example.test" } }); });
  it("accepts a public request without revealing prior account state", async () => {
    const caller = localAccessRouter.createCaller(context());
    await expect(caller.requestSubscription({ fullName: "Client", email: " CLIENT@example.test ", companyName: "Client Co", requestedRole: "admin" })).resolves.toEqual({ accepted: true });
    expect(dbMocks.createSubscriptionRequest).toHaveBeenCalledWith(expect.objectContaining({ email: "client@example.test" }));
  });
  it("limits request review and invitation creation to the platform owner", async () => {
    await expect(localAccessRouter.createCaller(context("other-admin")).listSubscriptionRequests()).rejects.toMatchObject({ code: "FORBIDDEN" });
    const caller = localAccessRouter.createCaller(context());
    const result = await caller.reviewSubscriptionRequest({ requestId: 3, decision: "approved", assignedRole: "user", companyName: "Client Co", origin: "https://hr.example.test" });
    expect(result).toMatchObject({ delivery: "draft", recipient: "client@example.test", activationUrl: expect.stringContaining("/activate?token=") });
    expect(dbMocks.approveSubscriptionRequest).toHaveBeenCalledWith(expect.objectContaining({ actorId: 7, tokenHash: "token-hash" }));
  });
  it("rejects an invitation origin outside the configured allowlist", async () => {
    const ctx = context();
    (ctx.req.headers as Record<string, string>).origin = "https://untrusted.example.test";
    await expect(localAccessRouter.createCaller(ctx).reviewSubscriptionRequest({ requestId: 3, decision: "approved", assignedRole: "user", companyName: "Client Co", origin: "https://untrusted.example.test" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(dbMocks.approveSubscriptionRequest).not.toHaveBeenCalled();
  });
  it("sets a session only after a valid local password and active account", async () => {
    dbMocks.getLocalCredentialByEmail.mockResolvedValue({ credential: { id: 8, passwordHash: "password-hash", failedAttempts: 0, lockedUntil: null }, user: { id: 12, openId: "local:user", name: "Client", accountStatus: "active" } });
    const ctx = context();
    await expect(localAccessRouter.createCaller(ctx).login({ email: "client@example.test", password: "strong-passphrase-2026" })).resolves.toEqual({ success: true });
    expect(ctx.res.cookie).toHaveBeenCalled();
    expect(dbMocks.clearLocalLoginFailures).toHaveBeenCalledWith(8);
  });
  it("records a failed password without setting a session", async () => {
    dbMocks.getLocalCredentialByEmail.mockResolvedValue({ credential: { id: 8, passwordHash: "password-hash", failedAttempts: 4, lockedUntil: null }, user: { id: 12, openId: "local:user", name: "Client", accountStatus: "active" } });
    const credentials = await import("../localCredentials");
    vi.mocked(credentials.verifyLocalPassword).mockResolvedValueOnce(false);
    const ctx = context();
    await expect(localAccessRouter.createCaller(ctx).login({ email: "client@example.test", password: "wrong-password" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(dbMocks.recordLocalLoginFailure).toHaveBeenCalledWith(8, 5);
    expect(ctx.res.cookie).not.toHaveBeenCalled();
  });
  it("starts a session only after the invitation activation helper succeeds", async () => {
    dbMocks.activateLocalInvitation.mockResolvedValue({ openId: "local:user", name: "Client" });
    const ctx = context();
    await expect(localAccessRouter.createCaller(ctx).activateInvitation({ token: "x".repeat(43), password: "strong-passphrase-2026" })).resolves.toEqual({ success: true });
    expect(ctx.res.cookie).toHaveBeenCalled();
  });
  it("rejects login for an unknown email without ever creating an account", async () => {
    dbMocks.getLocalCredentialByEmail.mockResolvedValue(undefined);
    const ctx = context();
    await expect(localAccessRouter.createCaller(ctx).login({ email: "hamid@hrhbs.com", password: "whatever-an-attacker-picks" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(ctx.res.cookie).not.toHaveBeenCalled();
  });
  it("rejects a Google login whose ID token fails verification, without touching the user store", async () => {
    firebaseAuthMocks.verifyGoogleIdToken.mockRejectedValue(new Error("invalid signature"));
    const ctx = context();
    await expect(localAccessRouter.createCaller(ctx).googleLogin({ idToken: "forged-token" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(dbMocks.upsertUser).not.toHaveBeenCalled();
    expect(ctx.res.cookie).not.toHaveBeenCalled();
  });
  it("derives the Google session identity from the verified token, not from client-supplied fields, and does not force admin", async () => {
    firebaseAuthMocks.verifyGoogleIdToken.mockResolvedValue({ uid: "google:real-uid", email: "person@example.test", name: "Real Person", emailVerified: true });
    dbMocks.upsertUser.mockResolvedValue(undefined);
    dbMocks.getUserByOpenId.mockResolvedValue({ id: 40, openId: "google:real-uid", name: "Real Person", email: "person@example.test", role: "user", accountStatus: "pending" });
    const ctx = context();
    const result = await localAccessRouter.createCaller(ctx).googleLogin({ idToken: "a-real-firebase-id-token" });
    expect(dbMocks.upsertUser).toHaveBeenCalledWith(expect.objectContaining({ openId: "google:real-uid", email: "person@example.test", loginMethod: "google" }));
    const upsertArgs = dbMocks.upsertUser.mock.calls[0][0];
    expect(upsertArgs).not.toHaveProperty("role");
    expect(upsertArgs).not.toHaveProperty("accountStatus");
    expect(result.user.role).toBe("user");
    expect(ctx.res.cookie).toHaveBeenCalled();
  });
});
