import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ getLeaveManagementOverview: vi.fn(), getMyLeaveBalances: vi.fn(), listCompanyEmployees: vi.fn(), recordAuditEvent: vi.fn(), upsertCompanyLeavePolicy: vi.fn(), upsertEmployeeLeaveAllocation: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { leavesRouter } from "./leaves";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "manager" | "admin" = "user"): TrpcContext {
  return { user: { id: 14, openId: "leave-user", name: "Leave User", email: "leave@example.com", loginMethod: "oauth", companyId: 5, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("leaves router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getMyLeaveBalances.mockResolvedValue([]);
    dbMocks.getLeaveManagementOverview.mockResolvedValue({ policies: [], allocations: [] });
    dbMocks.listCompanyEmployees.mockResolvedValue([]);
    dbMocks.upsertCompanyLeavePolicy.mockResolvedValue({ id: 2, companyId: 5 });
    dbMocks.upsertEmployeeLeaveAllocation.mockResolvedValue({ id: 3, companyId: 5 });
  });

  it("returns an employee balance only for the authenticated user and company", async () => {
    await leavesRouter.createCaller(context()).mine({ allocationYear: 2026 });
    expect(dbMocks.getMyLeaveBalances).toHaveBeenCalledWith({ companyId: 5, employeeUserId: 14, allocationYear: 2026 });
  });

  it("allows HR to manage company policies and allocations", async () => {
    const caller = leavesRouter.createCaller(context("hr"));
    await caller.management({ allocationYear: 2026 });
    await caller.savePolicy({ leaveType: "annual", title: "الرصيد السنوي", referenceDays: 21, isActive: true });
    await caller.saveAllocation({ employeeUserId: 22, leavePolicyId: 2, allocationYear: 2026, allocatedDays: 21 });
    expect(dbMocks.getLeaveManagementOverview).toHaveBeenCalledWith(5, 2026);
    expect(dbMocks.listCompanyEmployees).toHaveBeenCalledWith(5);
    expect(dbMocks.upsertCompanyLeavePolicy).toHaveBeenCalledWith(expect.objectContaining({ companyId: 5, createdByUserId: 14, leaveType: "annual" }));
    expect(dbMocks.upsertEmployeeLeaveAllocation).toHaveBeenCalledWith(expect.objectContaining({ companyId: 5, allocatedByUserId: 14, employeeUserId: 22, leavePolicyId: 2 }));
  });

  it("prevents employees and managers from viewing or changing company leave settings", async () => {
    await expect(leavesRouter.createCaller(context("user")).management({ allocationYear: 2026 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(leavesRouter.createCaller(context("manager")).savePolicy({ leaveType: "sick", title: "مرضية", referenceDays: 10, isActive: true })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.upsertCompanyLeavePolicy).not.toHaveBeenCalled();
  });
});
