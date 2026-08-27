import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ buildApprovalWorkload: vi.fn(), decideApprovalTask: vi.fn(), getApprovalInbox: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { approvalsRouter } from "./approvals";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "government" | "manager" | "admin" = "hr"): TrpcContext {
  return { user: { id: 9, openId: "approver", name: "Approver", email: "approver@example.com", loginMethod: "oauth", companyId: 1, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("approvals router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.getApprovalInbox.mockResolvedValue([]); dbMocks.buildApprovalWorkload.mockReturnValue({ pending: 0, overdue: 0, oldestHours: 0, byRole: { manager: 0, hr: 0, government: 0, admin: 0 } }); dbMocks.decideApprovalTask.mockResolvedValue({ success: true }); });
  it("returns only the HR approval inbox within the current company", async () => {
    const caller = approvalsRouter.createCaller(context("hr"));
    await expect(caller.inbox()).resolves.toEqual([]);
    expect(dbMocks.getApprovalInbox).toHaveBeenCalledWith(1, 9, ["hr"]);
  });
  it("scopes the manager inbox to the signed-in manager identity", async () => {
    const caller = approvalsRouter.createCaller(context("manager"));
    await expect(caller.inbox()).resolves.toEqual([]);
    expect(dbMocks.getApprovalInbox).toHaveBeenCalledWith(1, 9, ["manager"]);
  });
  it("scopes the government-relations inbox to the signed-in unit user and matching role", async () => {
    const caller = approvalsRouter.createCaller(context("government"));
    await expect(caller.inbox()).resolves.toEqual([]);
    expect(dbMocks.getApprovalInbox).toHaveBeenCalledWith(1, 9, ["government"]);
  });
  it("blocks users without an approval role", async () => {
    const caller = approvalsRouter.createCaller(context("user"));
    await expect(caller.inbox()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("blocks unapproved users from reading approval workload", async () => {
    const caller = approvalsRouter.createCaller(context("user"));
    await expect(caller.workload()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.getApprovalInbox).not.toHaveBeenCalled();
  });
  it("builds workload from the authorized manager inbox only", async () => {
    dbMocks.getApprovalInbox.mockResolvedValue([{ task: { id: 22, status: "pending", approverRole: "manager", createdAt: new Date() } }]);
    const caller = approvalsRouter.createCaller(context("manager"));
    await expect(caller.workload()).resolves.toMatchObject({ pending: 0 });
    expect(dbMocks.getApprovalInbox).toHaveBeenCalledWith(1, 9, ["manager"]);
    expect(dbMocks.buildApprovalWorkload).toHaveBeenCalledWith({ tasks: [{ id: 22, status: "pending", approverRole: "manager", createdAt: expect.any(Date) }] });
  });
  it("passes an approval decision with company and actor context", async () => {
    const caller = approvalsRouter.createCaller(context("government"));
    await expect(caller.decide({ id: 13, decision: "approved", note: "مستند مكتمل" })).resolves.toEqual({ success: true });
    expect(dbMocks.decideApprovalTask).toHaveBeenCalledWith({ id: 13, decision: "approved", note: "مستند مكتمل", companyId: 1, actorId: 9, allowedRoles: ["government"] });
  });

  it("blocks an unapproved user from deciding and never reaches the data layer", async () => {
    const caller = approvalsRouter.createCaller(context("user"));
    await expect(caller.decide({ id: 13, decision: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.decideApprovalTask).not.toHaveBeenCalled();
  });
});
