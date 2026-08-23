import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ companyTemplatePermissions: vi.fn(), createCompanyPermissionTemplate: vi.fn(), deleteCompanyPermissionTemplate: vi.fn(), getCompanyPermissionTemplate: vi.fn(), getCompanyPermissionTemplates: vi.fn(), getUserModulePermissions: vi.fn(), listUserAccounts: vi.fn(), updateCompanyPermissionTemplate: vi.fn(), updateUserAccount: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { accountsRouter } from "./accounts";
import type { TrpcContext } from "../_core/context";
import { getBootstrapAccountSettings } from "../accountPolicy";

function context(role: "user" | "admin" = "admin"): TrpcContext {
  return { user: { id: 7, openId: "admin-account", name: "Admin", email: "admin@example.com", loginMethod: "oauth", companyId: 1, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("accounts router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.companyTemplatePermissions.mockReturnValue([{ module: "hr", canView: true, canManage: false }, { module: "government", canView: true, canManage: true }]);
    dbMocks.createCompanyPermissionTemplate.mockResolvedValue({ id: 5, companyId: 1, title: "قالب شركة" });
    dbMocks.deleteCompanyPermissionTemplate.mockResolvedValue({ success: true });
    dbMocks.getCompanyPermissionTemplate.mockResolvedValue(undefined);
    dbMocks.getCompanyPermissionTemplates.mockResolvedValue([]);
    dbMocks.getUserModulePermissions.mockResolvedValue([]);
    dbMocks.listUserAccounts.mockResolvedValue([]);
    dbMocks.updateCompanyPermissionTemplate.mockResolvedValue({ id: 5, companyId: 1, title: "قالب محدث" });
    dbMocks.updateUserAccount.mockResolvedValue({ success: true });
  });

  it("lists accounts only inside the active administrator company", async () => {
    const caller = accountsRouter.createCaller(context());
    await expect(caller.list({ status: "pending" })).resolves.toEqual([]);
    expect(dbMocks.listUserAccounts).toHaveBeenCalledWith("pending", 1);
  });

  it("returns predefined job-title permission templates to an administrator", async () => {
    const caller = accountsRouter.createCaller(context());
    await expect(caller.templates()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ id: "hr-coordinator", role: "hr" }), expect.objectContaining({ id: "government-officer", role: "government" })]));
  });

  it("creates and lists permission templates only inside the administrator company", async () => {
    const caller = accountsRouter.createCaller(context());
    await expect(caller.companyTemplates()).resolves.toEqual([]);
    expect(dbMocks.getCompanyPermissionTemplates).toHaveBeenCalledWith(1);
    const modulePermissions = [{ module: "hr" as const, canView: true, canManage: false }, { module: "government" as const, canView: true, canManage: true }];
    await expect(caller.createCompanyTemplate({ title: "مسؤول تشغيلي", description: "قالب داخلي", role: "user", modulePermissions })).resolves.toMatchObject({ id: 5 });
    expect(dbMocks.createCompanyPermissionTemplate).toHaveBeenCalledWith({ companyId: 1, createdByUserId: 7, title: "مسؤول تشغيلي", description: "قالب داخلي", role: "user", modulePermissions });
  });

  it("updates and deletes company templates only with the administrator company scope", async () => {
    const caller = accountsRouter.createCaller(context());
    const modulePermissions = [{ module: "hr" as const, canView: true, canManage: true }, { module: "government" as const, canView: false, canManage: false }];
    await expect(caller.updateCompanyTemplate({ id: 5, title: "قالب محدث", role: "hr", modulePermissions })).resolves.toMatchObject({ id: 5 });
    expect(dbMocks.updateCompanyPermissionTemplate).toHaveBeenCalledWith({ id: 5, companyId: 1, title: "قالب محدث", role: "hr", modulePermissions });
    await expect(caller.deleteCompanyTemplate({ id: 5 })).resolves.toEqual({ success: true });
    expect(dbMocks.deleteCompanyPermissionTemplate).toHaveBeenCalledWith(5, 1);
  });

  it("blocks a non-admin from viewing account records", async () => {
    const caller = accountsRouter.createCaller(context("user"));
    await expect(caller.list({})).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("records a decision through the account update helper", async () => {
    const caller = accountsRouter.createCaller(context());
    await expect(caller.update({ userId: 19, accountStatus: "active", role: "hr", note: "تمت مراجعة الحساب" })).resolves.toEqual({ success: true });
    expect(dbMocks.updateUserAccount).toHaveBeenCalledWith({ userId: 19, actorId: 7, companyId: 1, accountStatus: "active", role: "hr", note: "تمت مراجعة الحساب" });
  });

  it("passes a complete HR and government permission matrix to the update helper", async () => {
    const caller = accountsRouter.createCaller(context());
    const modulePermissions = [{ module: "hr" as const, canView: true, canManage: false }, { module: "government" as const, canView: true, canManage: true }];
    await expect(caller.update({ userId: 19, accountStatus: "active", role: "user", modulePermissions })).resolves.toEqual({ success: true });
    expect(dbMocks.updateUserAccount).toHaveBeenCalledWith({ userId: 19, actorId: 7, companyId: 1, accountStatus: "active", role: "user", modulePermissions });
  });

  it("activates a newly provisioned pending employee through an approved job template", async () => {
    expect(getBootstrapAccountSettings({ openId: "new-employee", email: "new.employee@example.com", ownerOpenId: "owner" })).toEqual({ role: "user", accountStatus: "pending" });
    const caller = accountsRouter.createCaller(context());
    await expect(caller.applyTemplate({ userId: 24, accountStatus: "active", templateId: "government-officer", note: "تفعيل موظف جديد" })).resolves.toEqual({ success: true });
    expect(dbMocks.updateUserAccount).toHaveBeenCalledWith(expect.objectContaining({ userId: 24, companyId: 1, accountStatus: "active", role: "government", modulePermissions: [{ module: "hr", canView: false, canManage: false }, { module: "government", canView: true, canManage: true }] }));
  });

  it("refuses a company template that is not available within the administrator company", async () => {
    const caller = accountsRouter.createCaller(context());
    await expect(caller.applyCompanyTemplate({ userId: 24, accountStatus: "active", templateId: 99 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(dbMocks.getCompanyPermissionTemplate).toHaveBeenCalledWith(99, 1);
  });

  it("applies a company-scoped template through the verified server record", async () => {
    dbMocks.getCompanyPermissionTemplate.mockResolvedValue({ id: 5, companyId: 1, role: "user", hrCanView: true, hrCanManage: false, governmentCanView: true, governmentCanManage: true });
    const caller = accountsRouter.createCaller(context());
    await expect(caller.applyCompanyTemplate({ userId: 24, accountStatus: "active", templateId: 5 })).resolves.toEqual({ success: true });
    expect(dbMocks.companyTemplatePermissions).toHaveBeenCalled();
    expect(dbMocks.updateUserAccount).toHaveBeenCalledWith(expect.objectContaining({ userId: 24, companyId: 1, role: "user" }));
  });

  it("does not allow an administrator to deactivate or downgrade their own account", async () => {
    const caller = accountsRouter.createCaller(context());
    await expect(caller.update({ userId: 7, accountStatus: "suspended", role: "admin" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
