import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ assignCompanyTrainingProgram: vi.fn(), createCompanyDepartment: vi.fn(), createCompanyEmployeeLifecycleEvent: vi.fn(), createCompanyTrainingProgram: vi.fn(), listCompanyDepartments: vi.fn(), listCompanyEmployeeLifecycleEvents: vi.fn(), listCompanyEmployees: vi.fn(), listCompanyTrainingAssignments: vi.fn(), listCompanyTrainingPrograms: vi.fn(), saveEmployeeProfile: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { employeesRouter } from "./employees";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "manager" | "admin" = "hr"): TrpcContext {
  return { user: { id: 8, openId: "directory-manager", name: "Directory Manager", email: "manager@example.com", loginMethod: "oauth", companyId: 1, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("employees router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.listCompanyEmployees.mockResolvedValue([]); dbMocks.listCompanyDepartments.mockResolvedValue([]); dbMocks.listCompanyEmployeeLifecycleEvents.mockResolvedValue([]); dbMocks.listCompanyTrainingPrograms.mockResolvedValue([]); dbMocks.listCompanyTrainingAssignments.mockResolvedValue([]); dbMocks.createCompanyDepartment.mockResolvedValue({ id: 3, companyId: 1, name: "العمليات" }); dbMocks.createCompanyEmployeeLifecycleEvent.mockResolvedValue({ id: 5, companyId: 1, employeeUserId: 20 }); dbMocks.createCompanyTrainingProgram.mockResolvedValue({ id: 6, companyId: 1 }); dbMocks.assignCompanyTrainingProgram.mockResolvedValue({ id: 7, companyId: 1 }); dbMocks.saveEmployeeProfile.mockResolvedValue({ id: 4, companyId: 1, userId: 20 }); });

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

  it("loads and records lifecycle events within the HR company context", async () => {
    const caller = employeesRouter.createCaller(context("hr"));
    await expect(caller.lifecycle()).resolves.toEqual({ employees: [], events: [] });
    await caller.createLifecycleEvent({ employeeUserId: 20, eventType: "department_changed", effectiveAt: new Date("2026-09-01T00:00:00Z"), note: "نقل داخلي" });
    expect(dbMocks.listCompanyEmployeeLifecycleEvents).toHaveBeenCalledWith(1);
    expect(dbMocks.createCompanyEmployeeLifecycleEvent).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, createdByUserId: 8, employeeUserId: 20, eventType: "department_changed" }));
  });

  it("prevents managers and employees from accessing lifecycle records", async () => {
    await expect(employeesRouter.createCaller(context("manager")).lifecycle()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(employeesRouter.createCaller(context("user")).createLifecycleEvent({ employeeUserId: 20, eventType: "joined", effectiveAt: new Date() })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("creates and assigns training within the HR company context", async () => {
    const caller = employeesRouter.createCaller(context("hr"));
    await expect(caller.training()).resolves.toEqual({ employees: [], programs: [], assignments: [] });
    await caller.createTrainingProgram({ title: "سلامة العمل", durationMinutes: 60 });
    await caller.assignTrainingProgram({ employeeUserId: 20, trainingProgramId: 6 });
    expect(dbMocks.createCompanyTrainingProgram).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, createdByUserId: 8, title: "سلامة العمل" }));
    expect(dbMocks.assignCompanyTrainingProgram).toHaveBeenCalledWith({ companyId: 1, assignedByUserId: 8, employeeUserId: 20, trainingProgramId: 6 });
  });
});
