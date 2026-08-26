import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ addCompanyGoalProgressUpdate: vi.fn(), createCompanyEmployeeGoal: vi.fn(), createCompanyEmployeeLifecycleEvent: vi.fn(), listCompanyEmployees: vi.fn(), listCompanyGoalsOverview: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { goalsRouter } from "./goals";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "manager" | "admin" = "hr"): TrpcContext {
  return { user: { id: 8, openId: "goals-admin", name: "Goals Admin", email: "goals@example.com", loginMethod: "oauth", companyId: 1, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("goals router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.listCompanyEmployees.mockResolvedValue([]);
    dbMocks.listCompanyGoalsOverview.mockResolvedValue({ goals: [], updates: [], programs: [] });
    dbMocks.createCompanyEmployeeGoal.mockResolvedValue({ id: 4, companyId: 1, employeeUserId: 20, title: "هدف داخلي" });
    dbMocks.addCompanyGoalProgressUpdate.mockResolvedValue({ id: 4, companyId: 1, employeeUserId: 20, progressPercent: 60, status: "in_progress" });
    dbMocks.createCompanyEmployeeLifecycleEvent.mockResolvedValue({ id: 5 });
  });

  it("limits goal management to HR and admins", async () => {
    await expect(goalsRouter.createCaller(context("manager")).overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(goalsRouter.createCaller(context("user")).create({ employeeUserId: 20, title: "هدف" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("loads goal data only inside the current company", async () => {
    await expect(goalsRouter.createCaller(context("hr")).overview()).resolves.toMatchObject({ employees: [], goals: [], updates: [], programs: [] });
    expect(dbMocks.listCompanyEmployees).toHaveBeenCalledWith(1);
    expect(dbMocks.listCompanyGoalsOverview).toHaveBeenCalledWith(1);
  });

  it("creates an internal goal and a generic lifecycle event", async () => {
    await goalsRouter.createCaller(context("admin")).create({ employeeUserId: 20, title: "هدف تشغيلي" });
    expect(dbMocks.createCompanyEmployeeGoal).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, employeeUserId: 20, createdByUserId: 8 }));
    expect(dbMocks.createCompanyEmployeeLifecycleEvent).toHaveBeenCalledWith(expect.objectContaining({ employeeUserId: 20, eventType: "profile_updated", note: "إضافة هدف أداء داخلي" }));
  });

  it("records progress with an optional training context", async () => {
    await goalsRouter.createCaller(context("hr")).addProgress({ goalId: 4, progressPercent: 60, trainingProgramId: 3 });
    expect(dbMocks.addCompanyGoalProgressUpdate).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, goalId: 4, trainingProgramId: 3, progressPercent: 60, createdByUserId: 8 }));
    expect(dbMocks.createCompanyEmployeeLifecycleEvent).toHaveBeenCalledWith(expect.objectContaining({ employeeUserId: 20, note: "تحديث تقدم هدف أداء داخلي" }));
  });
});
