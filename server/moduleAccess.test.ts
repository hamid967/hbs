import { describe, expect, it } from "vitest";
import { canManageRequest, permittedRequestTypes } from "./requestPolicy";
import { getPermissionTemplate, normalizeModulePermissions, permissionTemplates } from "../shared/moduleAccess";

describe("module-level access", () => {
  it("allows view-only access without granting operational management", () => {
    const permissions = normalizeModulePermissions([{ module: "hr", canView: true, canManage: false }]);
    expect(permittedRequestTypes("user", permissions)).toEqual(["hr"]);
    expect(canManageRequest("user", "hr", permissions)).toBe(false);
  });

  it("keeps a scoped operator inside the explicitly assigned unit", () => {
    const permissions = normalizeModulePermissions([{ module: "government", canView: true, canManage: true }]);
    expect(canManageRequest("user", "government", permissions)).toBe(true);
    expect(canManageRequest("user", "hr", permissions)).toBe(false);
  });

  it("normalizes management permission to include view permission", () => {
    expect(normalizeModulePermissions([{ module: "hr", canView: false, canManage: true }])[0]).toEqual({ module: "hr", canView: true, canManage: true });
  });

  it("provides named templates for employee, unit specialist, observer, and shared operations roles", () => {
    expect(permissionTemplates.map(template => template.id)).toEqual(expect.arrayContaining(["employee", "hr-coordinator", "government-officer", "hr-observer", "operations-manager"]));
    expect(getPermissionTemplate("hr-observer")).toMatchObject({ role: "user", modulePermissions: expect.arrayContaining([{ module: "hr", canView: true, canManage: false }]) });
  });
});
