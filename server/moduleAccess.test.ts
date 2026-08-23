import { describe, expect, it } from "vitest";
import { canManageRequest, permittedRequestTypes } from "./requestPolicy";
import { normalizeModulePermissions } from "../shared/moduleAccess";

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
});
