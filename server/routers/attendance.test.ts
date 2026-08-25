import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ assignCompanyAttendancePolicy: vi.fn(), checkInAttendance: vi.fn(), checkOutAttendance: vi.fn(), createCompanyAttendancePolicy: vi.fn(), getMyAttendanceEntry: vi.fn(), listAttendanceForScope: vi.fn(), listCompanyAttendancePolicies: vi.fn(), listCompanyEmployees: vi.fn(), listCompanyShiftAssignments: vi.fn(), recordAuditEvent: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { attendanceRouter } from "./attendance";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "manager" | "admin" = "user"): TrpcContext {
  return { user: { id: 14, openId: "attendance-user", name: "Attendance User", email: "attendance@example.com", loginMethod: "oauth", companyId: 5, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("attendance router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.getMyAttendanceEntry.mockResolvedValue(undefined); dbMocks.listAttendanceForScope.mockResolvedValue([]); dbMocks.listCompanyAttendancePolicies.mockResolvedValue([]); dbMocks.listCompanyShiftAssignments.mockResolvedValue([]); dbMocks.listCompanyEmployees.mockResolvedValue([]); dbMocks.checkInAttendance.mockResolvedValue({ id: 1 }); dbMocks.checkOutAttendance.mockResolvedValue({ id: 1, status: "completed" }); dbMocks.createCompanyAttendancePolicy.mockResolvedValue({ id: 2, companyId: 5 }); dbMocks.assignCompanyAttendancePolicy.mockResolvedValue({ id: 3, companyId: 5 }); });

  it("loads the employee own entry from the authenticated company", async () => {
    await attendanceRouter.createCaller(context()).mine();
    expect(dbMocks.getMyAttendanceEntry).toHaveBeenCalledWith(5, 14);
  });

  it("records check-in only for the authenticated employee and company", async () => {
    await attendanceRouter.createCaller(context()).checkIn({ workMode: "remote", note: "عمل عن بُعد" });
    expect(dbMocks.checkInAttendance).toHaveBeenCalledWith({ companyId: 5, userId: 14, workMode: "remote", note: "عمل عن بُعد" });
    expect(dbMocks.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({ companyId: 5, actorUserId: 14, action: "check_in", summary: "تسجيل حضور" }));
  });

  it("passes manager scope to the server for direct-team attendance", async () => {
    await attendanceRouter.createCaller(context("manager")).overview({ workDate: "2026-08-25" });
    expect(dbMocks.listAttendanceForScope).toHaveBeenCalledWith({ companyId: 5, actorId: 14, role: "manager", workDate: "2026-08-25" });
  });

  it("records check-out only for the authenticated employee and company", async () => {
    await attendanceRouter.createCaller(context("hr")).checkOut();
    expect(dbMocks.checkOutAttendance).toHaveBeenCalledWith({ companyId: 5, userId: 14 });
  });

  it("creates policies and shift assignments in the authenticated company for HR", async () => {
    const caller = attendanceRouter.createCaller(context("hr"));
    await expect(caller.schedules()).resolves.toEqual({ policies: [], assignments: [], employees: [] });
    await caller.createPolicy({ title: "وردية المكتب", startTime: "09:00", endTime: "17:00", workDays: ["sun", "mon", "tue", "wed", "thu"], graceMinutes: 10 });
    await caller.assignShift({ employeeUserId: 22, attendancePolicyId: 2, effectiveFrom: "2026-09-01" });
    expect(dbMocks.listCompanyAttendancePolicies).toHaveBeenCalledWith(5);
    expect(dbMocks.listCompanyShiftAssignments).toHaveBeenCalledWith(5);
    expect(dbMocks.createCompanyAttendancePolicy).toHaveBeenCalledWith(expect.objectContaining({ companyId: 5, createdByUserId: 14, workDays: "sun,mon,tue,wed,thu" }));
    expect(dbMocks.assignCompanyAttendancePolicy).toHaveBeenCalledWith({ companyId: 5, createdByUserId: 14, employeeUserId: 22, attendancePolicyId: 2, effectiveFrom: "2026-09-01" });
  });

  it("prevents employees and managers from managing schedules", async () => {
    await expect(attendanceRouter.createCaller(context("user")).schedules()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(attendanceRouter.createCaller(context("manager")).createPolicy({ title: "وردية", startTime: "09:00", endTime: "17:00", workDays: ["sun"], graceMinutes: 0 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
