import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ createCompanyEmployeeLifecycleEvent: vi.fn(), createCompanyOffboarding: vi.fn(), listCompanyEmployees: vi.fn(), listCompanyOffboardingOverview: vi.fn(), updateCompanyOffboardingTask: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { offboardingRouter } from "./offboarding";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "manager" | "admin" = "hr"): TrpcContext {
  return { user: { id: 8, openId: "offboarding-admin", name: "Offboarding Admin", email: "offboarding@example.com", loginMethod: "oauth", companyId: 1, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("offboarding router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.listCompanyEmployees.mockResolvedValue([]);
    dbMocks.listCompanyOffboardingOverview.mockResolvedValue({ offboardings: [], tasks: [], contracts: [], documents: [] });
    dbMocks.createCompanyOffboarding.mockResolvedValue({ offboarding: { id: 3, companyId: 1, employeeUserId: 20 }, tasks: [] });
    dbMocks.updateCompanyOffboardingTask.mockResolvedValue({ offboarding: { id: 3, companyId: 1, employeeUserId: 20, status: "completed" }, completed: true, becameCompleted: true });
    dbMocks.createCompanyEmployeeLifecycleEvent.mockResolvedValue({ id: 4 });
  });

  it("restricts offboarding to HR and admins", async () => {
    await expect(offboardingRouter.createCaller(context("manager")).overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(offboardingRouter.createCaller(context("user")).start({ employeeUserId: 20 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("loads only the current company overview", async () => {
    await expect(offboardingRouter.createCaller(context("hr")).overview()).resolves.toMatchObject({ employees: [], offboardings: [], tasks: [] });
    expect(dbMocks.listCompanyEmployees).toHaveBeenCalledWith(1);
    expect(dbMocks.listCompanyOffboardingOverview).toHaveBeenCalledWith(1);
  });

  it("starts an internal checklist with a generic lifecycle event", async () => {
    await offboardingRouter.createCaller(context("admin")).start({ employeeUserId: 20, lastWorkingAt: new Date("2026-06-30T00:00:00Z") });
    expect(dbMocks.createCompanyOffboarding).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, employeeUserId: 20, createdByUserId: 8 }));
    expect(dbMocks.createCompanyEmployeeLifecycleEvent).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, employeeUserId: 20, eventType: "offboarding_started", note: "بدء قائمة إنهاء خدمة داخلية" }));
  });

  it("records completion only when the checklist becomes complete", async () => {
    const caller = offboardingRouter.createCaller(context("hr"));
    await caller.setTask({ taskId: 11, completed: true });
    expect(dbMocks.createCompanyEmployeeLifecycleEvent).toHaveBeenCalledWith(expect.objectContaining({ eventType: "offboarding_completed", employeeUserId: 20 }));
    dbMocks.updateCompanyOffboardingTask.mockResolvedValueOnce({ offboarding: { id: 3, companyId: 1, employeeUserId: 20, status: "in_progress" }, completed: false, becameCompleted: false });
    await caller.setTask({ taskId: 11, completed: false });
    expect(dbMocks.createCompanyEmployeeLifecycleEvent).toHaveBeenCalledTimes(1);
  });
});
