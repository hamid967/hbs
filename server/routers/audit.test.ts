import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ listCompanyAuditEvents: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { auditRouter } from "./audit";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "manager" | "admin" = "admin"): TrpcContext {
  return { user: { id: 3, openId: "audit-user", name: "Audit User", email: "audit@example.com", loginMethod: "oauth", companyId: 12, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("audit router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.listCompanyAuditEvents.mockResolvedValue([]); });

  it("lists audit events only in the administrator company", async () => {
    await expect(auditRouter.createCaller(context()).list({ limit: 50 })).resolves.toEqual([]);
    expect(dbMocks.listCompanyAuditEvents).toHaveBeenCalledWith(12, { limit: 50 });
  });

  it("passes a validated category filter to the company-scoped data helper", async () => {
    await expect(auditRouter.createCaller(context()).list({ category: "document" })).resolves.toEqual([]);
    expect(dbMocks.listCompanyAuditEvents).toHaveBeenCalledWith(12, { category: "document" });
  });

  it("rejects audit access for non-administrator roles", async () => {
    await expect(auditRouter.createCaller(context("hr")).list({})).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.listCompanyAuditEvents).not.toHaveBeenCalled();
  });
});
