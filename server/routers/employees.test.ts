import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ assignCompanyTrainingProgram: vi.fn(), createCompanyDepartment: vi.fn(), createCompanyEmployeeLifecycleEvent: vi.fn(), createCompanyJobDesignation: vi.fn(), createCompanyTrainingProgram: vi.fn(), listCompanyDepartments: vi.fn(), listCompanyEmployeeDependents: vi.fn(), listCompanyEmployeeEmergencyContacts: vi.fn(), listCompanyEmployeeLifecycleEvents: vi.fn(), listCompanyEmployees: vi.fn(), listCompanyJobDesignations: vi.fn(), listCompanyTrainingAssignments: vi.fn(), listCompanyTrainingPrograms: vi.fn(), recordAuditEvent: vi.fn(), saveCompanyDepartmentManager: vi.fn(), saveCompanyEmployeeDependent: vi.fn(), saveCompanyEmployeeEmergencyContact: vi.fn(), saveEmployeeProfile: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { employeesRouter } from "./employees";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "manager" | "admin" = "hr"): TrpcContext {
  return { user: { id: 8, openId: "directory-manager", name: "Directory Manager", email: "manager@example.com", loginMethod: "oauth", companyId: 1, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("employees router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.listCompanyEmployees.mockResolvedValue([]); dbMocks.listCompanyDepartments.mockResolvedValue([]); dbMocks.listCompanyJobDesignations.mockResolvedValue([]); dbMocks.listCompanyEmployeeDependents.mockResolvedValue([]); dbMocks.listCompanyEmployeeEmergencyContacts.mockResolvedValue([]); dbMocks.listCompanyEmployeeLifecycleEvents.mockResolvedValue([]); dbMocks.listCompanyTrainingPrograms.mockResolvedValue([]); dbMocks.listCompanyTrainingAssignments.mockResolvedValue([]); dbMocks.recordAuditEvent.mockResolvedValue(undefined); dbMocks.createCompanyDepartment.mockResolvedValue({ id: 3, companyId: 1, name: "العمليات" }); dbMocks.createCompanyJobDesignation.mockResolvedValue({ id: 4, companyId: 1, title: "أخصائي موارد بشرية" }); dbMocks.createCompanyEmployeeLifecycleEvent.mockResolvedValue({ id: 5, companyId: 1, employeeUserId: 20 }); dbMocks.createCompanyTrainingProgram.mockResolvedValue({ id: 6, companyId: 1 }); dbMocks.assignCompanyTrainingProgram.mockResolvedValue({ id: 7, companyId: 1 }); dbMocks.saveCompanyDepartmentManager.mockResolvedValue({ id: 3, companyId: 1, managerUserId: 20 }); dbMocks.saveCompanyEmployeeDependent.mockResolvedValue({ id: 10, companyId: 1, employeeUserId: 20 }); dbMocks.saveCompanyEmployeeEmergencyContact.mockResolvedValue({ id: 9, companyId: 1, employeeUserId: 20 }); dbMocks.saveEmployeeProfile.mockResolvedValue({ id: 4, companyId: 1, userId: 20 }); });

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

  it("assigns a department manager only through the active company context", async () => {
    const caller = employeesRouter.createCaller(context("hr"));
    await expect(caller.saveDepartmentManager({ departmentId: 3, managerUserId: 20 })).resolves.toMatchObject({ id: 3 });
    expect(dbMocks.saveCompanyDepartmentManager).toHaveBeenCalledWith({ companyId: 1, departmentId: 3, managerUserId: 20 });
    await expect(employeesRouter.createCaller(context("user")).saveDepartmentManager({ departmentId: 3, managerUserId: 20 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("lists and creates designations only inside the active company", async () => {
    const caller = employeesRouter.createCaller(context("hr"));
    await expect(caller.designations()).resolves.toEqual([]);
    await expect(caller.createDesignation({ title: "أخصائي موارد بشرية", code: "HR-SP" })).resolves.toMatchObject({ id: 4 });
    expect(dbMocks.listCompanyJobDesignations).toHaveBeenCalledWith(1);
    expect(dbMocks.createCompanyJobDesignation).toHaveBeenCalledWith({ companyId: 1, createdByUserId: 8, title: "أخصائي موارد بشرية", code: "HR-SP" });
    await expect(employeesRouter.createCaller(context("user")).designations()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("saves an employee profile with the active company context", async () => {
    const caller = employeesRouter.createCaller(context("admin"));
    await expect(caller.saveProfile({ userId: 20, jobTitle: "منسق عمليات", employmentStatus: "active" })).resolves.toMatchObject({ userId: 20 });
    expect(dbMocks.saveEmployeeProfile).toHaveBeenCalledWith({ companyId: 1, updatedByUserId: 8, userId: 20, jobTitle: "منسق عمليات", employmentStatus: "active" });
  });

  it("saves an employee region within the active company context", async () => {
    const caller = employeesRouter.createCaller(context("hr"));
    await caller.saveProfile({ userId: 20, region: "الرياض", employmentStatus: "active" });
    expect(dbMocks.saveEmployeeProfile).toHaveBeenCalledWith({ companyId: 1, updatedByUserId: 8, userId: 20, region: "الرياض", employmentStatus: "active" });
  });

  it("passes an optional designation link without replacing the existing text title", async () => {
    const caller = employeesRouter.createCaller(context("hr"));
    await caller.saveProfile({ userId: 20, jobTitle: "منسق عمليات", designationId: 4, employmentStatus: "active" });
    expect(dbMocks.saveEmployeeProfile).toHaveBeenCalledWith({ companyId: 1, updatedByUserId: 8, userId: 20, jobTitle: "منسق عمليات", designationId: 4, employmentStatus: "active" });
  });

  it("saves work location within the active company context", async () => {
    const caller = employeesRouter.createCaller(context("hr"));
    await caller.saveProfile({ userId: 20, workLocation: "المقر الرئيسي", employmentStatus: "active" });
    expect(dbMocks.saveEmployeeProfile).toHaveBeenCalledWith({ companyId: 1, updatedByUserId: 8, userId: 20, workLocation: "المقر الرئيسي", employmentStatus: "active" });
  });

  it("limits emergency contacts to HR and admins while recording a generic profile event", async () => {
    const caller = employeesRouter.createCaller(context("hr"));
    await expect(caller.emergencyContacts()).resolves.toEqual([]);
    await caller.saveEmergencyContact({ employeeUserId: 20, contactName: "سارة أحمد", relationship: "قريبة", phone: "0500000000" });
    expect(dbMocks.listCompanyEmployeeEmergencyContacts).toHaveBeenCalledWith(1);
    expect(dbMocks.saveCompanyEmployeeEmergencyContact).toHaveBeenCalledWith({ companyId: 1, createdByUserId: 8, employeeUserId: 20, contactName: "سارة أحمد", relationship: "قريبة", phone: "0500000000" });
    expect(dbMocks.createCompanyEmployeeLifecycleEvent).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, employeeUserId: 20, eventType: "profile_updated", note: "تحديث بيانات ملف الموظف" }));
    await expect(employeesRouter.createCaller(context("manager")).emergencyContacts()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("limits dependent data to HR and admins within the current company", async () => {
    const caller = employeesRouter.createCaller(context("hr"));
    await expect(caller.dependents()).resolves.toEqual([]);
    await caller.saveDependent({ employeeUserId: 20, fullName: "ليان أحمد", relationship: "ابنة", birthYear: 2020 });
    expect(dbMocks.listCompanyEmployeeDependents).toHaveBeenCalledWith(1);
    expect(dbMocks.saveCompanyEmployeeDependent).toHaveBeenCalledWith({ companyId: 1, createdByUserId: 8, employeeUserId: 20, fullName: "ليان أحمد", relationship: "ابنة", birthYear: 2020 });
    expect(dbMocks.createCompanyEmployeeLifecycleEvent).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, employeeUserId: 20, eventType: "profile_updated", note: "تحديث بيانات ملف الموظف" }));
    await expect(employeesRouter.createCaller(context("manager")).dependents()).rejects.toMatchObject({ code: "FORBIDDEN" });
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
    expect(dbMocks.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, actorUserId: 8, category: "training", action: "training_program_created" }));
    expect(dbMocks.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, actorUserId: 8, category: "training", action: "training_assigned" }));
  });
});
