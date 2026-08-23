import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ listUserAccounts: vi.fn(), updateUserAccount: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { accountsRouter } from "./accounts";
import type { TrpcContext } from "../_core/context";
import { getBootstrapAccountSettings } from "../accountPolicy";

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

  it("returns predefined job-title permission templates to an administrator", async () => {
    const caller = accountsRouter.createCaller(context());
    const templates = await caller.templates();
    expect(templates).toEqual(expect.arrayContaining([expect.objectContaining({ id: "hr-coordinator", role: "hr" }), expect.objectContaining({ id: "government-officer", role: "government" })]));
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

  it("applies a server-verified job template with its role and module permissions", async () => {
    const caller = accountsRouter.createCaller(context());
    await expect(caller.applyTemplate({ userId: 19, accountStatus: "active", templateId: "hr-coordinator" })).resolves.toEqual({ success: true });
    expect(dbMocks.updateUserAccount).toHaveBeenCalledWith(expect.objectContaining({ userId: 19, actorId: 7, accountStatus: "active", role: "hr", modulePermissions: [{ module: "hr", canView: true, canManage: true }, { module: "government", canView: false, canManage: false }] }));
  });

  it("activates a newly provisioned pending employee through an approved job template", async () => {
    expect(getBootstrapAccountSettings({ openId: "new-employee", email: "new.employee@example.com", ownerOpenId: "owner" })).toEqual({ role: "user", accountStatus: "pending" });
    const caller = accountsRouter.createCaller(context());
    await expect(caller.applyTemplate({ userId: 24, accountStatus: "active", templateId: "government-officer", note: "تفعيل موظف جديد" })).resolves.toEqual({ success: true });
    expect(dbMocks.updateUserAccount).toHaveBeenCalledWith(expect.objectContaining({ userId: 24, accountStatus: "active", role: "government", modulePermissions: [{ module: "hr", canView: false, canManage: false }, { module: "government", canView: true, canManage: true }] }));
  });

  it("does not allow an administrator to deactivate or downgrade their own account", async () => {
    const caller = accountsRouter.createCaller(context());
    await expect(caller.update({ userId: 7, accountStatus: "suspended", role: "admin" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
