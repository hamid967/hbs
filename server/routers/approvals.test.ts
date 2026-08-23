import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ decideApprovalTask: vi.fn(), getApprovalInbox: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { approvalsRouter } from "./approvals";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "government" | "manager" | "admin" = "hr"): TrpcContext {
  return { user: { id: 9, openId: "approver", name: "Approver", email: "approver@example.com", loginMethod: "oauth", companyId: 1, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("approvals router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.getApprovalInbox.mockResolvedValue([]); dbMocks.decideApprovalTask.mockResolvedValue({ success: true }); });
  it("returns only the HR approval inbox within the current company", async () => {
    const caller = approvalsRouter.createCaller(context("hr"));
    await expect(caller.inbox()).resolves.toEqual([]);
    expect(dbMocks.getApprovalInbox).toHaveBeenCalledWith(1, ["hr"]);
  });
  it("blocks users without an approval role", async () => {
    const caller = approvalsRouter.createCaller(context("user"));
    await expect(caller.inbox()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("passes an approval decision with company and actor context", async () => {
    const caller = approvalsRouter.createCaller(context("government"));
    await expect(caller.decide({ id: 13, decision: "approved", note: "مستند مكتمل" })).resolves.toEqual({ success: true });
    expect(dbMocks.decideApprovalTask).toHaveBeenCalledWith({ id: 13, decision: "approved", note: "مستند مكتمل", companyId: 1, actorId: 9, allowedRoles: ["government"] });
  });
});
