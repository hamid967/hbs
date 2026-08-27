import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import {
  accountRoleHasPermission,
  platformRoleForAccountRole,
  resolvePlatformRole,
  roleHasPermission,
} from "../../shared/permissions";
import { assertAllSameCompany, assertSameCompany } from "../_core/tenancy";
import {
  canAccessDocument,
  canApproveContract,
  canReadCompensation,
  canReadContract,
  canReadEmployee,
  canReadSensitiveEmployeeFields,
  policyContextFromUser,
} from "./index";

const employee = { companyId: 4, userId: 50, managerUserId: 20 };
const contract = { companyId: 4, employeeUserId: 50, managerUserId: 20 };

function context(role: "user" | "hr" | "government" | "manager" | "admin", id: number, companyId = 4) {
  return policyContextFromUser({ id, companyId, role });
}

describe("permission registry compatibility", () => {
  it("maps every persisted role to its intended platform role", () => {
    expect(platformRoleForAccountRole("admin")).toBe("company_admin");
    expect(platformRoleForAccountRole("hr")).toBe("hr_admin");
    expect(platformRoleForAccountRole("government")).toBe("government_relations_officer");
    expect(platformRoleForAccountRole("manager")).toBe("direct_manager");
    expect(platformRoleForAccountRole("user")).toBe("employee");
  });

  it("does not elevate a non-admin account through the owner option", () => {
    expect(resolvePlatformRole({ role: "admin", isPlatformOwner: true })).toBe("super_admin");
    expect(resolvePlatformRole({ role: "hr", isPlatformOwner: true })).toBe("hr_admin");
    expect(roleHasPermission("company_admin", "settings.manage")).toBe(true);
    expect(accountRoleHasPermission("user", "settings.manage")).toBe(false);
  });
});

describe("tenant and record policy boundaries", () => {
  it("reports missing and foreign resources as not found", () => {
    expect(assertSameCompany({ companyId: 4, id: 1 }, 4)).toEqual({ companyId: 4, id: 1 });
    expect(() => assertSameCompany({ companyId: 5, id: 1 }, 4)).toThrow(TRPCError);
    expect(() => assertAllSameCompany([{ companyId: 4 }, { companyId: 5 }], 4)).toThrow(TRPCError);
  });

  it("does not grant employee records across tenants", () => {
    expect(canReadEmployee(context("hr", 10), { ...employee, companyId: 5 })).toBe(false);
    expect(canReadSensitiveEmployeeFields(context("admin", 1), { ...employee, companyId: 5 })).toBe(false);
  });

  it("limits direct managers to their reports and employees to themselves", () => {
    expect(canReadEmployee(context("manager", 20), employee)).toBe(true);
    expect(canReadEmployee(context("manager", 21), employee)).toBe(false);
    expect(canReadEmployee(context("user", 50), employee)).toBe(true);
    expect(canReadEmployee(context("user", 51), employee)).toBe(false);
  });

  it("restricts sensitive fields and compensation to authorized roles", () => {
    expect(canReadSensitiveEmployeeFields(context("hr", 10), employee)).toBe(true);
    expect(canReadSensitiveEmployeeFields(context("manager", 20), employee)).toBe(false);
    expect(canReadSensitiveEmployeeFields(context("user", 50), employee)).toBe(false);
    expect(canReadCompensation(context("admin", 1), contract)).toBe(true);
    expect(canReadCompensation(context("hr", 10), contract)).toBe(false);
  });

  it("requires a direct manager relationship for contract and document access", () => {
    expect(canReadContract(context("manager", 20), contract)).toBe(true);
    expect(canReadContract(context("manager", 21), contract)).toBe(false);
    expect(canAccessDocument(context("manager", 20), employee)).toBe(true);
    expect(canAccessDocument(context("manager", 21), employee)).toBe(false);
    expect(canApproveContract(context("hr", 10), contract)).toBe(true);
  });
});
