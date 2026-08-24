import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ createCompanyDepartment: vi.fn(), listCompanyDepartments: vi.fn(), listCompanyEmployees: vi.fn(), saveEmployeeProfile: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { employeesRouter } from "./employees";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "manager" | "admin" = "hr"): TrpcContext {
  return { user: { id: 8, openId: "directory-manager", name: "Directory Manager", email: "manager@example.com", loginMethod: "oauth", companyId: 1, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("employees router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.listCompanyEmployees.mockResolvedValue([]); dbMocks.listCompanyDepartments.mockResolvedValue([]); dbMocks.createCompanyDepartment.mockResolvedValue({ id: 3, companyId: 1, name: "العمليات" }); dbMocks.saveEmployeeProfile.mockResolvedValue({ id: 4, companyId: 1, userId: 20 }); });

  it("lists employees only within the current company for directory roles", async () => {
    const caller = employeesRouter.createCaller(context("manager"));
    await expect(caller.list()).resolves.toEqual([]);
    expect(dbMocks.listCompanyEmployees).toHaveBeenCalledWith(1);
  });

  it("prevents an ordinary employee from opening the company directory", async () => {
    const caller = employeesRouter.createCaller(context("user"));
    await expect(caller.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("creates departments within the directory manager company", async () => {
    const caller = employeesRouter.createCaller(context("hr"));
    await expect(caller.createDepartment({ name: "العمليات", code: "OPS" })).resolves.toMatchObject({ id: 3 });
    expect(dbMocks.createCompanyDepartment).toHaveBeenCalledWith({ companyId: 1, name: "العمليات", code: "OPS" });
  });

  it("saves an employee profile with the active company context", async () => {
    const caller = employeesRouter.createCaller(context("admin"));
    await expect(caller.saveProfile({ userId: 20, jobTitle: "منسق عمليات", employmentStatus: "active" })).resolves.toMatchObject({ userId: 20 });
    expect(dbMocks.saveEmployeeProfile).toHaveBeenCalledWith({ companyId: 1, userId: 20, jobTitle: "منسق عمليات", employmentStatus: "active" });
  });

  it("saves an employee region within the active company context", async () => {
    const caller = employeesRouter.createCaller(context("hr"));
    await caller.saveProfile({ userId: 20, region: "الرياض", employmentStatus: "active" });
    expect(dbMocks.saveEmployeeProfile).toHaveBeenCalledWith({ companyId: 1, userId: 20, region: "الرياض", employmentStatus: "active" });
  });
});
