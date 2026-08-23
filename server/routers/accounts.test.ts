import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ listUserAccounts: vi.fn(), updateUserAccount: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { accountsRouter } from "./accounts";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "admin" = "admin"): TrpcContext {
  return { user: { id: 7, openId: "admin-account", name: "Admin", email: "hamid@hrhbs.com", loginMethod: "oauth", role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("accounts router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.listUserAccounts.mockResolvedValue([]); dbMocks.updateUserAccount.mockResolvedValue({ success: true }); });

  it("allows an active administrator to list pending accounts", async () => {
    const caller = accountsRouter.createCaller(context());
    await expect(caller.list({ status: "pending" })).resolves.toEqual([]);
    expect(dbMocks.listUserAccounts).toHaveBeenCalledWith("pending");
  });

  it("blocks a non-admin from viewing account records", async () => {
    const caller = accountsRouter.createCaller(context("user"));
    await expect(caller.list({})).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("records a decision through the account update helper", async () => {
    const caller = accountsRouter.createCaller(context());
    await expect(caller.update({ userId: 19, accountStatus: "active", role: "hr", note: "تمت مراجعة الحساب" })).resolves.toEqual({ success: true });
    expect(dbMocks.updateUserAccount).toHaveBeenCalledWith({ userId: 19, actorId: 7, accountStatus: "active", role: "hr", note: "تمت مراجعة الحساب" });
  });

  it("passes a complete HR and government permission matrix to the update helper", async () => {
    const caller = accountsRouter.createCaller(context());
    const modulePermissions = [{ module: "hr" as const, canView: true, canManage: false }, { module: "government" as const, canView: true, canManage: true }];
    await expect(caller.update({ userId: 19, accountStatus: "active", role: "user", modulePermissions })).resolves.toEqual({ success: true });
    expect(dbMocks.updateUserAccount).toHaveBeenCalledWith({ userId: 19, actorId: 7, accountStatus: "active", role: "user", modulePermissions });
  });

  it("does not allow an administrator to deactivate or downgrade their own account", async () => {
    const caller = accountsRouter.createCaller(context());
    await expect(caller.update({ userId: 7, accountStatus: "suspended", role: "admin" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
