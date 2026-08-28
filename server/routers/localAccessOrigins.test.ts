import { describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  approveSubscriptionRequest: vi.fn().mockResolvedValue({ request: { email: "client@example.test" } }),
  createSubscriptionRequest: vi.fn(),
  listProvisionableCompanies: vi.fn(),
  listSubscriptionRequests: vi.fn(),
  rejectSubscriptionRequest: vi.fn(),
  activateLocalInvitation: vi.fn(),
  clearLocalLoginFailures: vi.fn(),
  getLocalCredentialByEmail: vi.fn(),
  recordLocalLoginFailure: vi.fn(),
}));

vi.mock("../db", () => dbMocks);

import { ENV } from "../_core/env";
import type { TrpcContext } from "../_core/context";
import { localAccessRouter } from "./localAccess";

describe("local-access configured origins", () => {
  it("accepts the configured origin through the review tRPC endpoint", async () => {
    const origin = ENV.localAccessAllowedOrigins[0];
    expect(origin).toBeTruthy();
    const ctx: TrpcContext = {
      user: { id: 7, openId: ENV.ownerOpenId, name: "Platform Owner", email: "owner@example.test", loginMethod: "oauth", companyId: 1, role: "admin", accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { headers: { origin } } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const result = await localAccessRouter.createCaller(ctx).reviewSubscriptionRequest({ requestId: 1, decision: "approved", assignedRole: "user", companyName: "شركة اختبار", origin });
    expect(result.activationUrl.startsWith(`${origin}/activate?token=`)).toBe(true);
  });
});
