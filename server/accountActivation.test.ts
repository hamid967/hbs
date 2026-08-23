import { describe, expect, it } from "vitest";
import { requestsRouter } from "./routers/requests";
import type { TrpcContext } from "./_core/context";
import { createActivationHistoryRecord, getBootstrapAccountSettings } from "./accountPolicy";

function contextWithStatus(accountStatus: "pending" | "active" | "suspended" | "rejected"): TrpcContext {
  return { user: { id: 99, openId: "account-test", name: "Account Test", email: "employee@example.com", loginMethod: "oauth", role: "user", accountStatus, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("account activation gate", () => {
  it("blocks protected work for a pending account before any feature procedure runs", async () => {
    const caller = requestsRouter.createCaller(contextWithStatus("pending"));
    await expect(caller.mine({})).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("models the employee journey from first-login pending status to an auditable activation decision", () => {
    const newEmployee = getBootstrapAccountSettings({ openId: "new-employee", email: "employee@example.com", ownerOpenId: "owner" });
    expect(newEmployee).toEqual({ role: "user", accountStatus: "pending" });
    expect(createActivationHistoryRecord({ userId: 99, actorId: 7, previousStatus: newEmployee.accountStatus, nextStatus: "active", assignedRole: "hr", note: "تمت مراجعة بيانات الحساب" })).toEqual({ userId: 99, actorId: 7, previousStatus: "pending", nextStatus: "active", assignedRole: "hr", note: "تمت مراجعة بيانات الحساب" });
  });
});
