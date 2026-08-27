import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  createCompanyCostCenter: vi.fn(),
  createCompanyLegalEntity: vi.fn(),
  createCompanyOrganizationAssignment: vi.fn(),
  createCompanyOrganizationBranch: vi.fn(),
  createCompanyOrganizationTeam: vi.fn(),
  createCompanyWorkLocation: vi.fn(),
  listCompanyOrganization: vi.fn(),
}));
vi.mock("../db", () => dbMocks);

import type { TrpcContext } from "../_core/context";
import { organizationRouter } from "./organization";

function context(role: "user" | "hr" | "government" | "manager" | "admin" = "hr"): TrpcContext {
  return { user: { id: 8, openId: "organization-admin", name: "Organization Admin", email: "organization@example.com", loginMethod: "oauth", companyId: 1, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("organization router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.listCompanyOrganization.mockResolvedValue({ legalEntities: [], branches: [], teams: [], costCenters: [], workLocations: [], assignments: [] });
    dbMocks.createCompanyLegalEntity.mockResolvedValue({ id: 1, companyId: 1, name: "الكيان الرئيسي" });
    dbMocks.createCompanyOrganizationBranch.mockResolvedValue({ id: 2, companyId: 1, name: "فرع الرياض" });
    dbMocks.createCompanyOrganizationTeam.mockResolvedValue({ id: 3, companyId: 1, name: "فريق العمليات" });
    dbMocks.createCompanyCostCenter.mockResolvedValue({ id: 4, companyId: 1, name: "التشغيل", code: "OPS" });
    dbMocks.createCompanyWorkLocation.mockResolvedValue({ id: 5, companyId: 1, name: "المقر الرئيسي" });
    dbMocks.createCompanyOrganizationAssignment.mockResolvedValue({ id: 6, companyId: 1, employeeUserId: 20 });
  });

  it("allows HR to list the active company organization only", async () => {
    await expect(organizationRouter.createCaller(context("hr")).list()).resolves.toMatchObject({ legalEntities: [] });
    expect(dbMocks.listCompanyOrganization).toHaveBeenCalledWith(1);
  });

  it("rejects organization data for an ordinary employee", async () => {
    await expect(organizationRouter.createCaller(context("user")).list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows an administrator to create organization references using the active company context", async () => {
    const caller = organizationRouter.createCaller(context("admin"));
    await caller.createLegalEntity({ name: "الكيان الرئيسي", code: "MAIN" });
    await caller.createBranch({ name: "فرع الرياض", legalEntityId: 1 });
    await caller.createTeam({ name: "فريق العمليات", departmentId: 11, branchId: 2 });
    await caller.createCostCenter({ name: "التشغيل", code: "OPS" });
    await caller.createWorkLocation({ name: "المقر الرئيسي", branchId: 2 });
    expect(dbMocks.createCompanyLegalEntity).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, createdByUserId: 8 }));
    expect(dbMocks.createCompanyOrganizationBranch).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, legalEntityId: 1 }));
    expect(dbMocks.createCompanyOrganizationTeam).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, departmentId: 11, branchId: 2 }));
  });

  it("records an employee assignment through the active company context", async () => {
    const caller = organizationRouter.createCaller(context("admin"));
    await expect(caller.assignEmployee({ employeeUserId: 20, departmentId: 11, effectiveFrom: new Date("2026-08-27T00:00:00Z") })).resolves.toMatchObject({ employeeUserId: 20 });
    expect(dbMocks.createCompanyOrganizationAssignment).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, createdByUserId: 8, employeeUserId: 20, departmentId: 11 }));
  });

  it("rejects a manager from mutating organization data", async () => {
    await expect(organizationRouter.createCaller(context("manager")).createCostCenter({ name: "التشغيل", code: "OPS" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
